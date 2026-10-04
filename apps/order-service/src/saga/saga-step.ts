import type { DependencyKey, Order } from "@poc5/contracts";
import type { HttpRequest } from "../http/http-request";

export interface SagaStep<Response = unknown> {
  service: DependencyKey;
  action: (order: Order) => HttpRequest;
  compensation: (order: Order) => HttpRequest;
  remember: (order: Order, response: Response) => void;
}

export function defineStep<Response>(step: SagaStep<Response>): SagaStep {
  return step as SagaStep;
}
