import {
  localServiceUrl,
  type BreakerSnapshot,
  type ChaosMode,
  type HealthReport,
  type Order,
  type Payment,
  type PlaceOrderRequest,
  type Reservation,
  type ServiceKey,
  type Shipment,
  type StockLevel,
} from "@poc5/contracts";

const SERVICE_URLS: Record<ServiceKey, string> = {
  order: process.env.NEXT_PUBLIC_ORDER_URL || localServiceUrl("order"),
  payment: process.env.NEXT_PUBLIC_PAYMENT_URL || localServiceUrl("payment"),
  inventory: process.env.NEXT_PUBLIC_INVENTORY_URL || localServiceUrl("inventory"),
  shipping: process.env.NEXT_PUBLIC_SHIPPING_URL || localServiceUrl("shipping"),
};

export interface HttpResult<T> {
  status: number;
  body: T;
}

async function request<T>(service: ServiceKey, method: string, path: string, body?: unknown): Promise<HttpResult<T>> {
  const response = await fetch(`${SERVICE_URLS[service]}${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const text = await response.text();
  return { status: response.status, body: (text ? JSON.parse(text) : undefined) as T };
}

async function read<T>(service: ServiceKey, path: string): Promise<T> {
  return (await request<T>(service, "GET", path)).body;
}

export const api = {
  health: (service: ServiceKey) => read<HealthReport>(service, "/health"),
  setChaos: (service: ServiceKey, mode: ChaosMode) => request(service, "PUT", "/chaos", { mode }),
  reset: (service: ServiceKey) => request(service, "POST", "/admin/reset"),

  orders: () => read<Order[]>("order", "/orders"),
  placeOrder: (order: PlaceOrderRequest) => request<Order>("order", "POST", "/orders", order),
  cancelOrder: (id: string) => request<Order>("order", "DELETE", `/orders/${id}`),
  breakers: () => read<BreakerSnapshot[]>("order", "/resilience"),

  payments: () => read<Payment[]>("payment", "/payments"),
  inventory: () => read<{ stock: StockLevel[]; reservations: Reservation[] }>("inventory", "/inventory"),
  shipments: () => read<Shipment[]>("shipping", "/shipping"),
};
