import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { testServer, type TestServer } from "@poc5/service-kit";
import { createShippingService } from "./app";

describe("Shipping service", () => {
  let server: TestServer;

  beforeEach(async () => {
    server = await testServer(createShippingService());
  });

  afterEach(() => server.close());

  it("schedules a delivery to a covered city", async () => {
    const response = await server.request("POST", "/shipping/schedule", { orderId: "ord_1", city: "Quetzaltenango" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ orderId: "ord_1", status: "SCHEDULED" });
    expect(response.body.deliveryDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("rejects a city outside the delivery coverage", async () => {
    const response = await server.request("POST", "/shipping/schedule", { orderId: "ord_1", city: "Flores" });

    expect(response.status).toBe(422);
    expect(response.body.code).toBe("OUT_OF_COVERAGE");
  });

  it("returns the same shipment when the same order is scheduled twice", async () => {
    const first = await server.request("POST", "/shipping/schedule", { orderId: "ord_1", city: "Guatemala" });

    const second = await server.request("POST", "/shipping/schedule", { orderId: "ord_1", city: "Guatemala" });

    expect(second.body.id).toBe(first.body.id);
  });

  it("cancels a scheduled shipment", async () => {
    const { body: shipment } = await server.request("POST", "/shipping/schedule", { orderId: "ord_1", city: "Guatemala" });

    const response = await server.request("DELETE", `/shipping/${shipment.id}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("CANCELLED");
  });

  it("answers 404 when cancelling an unknown shipment", async () => {
    const response = await server.request("DELETE", "/shipping/shp_missing");

    expect(response.status).toBe(404);
  });
});
