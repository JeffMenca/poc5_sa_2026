import type { ChaosMode } from "./chaos";

export const SERVICE_KEYS = ["order", "payment", "inventory", "shipping"] as const;

export type ServiceKey = (typeof SERVICE_KEYS)[number];

export type DependencyKey = Exclude<ServiceKey, "order">;

export const SERVICE_PORTS: Record<ServiceKey, number> = {
  order: 4001,
  payment: 4002,
  inventory: 4003,
  shipping: 4004,
};

export function localServiceUrl(service: ServiceKey): string {
  return `http://localhost:${SERVICE_PORTS[service]}`;
}

export interface HealthReport {
  service: ServiceKey;
  status: "up";
  chaos: ChaosMode;
  uptimeSeconds: number;
}
