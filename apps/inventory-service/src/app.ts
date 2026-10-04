import { createService } from "@poc5/service-kit";
import { StockKeeper } from "./stock-keeper";
import { inventoryRoutes } from "./inventory-routes";

export function createInventoryService() {
  const keeper = new StockKeeper();
  return createService({ service: "inventory", routes: inventoryRoutes(keeper), reset: () => keeper.clear() });
}
