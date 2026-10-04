import { CATALOG, findProduct, type Reservation, type ReserveRequest, type StockLevel } from "@poc5/contracts";
import { DomainError, newId } from "@poc5/service-kit";

export class StockKeeper {
  private readonly stock = new Map<string, number>();
  private readonly reservations = new Map<string, Reservation>();

  constructor() {
    this.clear();
  }

  reserve({ orderId, sku, quantity }: ReserveRequest): { reservation: Reservation; created: boolean } {
    const existing = this.reservations.get(orderId);
    if (existing?.status === "RESERVED") return { reservation: existing, created: false };

    if (!findProduct(sku)) throw new DomainError(422, "INVALID_REQUEST", `Unknown product ${sku}`);

    const available = this.stock.get(sku) ?? 0;
    if (available < quantity) {
      throw new DomainError(409, "OUT_OF_STOCK", `Only ${available} units of ${sku} left, ${quantity} requested`);
    }

    this.stock.set(sku, available - quantity);
    const reservation: Reservation = { id: newId("res"), orderId, sku, quantity, status: "RESERVED" };
    this.reservations.set(orderId, reservation);
    return { reservation, created: true };
  }

  release(orderId: string): Reservation | undefined {
    const reservation = this.reservations.get(orderId);
    if (reservation?.status !== "RESERVED") return reservation;

    this.stock.set(reservation.sku, (this.stock.get(reservation.sku) ?? 0) + reservation.quantity);
    reservation.status = "RELEASED";
    return reservation;
  }

  levels(): StockLevel[] {
    return [...this.stock].map(([sku, available]) => ({ sku, available }));
  }

  listReservations(): Reservation[] {
    return [...this.reservations.values()].reverse();
  }

  clear(): void {
    this.reservations.clear();
    for (const product of CATALOG) this.stock.set(product.sku, product.initialStock);
  }
}
