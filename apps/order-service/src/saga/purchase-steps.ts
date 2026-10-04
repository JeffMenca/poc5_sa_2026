import type { Payment, Reservation, Shipment } from "@poc5/contracts";
import { defineStep, type SagaStep } from "./saga-step";

export const PURCHASE_STEPS: SagaStep[] = [
  defineStep<Payment>({
    service: "payment",
    action: (order) => ({ method: "POST", path: "/payments", body: { orderId: order.id, amount: order.amount } }),
    compensation: (order) => ({ method: "POST", path: `/payments/${order.paymentId}/refund` }),
    remember: (order, payment) => (order.paymentId = payment.id),
  }),
  defineStep<Reservation>({
    service: "inventory",
    action: (order) => ({
      method: "POST",
      path: "/inventory/reserve",
      body: { orderId: order.id, sku: order.sku, quantity: order.quantity },
    }),
    compensation: (order) => ({ method: "POST", path: "/inventory/release", body: { orderId: order.id } }),
    remember: (order, reservation) => (order.reservationId = reservation.id),
  }),
  defineStep<Shipment>({
    service: "shipping",
    action: (order) => ({ method: "POST", path: "/shipping/schedule", body: { orderId: order.id, city: order.city } }),
    compensation: (order) => ({ method: "DELETE", path: `/shipping/${order.shipmentId}` }),
    remember: (order, shipment) => (order.shipmentId = shipment.id),
  }),
];
