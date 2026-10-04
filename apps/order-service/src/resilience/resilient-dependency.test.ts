import { Router } from "express";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ResilienceSettings } from "@poc5/contracts";
import { createService, DomainError, testServer, type TestServer } from "@poc5/service-kit";
import { HttpError } from "../http/http-request";
import { ResilientDependency } from "./resilient-dependency";
import { ServiceUnavailableError } from "./service-unavailable-error";

type Behavior = "ok" | "fail" | "reject" | "slow" | "hang";

const FAST_SETTINGS: ResilienceSettings = {
  failureRateThreshold: 50,
  slowCallRateThreshold: 50,
  slowCallDurationThresholdMs: 100,
  waitDurationInOpenStateMs: 200,
  slidingWindowSize: 10,
  minimumNumberOfCalls: 5,
  permittedNumberOfCallsInHalfOpenState: 3,
  timeoutMs: 300,
  retryAttempts: 0,
  retryIntervalMs: 10,
  maxConcurrentCalls: 5,
  maxQueuedCalls: 10,
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("ResilientDependency", () => {
  let server: TestServer;
  let behaviors: Behavior[];
  let hits: number;
  let dependency: ResilientDependency;

  const respondWith = (...next: Behavior[]) => (behaviors = next);
  const callRepeatedly = (times: number) =>
    Promise.allSettled(Array.from({ length: times }, () => dependency.call({ method: "POST", path: "/work" })));
  const stateOf = async () => (await dependency.snapshot()).state;

  beforeEach(async () => {
    hits = 0;
    behaviors = ["ok"];
    const routes = Router().post("/work", async (_req, res) => {
      hits++;
      const behavior = behaviors.length > 1 ? behaviors.shift()! : behaviors[0];
      if (behavior === "fail") return res.status(500).json({ code: "SIMULATED_FAILURE", message: "boom" });
      if (behavior === "reject") throw new DomainError(409, "OUT_OF_STOCK", "No stock");
      if (behavior === "slow") await wait(150);
      if (behavior === "hang") await wait(600);
      res.json({ ok: true });
    });
    server = await testServer(createService({ service: "inventory", routes, reset: () => {} }));
    dependency = new ResilientDependency("inventory", server.url, FAST_SETTINGS);
  });

  afterEach(async () => {
    dependency.reset();
    await server.close();
  });

  it("stays closed while calls succeed", async () => {
    await callRepeatedly(10);

    expect(await stateOf()).toBe("closed");
  });

  it("opens when half of the calls in the window fail", async () => {
    respondWith("fail");

    await callRepeatedly(5);

    expect(await stateOf()).toBe("open");
  });

  it("does not count business rejections as failures", async () => {
    respondWith("reject");

    const results = await callRepeatedly(10);

    expect(await stateOf()).toBe("closed");
    expect(results[0]).toMatchObject({ status: "rejected", reason: expect.any(HttpError) });
  });

  it("answers with the fallback without calling the service while open", async () => {
    respondWith("fail");
    await callRepeatedly(5);
    const hitsWhenOpened = hits;

    const call = dependency.call({ method: "POST", path: "/work" });

    await expect(call).rejects.toBeInstanceOf(ServiceUnavailableError);
    expect(hits).toBe(hitsWhenOpened);
    expect((await dependency.snapshot()).shortCircuitedCalls).toBe(1);
  });

  it("moves to half-open after the wait and closes after three successful trial calls", async () => {
    respondWith("fail");
    await callRepeatedly(5);
    await wait(FAST_SETTINGS.waitDurationInOpenStateMs + 50);

    expect(await stateOf()).toBe("half-open");

    respondWith("ok");
    await callRepeatedly(3);

    expect(await stateOf()).toBe("closed");
  });

  it("opens again when the trial calls in half-open fail", async () => {
    respondWith("fail");
    await callRepeatedly(5);
    await wait(FAST_SETTINGS.waitDurationInOpenStateMs + 50);

    await callRepeatedly(3);

    expect(await stateOf()).toBe("open");
  });

  it("opens when half of the calls are slow even if they succeed", async () => {
    respondWith("slow");

    await callRepeatedly(5);

    expect((await dependency.snapshot()).state).toBe("open");
  });

  it("gives up on a call that exceeds the timeout", async () => {
    respondWith("hang");

    await expect(dependency.call({ method: "POST", path: "/work" })).rejects.toMatchObject({
      reason: "Timed out",
    });
  });

  it("retries a transient failure before giving up", async () => {
    const retrying = new ResilientDependency("inventory", server.url, { ...FAST_SETTINGS, retryAttempts: 1 });
    respondWith("fail", "ok");

    await expect(retrying.call({ method: "POST", path: "/work" })).resolves.toEqual({ ok: true });
    expect(hits).toBe(2);
    retrying.reset();
  });
});
