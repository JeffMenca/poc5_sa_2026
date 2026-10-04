import type { ErrorCode } from "./errors";
import type { DependencyKey, ServiceKey } from "./services";

export type OrderStatus = "PENDING" | "COMPLETED" | "COMPENSATING" | "CANCELLED";

export type SagaPhase = "execute" | "compensate";

export type StepOutcome = "succeeded" | "rejected" | "unavailable";

export interface SagaLogEntry {
  at: string;
  service: ServiceKey;
  phase: SagaPhase;
  request: string;
  outcome: StepOutcome;
  durationMs: number;
  code?: ErrorCode;
  message?: string;
}

export interface SagaFailure {
  service: ServiceKey;
  code: ErrorCode;
  message: string;
}

export interface Order {
  id: string;
  sku: string;
  quantity: number;
  city: string;
  amount: number;
  status: OrderStatus;
  paymentId?: string;
  reservationId?: string;
  shipmentId?: string;
  completedSteps: DependencyKey[];
  pendingCompensations: DependencyKey[];
  failure?: SagaFailure;
  log: SagaLogEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaceOrderRequest {
  sku: string;
  quantity: number;
  city: string;
}
