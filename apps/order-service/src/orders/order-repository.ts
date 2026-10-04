import type { Order, PlaceOrderRequest } from "@poc5/contracts";
import { newId } from "@poc5/service-kit";

const LISTED_ORDERS = 50;

export class OrderRepository {
  private readonly orders = new Map<string, Order>();

  create(request: PlaceOrderRequest, amount: number): Order {
    const now = new Date().toISOString();
    const order: Order = {
      id: newId("ord"),
      ...request,
      amount,
      status: "PENDING",
      completedSteps: [],
      pendingCompensations: [],
      log: [],
      createdAt: now,
      updatedAt: now,
    };
    this.orders.set(order.id, order);
    return order;
  }

  find(id: string): Order | undefined {
    return this.orders.get(id);
  }

  list(): Order[] {
    return [...this.orders.values()].reverse().slice(0, LISTED_ORDERS);
  }

  compensating(): Order[] {
    return [...this.orders.values()].filter((order) => order.status === "COMPENSATING");
  }

  clear(): void {
    this.orders.clear();
  }
}
