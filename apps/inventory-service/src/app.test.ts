import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { testServer, type TestServer } from "@poc5/service-kit";
import { createInventoryService } from "./app";

describe("Inventory service", () => {
  let server: TestServer;

  const availableOf = async (sku: string) => {
    const { body } = await server.request("GET", "/inventory");
    return body.stock.find((level: { sku: string }) => level.sku === sku).available;
  };

  beforeEach(async () => {
    server = await testServer(createInventoryService());
  });

  afterEach(() => server.close());

  it("reserves stock and lowers the available units", async () => {
    const before = await availableOf("MONITOR");

    const response = await server.request("POST", "/inventory/reserve", { orderId: "ord_1", sku: "MONITOR", quantity: 2 });

    expect(response.status).toBe(201);
    expect(await availableOf("MONITOR")).toBe(before - 2);
  });

  it("does not reserve twice for the same order", async () => {
    await server.request("POST", "/inventory/reserve", { orderId: "ord_1", sku: "MONITOR", quantity: 2 });
    const before = await availableOf("MONITOR");

    const repeated = await server.request("POST", "/inventory/reserve", { orderId: "ord_1", sku: "MONITOR", quantity: 2 });

    expect(repeated.status).toBe(200);
    expect(await availableOf("MONITOR")).toBe(before);
  });

  it("rejects a reservation when there is not enough stock", async () => {
    const response = await server.request("POST", "/inventory/reserve", { orderId: "ord_1", sku: "HEADPHONES", quantity: 1 });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("OUT_OF_STOCK");
  });

  it("returns the units when a reservation is released", async () => {
    const before = await availableOf("KEYBOARD");
    await server.request("POST", "/inventory/reserve", { orderId: "ord_1", sku: "KEYBOARD", quantity: 3 });

    const response = await server.request("POST", "/inventory/release", { orderId: "ord_1" });

    expect(response.body).toEqual({ orderId: "ord_1", released: true });
    expect(await availableOf("KEYBOARD")).toBe(before);
  });

  it("treats releasing an unknown order as a no-op", async () => {
    const response = await server.request("POST", "/inventory/release", { orderId: "ord_unknown" });

    expect(response.status).toBe(200);
    expect(response.body.released).toBe(false);
  });

  it("restores the initial stock on reset", async () => {
    const initial = await availableOf("KEYBOARD");
    await server.request("POST", "/inventory/reserve", { orderId: "ord_1", sku: "KEYBOARD", quantity: 5 });

    await server.request("POST", "/admin/reset");

    expect(await availableOf("KEYBOARD")).toBe(initial);
  });
});
