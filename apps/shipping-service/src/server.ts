import { startService } from "@poc5/service-kit";
import { createShippingService } from "./app";

startService("shipping", createShippingService());
