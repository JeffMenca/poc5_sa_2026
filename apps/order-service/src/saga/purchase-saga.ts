import type { DependencyKey, ErrorCode, Order, PlaceOrderRequest, SagaLogEntry, SagaPhase, StepOutcome } from "@poc5/contracts";
import { findProduct } from "@poc5/contracts";
import { DomainError } from "@poc5/service-kit";
import { describeRequest, type HttpRequest } from "../http/http-request";
import type { OrderRepository } from "../orders/order-repository";
import { isBusinessRejection } from "../resilience/failure-classification";
import type { ServiceCaller } from "../resilience/dependency-gateway";
import { ServiceUnavailableError } from "../resilience/service-unavailable-error";
import type { SagaStep } from "./saga-step";

type StepResult = { outcome: "succeeded"; response: unknown } | { outcome: Exclude<StepOutcome, "succeeded"> };

export class PurchaseSaga {
  private readonly compensationsInProgress = new Set<string>();

  constructor(
    private readonly steps: SagaStep[],
    private readonly services: ServiceCaller,
    private readonly orders: OrderRepository,
  ) {}

  async place(request: PlaceOrderRequest): Promise<Order> {
    const product = findProduct(request.sku);
    if (!product) throw new DomainError(400, "INVALID_REQUEST", `Unknown product ${request.sku}`);

    const order = this.orders.create(request, product.price * request.quantity);
    this.record(order, { service: "order", phase: "execute", request: "POST /orders", outcome: "succeeded", durationMs: 0 });

    for (const step of this.steps) {
      const result = await this.run(order, step, "execute", step.action(order));
      if (result.outcome !== "succeeded") return this.compensate(order);

      step.remember(order, result.response);
      order.completedSteps.push(step.service);
    }

    order.status = "COMPLETED";
    return order;
  }

  async cancel(order: Order): Promise<Order> {
    if (order.status !== "COMPLETED") return order;
    return this.compensate(order);
  }

  async retryPendingCompensations(): Promise<void> {
    await Promise.all(this.orders.compensating().map((order) => this.runCompensations(order)));
  }

  private async compensate(order: Order): Promise<Order> {
    order.status = "COMPENSATING";
    order.pendingCompensations = [...order.completedSteps].reverse();
    await this.runCompensations(order);
    return order;
  }

  private async runCompensations(order: Order): Promise<void> {
    if (this.compensationsInProgress.has(order.id)) return;
    this.compensationsInProgress.add(order.id);

    try {
      for (const service of [...order.pendingCompensations]) {
        const step = this.stepFor(service);
        const result = await this.run(order, step, "compensate", step.compensation(order));
        if (result.outcome === "unavailable") return;

        order.pendingCompensations.shift();
      }
      this.cancelLocally(order);
    } finally {
      this.compensationsInProgress.delete(order.id);
    }
  }

  private cancelLocally(order: Order): void {
    order.status = "CANCELLED";
    this.record(order, {
      service: "order",
      phase: "compensate",
      request: `DELETE /orders/${order.id}`,
      outcome: "succeeded",
      durationMs: 0,
    });
  }

  private async run(order: Order, step: SagaStep, phase: SagaPhase, request: HttpRequest): Promise<StepResult> {
    const startedAt = performance.now();
    const elapsed = () => Math.round(performance.now() - startedAt);
    const entry = { service: step.service, phase, request: describeRequest(request) };

    try {
      const response = await this.services.call(step.service, request);
      this.record(order, { ...entry, outcome: "succeeded", durationMs: elapsed() });
      return { outcome: "succeeded", response };
    } catch (error) {
      const outcome = isBusinessRejection(error) ? "rejected" : "unavailable";
      const { code, message } = describeFailure(error);
      this.record(order, { ...entry, outcome, durationMs: elapsed(), code, message });
      if (phase === "execute") order.failure = { service: step.service, code, message };
      return { outcome };
    }
  }

  private record(order: Order, entry: Omit<SagaLogEntry, "at">): void {
    const at = new Date().toISOString();
    order.log.push({ at, ...entry });
    order.updatedAt = at;
  }

  private stepFor(service: DependencyKey): SagaStep {
    const step = this.steps.find((candidate) => candidate.service === service);
    if (!step) throw new Error(`No saga step for ${service}`);
    return step;
  }
}

function describeFailure(error: unknown): { code: ErrorCode; message: string } {
  if (isBusinessRejection(error) || error instanceof ServiceUnavailableError) {
    return { code: error.code, message: error.message };
  }
  return { code: "INTERNAL_ERROR", message: error instanceof Error ? error.message : String(error) };
}
