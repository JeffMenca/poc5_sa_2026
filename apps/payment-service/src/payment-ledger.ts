import { CARD_LIMIT, type ChargeRequest, type Payment } from "@poc5/contracts";
import { DomainError, newId, notFound } from "@poc5/service-kit";

export class PaymentLedger {
  private readonly payments = new Map<string, Payment>();

  charge({ orderId, amount }: ChargeRequest): { payment: Payment; created: boolean } {
    const existing = this.findByOrder(orderId);
    if (existing) return { payment: existing, created: false };

    if (amount > CARD_LIMIT) {
      throw new DomainError(402, "PAYMENT_DECLINED", `Card declined: Q${amount} exceeds the Q${CARD_LIMIT} limit`);
    }

    const payment: Payment = {
      id: newId("pay"),
      orderId,
      amount,
      status: "CHARGED",
      createdAt: new Date().toISOString(),
    };
    this.payments.set(payment.id, payment);
    return { payment, created: true };
  }

  refund(paymentId: string): Payment {
    const payment = this.payments.get(paymentId);
    if (!payment) throw notFound("Payment", paymentId);

    payment.status = "REFUNDED";
    return payment;
  }

  list(): Payment[] {
    return [...this.payments.values()].reverse();
  }

  clear(): void {
    this.payments.clear();
  }

  private findByOrder(orderId: string): Payment | undefined {
    return [...this.payments.values()].find((payment) => payment.orderId === orderId);
  }
}
