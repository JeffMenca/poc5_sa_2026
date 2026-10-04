import { Router } from "express";
import { z } from "zod";
import type { Order } from "@poc5/contracts";
import { notFound, parseBody } from "@poc5/service-kit";
import type { DependencyGateway } from "../resilience/dependency-gateway";
import type { PurchaseSaga } from "../saga/purchase-saga";
import type { OrderRepository } from "./order-repository";

const placeOrderSchema = z.object({
  sku: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  city: z.string().min(1),
});

export function orderRoutes(saga: PurchaseSaga, orders: OrderRepository, gateway: DependencyGateway): Router {
  const findOrder = (id: string): Order => {
    const order = orders.find(id);
    if (!order) throw notFound("Order", id);
    return order;
  };

  return Router()
    .get("/orders", (_req, res) => {
      res.json(orders.list());
    })
    .get("/orders/:id", (req, res) => {
      res.json(findOrder(req.params.id));
    })
    .post("/orders", async (req, res) => {
      const order = await saga.place(parseBody(placeOrderSchema, req.body));
      res.status(statusForPlacedOrder(order)).json(order);
    })
    .delete("/orders/:id", async (req, res) => {
      const order = await saga.cancel(findOrder(req.params.id));
      res.status(order.status === "COMPENSATING" ? 202 : 200).json(order);
    })
    .get("/resilience", async (_req, res) => {
      res.json(await gateway.snapshots());
    });
}

function statusForPlacedOrder(order: Order): number {
  if (order.status === "COMPLETED") return 201;
  if (order.failure?.code === "SERVICE_UNAVAILABLE") return 503;
  return 422;
}
