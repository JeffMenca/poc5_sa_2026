import { startService } from "@poc5/service-kit";
import { createOrderService } from "./app";
import { COMPENSATION_RETRY_INTERVAL_MS } from "./config";

const { app, saga } = createOrderService();

startService("order", app);

setInterval(() => saga.retryPendingCompensations(), COMPENSATION_RETRY_INTERVAL_MS);
