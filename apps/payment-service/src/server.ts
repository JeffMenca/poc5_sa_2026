import { startService } from "@poc5/service-kit";
import { createPaymentService } from "./app";

startService("payment", createPaymentService());
