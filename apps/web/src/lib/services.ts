import {
  CreditCardIcon,
  NoteIcon,
  PackageIcon,
  PaperAirplaneIcon,
  type Icon,
} from "@primer/octicons-react";
import type { ServiceKey } from "@poc5/contracts";

export interface ServiceMeta {
  name: string;
  icon: Icon;
  action: string;
  undo: string;
  port: number;
}

export const SERVICES: Record<ServiceKey, ServiceMeta> = {
  order: { name: "Order", icon: NoteIcon, action: "Crear orden", undo: "Cancelar orden", port: 4001 },
  payment: { name: "Payment", icon: CreditCardIcon, action: "Cobrar", undo: "Reembolsar", port: 4002 },
  inventory: { name: "Inventory", icon: PackageIcon, action: "Reservar stock", undo: "Liberar stock", port: 4003 },
  shipping: { name: "Shipping", icon: PaperAirplaneIcon, action: "Programar envío", undo: "Cancelar envío", port: 4004 },
};
