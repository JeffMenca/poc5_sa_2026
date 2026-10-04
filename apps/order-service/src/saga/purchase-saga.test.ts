import { beforeEach, describe, expect, it } from "vitest";
import type { DependencyKey } from "@poc5/contracts";
import { HttpError, describeRequest, type HttpRequest } from "../http/http-request";
import { OrderRepository } from "../orders/order-repository";
import type { ServiceCaller } from "../resilience/dependency-gateway";
import { ServiceUnavailableError } from "../resilience/service-unavailable-error";
import { PURCHASE_STEPS } from "./purchase-steps";
import { PurchaseSaga } from "./purchase-saga";

const RESPONSES: Record<string, unknown> = {
  "POST /payments": { id: "pay_1" },
  "POST /inventory/reserve": { id: "res_1" },
  "POST /shipping/schedule": { id: "shp_1" },
};

class FakeServices implements ServiceCaller {
  readonly calls: string[] = [];
  private readonly failures = new Map<string, Error>();

  failOn(request: string, error: Error): void {
    this.failures.set(request, error);
  }

  recover(request: string): void {
    this.failures.delete(request);
  }

  async call<T>(_service: DependencyKey, request: HttpRequest): Promise<T> {
    const description = describeRequest(request);
    this.calls.push(description);
    const failure = this.failures.get(description);
    if (failure) throw failure;
    return (RESPONSES[description] ?? {}) as T;
  }
}

const KEYBOARD_TO_XELA = { sku: "KEYBOARD", quantity: 1, city: "Quetzaltenango" };

describe("PurchaseSaga", () => {
  let services: FakeServices;
  let saga: PurchaseSaga;

  beforeEach(() => {
    services = new FakeServices();
    saga = new PurchaseSaga(PURCHASE_STEPS, services, new OrderRepository());
  });

  it("completes the order when every step succeeds", async () => {
    const order = await saga.place(KEYBOARD_TO_XELA);

    expect(order.status).toBe("COMPLETED");
    expect(services.calls).toEqual(["POST /payments", "POST /inventory/reserve", "POST /shipping/schedule"]);
    expect(order).toMatchObject({ paymentId: "pay_1", reservationId: "res_1", shipmentId: "shp_1", amount: 450 });
  });

  it("cancels the order without compensations when the payment is declined", async () => {
    services.failOn("POST /payments", new HttpError(402, "PAYMENT_DECLINED", "Card declined"));

    const order = await saga.place(KEYBOARD_TO_XELA);

    expect(order.status).toBe("CANCELLED");
    expect(order.failure).toMatchObject({ service: "payment", code: "PAYMENT_DECLINED" });
    expect(services.calls).toEqual(["POST /payments"]);
  });

  it("refunds the payment and cancels the order when there is no stock", async () => {
    services.failOn("POST /inventory/reserve", new HttpError(409, "OUT_OF_STOCK", "No stock"));

    const order = await saga.place(KEYBOARD_TO_XELA);

    expect(order.status).toBe("CANCELLED");
    expect(services.calls).toEqual(["POST /payments", "POST /inventory/reserve", "POST /payments/pay_1/refund"]);
    expect(order.log.at(-1)).toMatchObject({ service: "order", phase: "compensate", request: `DELETE /orders/${order.id}` });
  });

  it("compensates in reverse order when shipping rejects the city", async () => {
    services.failOn("POST /shipping/schedule", new HttpError(422, "OUT_OF_COVERAGE", "Not covered"));

    const order = await saga.place({ ...KEYBOARD_TO_XELA, city: "Flores" });

    expect(services.calls.slice(3)).toEqual(["POST /inventory/release", "POST /payments/pay_1/refund"]);
    expect(order.status).toBe("CANCELLED");
  });

  it("compensates and reports the fallback when a dependency is unavailable", async () => {
    services.failOn("POST /inventory/reserve", new ServiceUnavailableError("inventory", "Circuit is opened"));

    const order = await saga.place(KEYBOARD_TO_XELA);

    expect(order.failure).toMatchObject({ service: "inventory", code: "SERVICE_UNAVAILABLE" });
    expect(order.log.find((entry) => entry.service === "inventory")?.outcome).toBe("unavailable");
    expect(order.status).toBe("CANCELLED");
  });

  it("keeps a failed compensation pending and finishes it once the service recovers", async () => {
    services.failOn("POST /inventory/reserve", new HttpError(409, "OUT_OF_STOCK", "No stock"));
    services.failOn("POST /payments/pay_1/refund", new ServiceUnavailableError("payment", "Timed out"));

    const order = await saga.place(KEYBOARD_TO_XELA);

    expect(order.status).toBe("COMPENSATING");
    expect(order.pendingCompensations).toEqual(["payment"]);

    services.recover("POST /payments/pay_1/refund");
    await saga.retryPendingCompensations();

    expect(order.status).toBe("CANCELLED");
    expect(order.pendingCompensations).toEqual([]);
  });

  it("undoes every step when a completed order is cancelled", async () => {
    const order = await saga.place(KEYBOARD_TO_XELA);

    await saga.cancel(order);

    expect(services.calls.slice(3)).toEqual([
      "DELETE /shipping/shp_1",
      "POST /inventory/release",
      "POST /payments/pay_1/refund",
    ]);
    expect(order.status).toBe("CANCELLED");
  });

  it("does not compensate twice when an order is cancelled again", async () => {
    const order = await saga.place(KEYBOARD_TO_XELA);
    await saga.cancel(order);
    const callsAfterFirstCancel = services.calls.length;

    await saga.cancel(order);

    expect(services.calls).toHaveLength(callsAfterFirstCancel);
  });

  it("rejects an unknown product before touching any service", async () => {
    await expect(saga.place({ ...KEYBOARD_TO_XELA, sku: "SPACESHIP" })).rejects.toMatchObject({ status: 400 });
    expect(services.calls).toEqual([]);
  });
});
