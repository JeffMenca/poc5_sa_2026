import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { testServer, type TestServer } from "@poc5/service-kit";
import { createPaymentService } from "./app";

describe("Payment service", () => {
  let server: TestServer;

  beforeEach(async () => {
    server = await testServer(createPaymentService());
  });

  afterEach(() => server.close());

  it("charges the customer", async () => {
    const response = await server.request("POST", "/payments", { orderId: "ord_1", amount: 450 });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ orderId: "ord_1", amount: 450, status: "CHARGED" });
  });

  it("returns the same payment when the same order is charged twice", async () => {
    const first = await server.request("POST", "/payments", { orderId: "ord_1", amount: 450 });

    const second = await server.request("POST", "/payments", { orderId: "ord_1", amount: 450 });

    expect(second.status).toBe(200);
    expect(second.body.id).toBe(first.body.id);
  });

  it("declines a charge above the card limit", async () => {
    const response = await server.request("POST", "/payments", { orderId: "ord_1", amount: 9_000 });

    expect(response.status).toBe(402);
    expect(response.body.code).toBe("PAYMENT_DECLINED");
  });

  it("refunds a payment and tolerates a repeated refund", async () => {
    const { body: payment } = await server.request("POST", "/payments", { orderId: "ord_1", amount: 450 });

    await server.request("POST", `/payments/${payment.id}/refund`);
    const repeated = await server.request("POST", `/payments/${payment.id}/refund`);

    expect(repeated.status).toBe(200);
    expect(repeated.body.status).toBe("REFUNDED");
  });

  it("answers 404 when refunding an unknown payment", async () => {
    const response = await server.request("POST", "/payments/pay_missing/refund");

    expect(response.status).toBe(404);
  });

  it("rejects a charge without an amount", async () => {
    const response = await server.request("POST", "/payments", { orderId: "ord_1" });

    expect(response.status).toBe(400);
  });
});
