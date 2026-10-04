import type { DependencyKey } from "./services";

export type BreakerState = "closed" | "open" | "half-open";

export type CallResult = "success" | "failure" | "slow";

export interface ResilienceSettings {
  failureRateThreshold: number;
  slowCallRateThreshold: number;
  slowCallDurationThresholdMs: number;
  waitDurationInOpenStateMs: number;
  slidingWindowSize: number;
  minimumNumberOfCalls: number;
  permittedNumberOfCallsInHalfOpenState: number;
  timeoutMs: number;
  retryAttempts: number;
  retryIntervalMs: number;
  maxConcurrentCalls: number;
  maxQueuedCalls: number;
}

export interface BreakerTransition {
  to: BreakerState;
  at: string;
}

export interface BreakerSnapshot {
  dependency: DependencyKey;
  state: BreakerState;
  stateSince: string;
  window: CallResult[];
  failureRate: number;
  slowCallRate: number;
  shortCircuitedCalls: number;
  transitions: BreakerTransition[];
  settings: ResilienceSettings;
}
