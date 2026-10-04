import { Router } from "express";
import { z } from "zod";
import { parseBody } from "@poc5/service-kit";
import type { PaymentLedger } from "./payment-ledger";

const chargeSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive(),
});

export function paymentRoutes(ledger: PaymentLedger): Router {
  return Router()
    .get("/payments", (_req, res) => {
      res.json(ledger.list());
    })
    .post("/payments", (req, res) => {
      const { payment, created } = ledger.charge(parseBody(chargeSchema, req.body));
      res.status(created ? 201 : 200).json(payment);
    })
    .post("/payments/:id/refund", (req, res) => {
      res.json(ledger.refund(req.params.id));
    });
}
