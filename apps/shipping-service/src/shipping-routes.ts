import { Router } from "express";
import { z } from "zod";
import { parseBody } from "@poc5/service-kit";
import type { DispatchDesk } from "./dispatch-desk";

const scheduleSchema = z.object({
  orderId: z.string().min(1),
  city: z.string().min(1),
});

export function shippingRoutes(desk: DispatchDesk): Router {
  return Router()
    .get("/shipping", (_req, res) => {
      res.json(desk.list());
    })
    .post("/shipping/schedule", (req, res) => {
      const { shipment, created } = desk.schedule(parseBody(scheduleSchema, req.body));
      res.status(created ? 201 : 200).json(shipment);
    })
    .delete("/shipping/:id", (req, res) => {
      res.json(desk.cancel(req.params.id));
    });
}
