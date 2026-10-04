import { startService } from "@poc5/service-kit";
import { createInventoryService } from "./app";

startService("inventory", createInventoryService());
