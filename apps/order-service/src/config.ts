import { localServiceUrl, type DependencyKey, type ResilienceSettings } from "@poc5/contracts";

export const RESILIENCE_SETTINGS: ResilienceSettings = {
  failureRateThreshold: 50,
  slowCallRateThreshold: 50,
  slowCallDurationThresholdMs: 1_000,
  waitDurationInOpenStateMs: 10_000,
  slidingWindowSize: 10,
  minimumNumberOfCalls: 5,
  permittedNumberOfCallsInHalfOpenState: 3,
  timeoutMs: 2_000,
  retryAttempts: 1,
  retryIntervalMs: 200,
  maxConcurrentCalls: 5,
  maxQueuedCalls: 10,
};

export const DEPENDENCY_URLS: Record<DependencyKey, string> = {
  payment: process.env.PAYMENT_URL ?? localServiceUrl("payment"),
  inventory: process.env.INVENTORY_URL ?? localServiceUrl("inventory"),
  shipping: process.env.SHIPPING_URL ?? localServiceUrl("shipping"),
};

export const COMPENSATION_RETRY_INTERVAL_MS = 5_000;
