import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { BreakerSnapshot, Order } from "@poc5/contracts";
import { testServer, type TestServer } from "@poc5/service-kit";
import { createInventoryService } from "@poc5/inventory-service";
import { createPaymentService } from "@poc5/payment-service";
import { createShippingService } from "@poc5/shipping-service";
import { createOrderService } from "./app";
import { RESILIENCE_SETTINGS } from "./config";

describe("the four services wired over HTTP", () => {
  let payment: TestServer;
  let inventory: TestServer;
  let shipping: TestServer;
  let order: TestServer;

  const placeOrder = (sku: string, quantity: number, city: string) =>
    order.request("POST", "/orders", { sku, quantity, city });

  beforeAll(async () => {
    [payment, inventory, shipping] = await Promise.all([
      testServer(createPaymentService()),
      testServer(createInventoryService()),
      testServer(createShippingService()),
    ]);
    const { app } = createOrderService({
      urls: { payment: payment.url, inventory: inventory.url, shipping: shipping.url },
      settings: { ...RESILIENCE_SETTINGS, retryAttempts: 0 },
    });
    order = await testServer(app);
  });

  beforeEach(async () => {
    await Promise.all([payment, inventory, shipping, order].map((server) => server.request("POST", "/admin/reset")));
  });

  afterAll(async () => {
    await Promise.all([payment, inventory, shipping, order].map((server) => server.close()));
  });

  it("charges, reserves and ships a successful order", async () => {
    const { status, body } = await placeOrder("KEYBOARD", 2, "Quetzaltenango");

    expect(status).toBe(201);
    expect((body as Order).status).toBe("COMPLETED");
    expect((await payment.request("GET", "/payments")).body[0]).toMatchObject({ amount: 900, status: "CHARGED" });
    expect((await shipping.request("GET", "/shipping")).body[0]).toMatchObject({ status: "SCHEDULED" });
  });

  it("refunds the charge when inventory has no stock", async () => {
    const { status, body } = await placeOrder("HEADPHONES", 1, "Quetzaltenango");

    expect(status).toBe(422);
    expect((body as Order).failure?.code).toBe("OUT_OF_STOCK");
    expect((await payment.request("GET", "/payments")).body[0].status).toBe("REFUNDED");
  });

  it("returns the fallback answer when a dependency is failing", async () => {
    await inventory.request("PUT", "/chaos", { mode: "failing" });

    const { status, body } = await placeOrder("KEYBOARD", 1, "Guatemala");

    expect(status).toBe(503);
    expect((body as Order).failure).toMatchObject({ service: "inventory", code: "SERVICE_UNAVAILABLE" });
    expect((await payment.request("GET", "/payments")).body[0].status).toBe("REFUNDED");
  });

  it("opens the inventory breaker after repeated failures", async () => {
    await inventory.request("PUT", "/chaos", { mode: "failing" });

    for (let attempt = 0; attempt < RESILIENCE_SETTINGS.minimumNumberOfCalls; attempt++) {
      await placeOrder("KEYBOARD", 1, "Guatemala");
    }

    const snapshots: BreakerSnapshot[] = (await order.request("GET", "/resilience")).body;
    expect(snapshots.find((snapshot) => snapshot.dependency === "inventory")?.state).toBe("open");
    expect(snapshots.find((snapshot) => snapshot.dependency === "payment")?.state).toBe("closed");
  });

  it("undoes a completed order through DELETE /orders/:id", async () => {
    const { body: placed } = await placeOrder("MONITOR", 1, "Antigua Guatemala");

    const { status, body } = await order.request("DELETE", `/orders/${placed.id}`);

    expect(status).toBe(200);
    expect((body as Order).status).toBe("CANCELLED");
    expect((await shipping.request("GET", "/shipping")).body[0].status).toBe("CANCELLED");
    expect((await inventory.request("GET", "/inventory")).body.reservations[0].status).toBe("RELEASED");
  });
});
