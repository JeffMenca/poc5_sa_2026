import {
  Bulkhead,
  Circuit,
  Fallback,
  Retry,
  SlidingCountBreaker,
  SlidingWindowRequestResult,
  Timeout,
  type Module,
} from "mollitia";
import type {
  BreakerSnapshot,
  BreakerState,
  BreakerTransition,
  CallResult,
  DependencyKey,
  ResilienceSettings,
} from "@poc5/contracts";
import { sendJson, type HttpRequest } from "../http/http-request";
import { isBusinessRejection, isRetryable, isShortCircuit, isTechnicalFailure } from "./failure-classification";
import { ServiceUnavailableError } from "./service-unavailable-error";

const STATE_NAMES: Record<string, BreakerState> = {
  closed: "closed",
  opened: "open",
  "half-opened": "half-open",
};

const CALL_RESULTS: Record<SlidingWindowRequestResult, CallResult> = {
  [SlidingWindowRequestResult.SUCCESS]: "success",
  [SlidingWindowRequestResult.FAILURE]: "failure",
  [SlidingWindowRequestResult.TIMEOUT]: "slow",
};

export class ResilientDependency {
  private circuit!: Circuit;
  private breaker!: SlidingCountBreaker;
  private transitions: BreakerTransition[] = [];
  private shortCircuitedCalls = 0;

  constructor(
    readonly name: DependencyKey,
    private readonly baseUrl: string,
    private readonly settings: ResilienceSettings,
  ) {
    this.build();
  }

  call<T>(request: HttpRequest): Promise<T> {
    return this.circuit.execute<T>(request);
  }

  async snapshot(): Promise<BreakerSnapshot> {
    const { requests } = await this.breaker.getState();
    const window = requests.map((request) => CALL_RESULTS[request.result]);
    const rateOf = (result: CallResult) =>
      window.length === 0 ? 0 : Math.round((window.filter((r) => r === result).length / window.length) * 100);

    return {
      dependency: this.name,
      state: STATE_NAMES[this.breaker.state] ?? "closed",
      stateSince: new Date(this.breaker.stateTimestamp).toISOString(),
      window,
      failureRate: rateOf("failure"),
      slowCallRate: rateOf("slow"),
      shortCircuitedCalls: this.shortCircuitedCalls,
      transitions: this.transitions,
      settings: this.settings,
    };
  }

  reset(): void {
    this.circuit.dispose();
    this.transitions = [];
    this.shortCircuitedCalls = 0;
    this.build();
  }

  private build(): void {
    this.breaker = this.createBreaker();
    this.circuit = new Circuit({
      name: this.name,
      func: (request: HttpRequest) => sendJson(this.baseUrl, request),
      options: { modules: this.createModules(this.breaker) },
    });
  }

  private createBreaker(): SlidingCountBreaker {
    const settings = this.settings;
    const breaker = new SlidingCountBreaker({
      failureRateThreshold: settings.failureRateThreshold,
      slowCallRateThreshold: settings.slowCallRateThreshold,
      slowCallDurationThreshold: settings.slowCallDurationThresholdMs,
      openStateDelay: settings.waitDurationInOpenStateMs,
      slidingWindowSize: settings.slidingWindowSize,
      minimumNumberOfCalls: settings.minimumNumberOfCalls,
      permittedNumberOfCallsInHalfOpenState: settings.permittedNumberOfCallsInHalfOpenState,
      onError: isTechnicalFailure,
    });

    breaker.on("state-changed", (state: string) => {
      this.transitions.push({ to: STATE_NAMES[state] ?? "closed", at: new Date().toISOString() });
    });
    return breaker;
  }

  private createModules(breaker: SlidingCountBreaker): Module[] {
    const settings = this.settings;
    return [
      new Fallback({ callback: (error: unknown) => this.fallback(error) }),
      new Retry({ attempts: settings.retryAttempts, interval: settings.retryIntervalMs, onRejection: isRetryable }),
      breaker,
      new Timeout({ delay: settings.timeoutMs }),
      new Bulkhead({
        concurrentSize: settings.maxConcurrentCalls,
        queueSize: settings.maxQueuedCalls,
        maxQueueWait: settings.timeoutMs,
      }),
    ];
  }

  private fallback(error: unknown): Error {
    if (isBusinessRejection(error)) return error;
    if (isShortCircuit(error)) this.shortCircuitedCalls++;

    const reason = error instanceof Error ? error.message : String(error);
    return new ServiceUnavailableError(this.name, reason);
  }
}
