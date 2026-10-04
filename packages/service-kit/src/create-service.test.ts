import { Router } from "express";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createService } from "./create-service";
import { DomainError } from "./domain-error";
import { testServer, type TestServer } from "./test-server";

describe("createService", () => {
  let server: TestServer;
  let resets: number;

  beforeEach(async () => {
    resets = 0;
    const routes = Router()
      .get("/ping", (_req, res) => res.json({ pong: true }))
      .post("/ping", (_req, res) => res.json({ pong: true }))
      .get("/rejected", () => {
        throw new DomainError(409, "OUT_OF_STOCK", "No stock left");
      });
    server = await testServer(createService({ service: "payment", routes, reset: () => resets++ }));
  });

  afterEach(() => server.close());

  it("serves business routes while healthy", async () => {
    const response = await server.request("GET", "/ping");

    expect(response).toEqual({ status: 200, body: { pong: true } });
  });

  it("translates a domain error into its status and code", async () => {
    const response = await server.request("GET", "/rejected");

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ code: "OUT_OF_STOCK", message: "No stock left" });
  });

  it("fails commands with 500 when chaos is set to failing", async () => {
    await server.request("PUT", "/chaos", { mode: "failing" });

    const response = await server.request("POST", "/ping");

    expect(response.status).toBe(500);
    expect(response.body.code).toBe("SIMULATED_FAILURE");
  });

  it("keeps queries readable while chaos is active", async () => {
    await server.request("PUT", "/chaos", { mode: "failing" });

    const response = await server.request("GET", "/ping");

    expect(response.status).toBe(200);
  });

  it("keeps health reachable while chaos is active", async () => {
    await server.request("PUT", "/chaos", { mode: "failing" });

    const response = await server.request("GET", "/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ service: "payment", chaos: "failing" });
  });

  it("rejects an unknown chaos mode", async () => {
    const response = await server.request("PUT", "/chaos", { mode: "exploding" });

    expect(response.status).toBe(400);
  });

  it("restores healthy mode and the service data on reset", async () => {
    await server.request("PUT", "/chaos", { mode: "failing" });

    await server.request("POST", "/admin/reset");

    expect((await server.request("POST", "/ping")).status).toBe(200);
    expect(resets).toBe(1);
  });
});
