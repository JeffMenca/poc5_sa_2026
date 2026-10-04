export type PaymentStatus = "CHARGED" | "REFUNDED";

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}

export interface ChargeRequest {
  orderId: string;
  amount: number;
}

export type ReservationStatus = "RESERVED" | "RELEASED";

export interface Reservation {
  id: string;
  orderId: string;
  sku: string;
  quantity: number;
  status: ReservationStatus;
}

export interface ReserveRequest {
  orderId: string;
  sku: string;
  quantity: number;
}

export interface ReleaseRequest {
  orderId: string;
}

export interface StockLevel {
  sku: string;
  available: number;
}

export type ShipmentStatus = "SCHEDULED" | "CANCELLED";

export interface Shipment {
  id: string;
  orderId: string;
  city: string;
  deliveryDate: string;
  status: ShipmentStatus;
}

export interface ScheduleRequest {
  orderId: string;
  city: string;
}
