import type { DependencyKey, ResilienceSettings } from "@poc5/contracts";
import { createService } from "@poc5/service-kit";
import { DEPENDENCY_URLS, RESILIENCE_SETTINGS } from "./config";
import { OrderRepository } from "./orders/order-repository";
import { orderRoutes } from "./orders/order-routes";
import { DependencyGateway } from "./resilience/dependency-gateway";
import { PURCHASE_STEPS } from "./saga/purchase-steps";
import { PurchaseSaga } from "./saga/purchase-saga";

interface OrderServiceOptions {
  urls?: Record<DependencyKey, string>;
  settings?: ResilienceSettings;
}

export function createOrderService({ urls = DEPENDENCY_URLS, settings = RESILIENCE_SETTINGS }: OrderServiceOptions = {}) {
  const orders = new OrderRepository();
  const gateway = new DependencyGateway(urls, settings);
  const saga = new PurchaseSaga(PURCHASE_STEPS, gateway, orders);

  const app = createService({
    service: "order",
    routes: orderRoutes(saga, orders, gateway),
    reset: () => {
      orders.clear();
      gateway.reset();
    },
  });

  return { app, saga };
}
