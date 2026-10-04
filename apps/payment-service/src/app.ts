import { createService } from "@poc5/service-kit";
import { PaymentLedger } from "./payment-ledger";
import { paymentRoutes } from "./payment-routes";

export function createPaymentService() {
  const ledger = new PaymentLedger();
  return createService({ service: "payment", routes: paymentRoutes(ledger), reset: () => ledger.clear() });
}
