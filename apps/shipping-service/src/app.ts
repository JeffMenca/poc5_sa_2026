import { createService } from "@poc5/service-kit";
import { DispatchDesk } from "./dispatch-desk";
import { shippingRoutes } from "./shipping-routes";

export function createShippingService() {
  const desk = new DispatchDesk();
  return createService({ service: "shipping", routes: shippingRoutes(desk), reset: () => desk.clear() });
}
