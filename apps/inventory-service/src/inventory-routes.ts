import { Router } from "express";
import { z } from "zod";
import { parseBody } from "@poc5/service-kit";
import type { StockKeeper } from "./stock-keeper";

const reserveSchema = z.object({
  orderId: z.string().min(1),
  sku: z.string().min(1),
  quantity: z.number().int().positive(),
});

const releaseSchema = z.object({
  orderId: z.string().min(1),
});

export function inventoryRoutes(keeper: StockKeeper): Router {
  return Router()
    .get("/inventory", (_req, res) => {
      res.json({ stock: keeper.levels(), reservations: keeper.listReservations() });
    })
    .post("/inventory/reserve", (req, res) => {
      const { reservation, created } = keeper.reserve(parseBody(reserveSchema, req.body));
      res.status(created ? 201 : 200).json(reservation);
    })
    .post("/inventory/release", (req, res) => {
      const { orderId } = parseBody(releaseSchema, req.body);
      const reservation = keeper.release(orderId);
      res.json({ orderId, released: reservation?.status === "RELEASED" });
    });
}
