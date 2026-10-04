import { COVERED_CITIES, type ScheduleRequest, type Shipment } from "@poc5/contracts";
import { DomainError, newId, notFound } from "@poc5/service-kit";

const DELIVERY_DAYS = 3;

export class DispatchDesk {
  private readonly shipments = new Map<string, Shipment>();

  schedule({ orderId, city }: ScheduleRequest): { shipment: Shipment; created: boolean } {
    const existing = this.findByOrder(orderId);
    if (existing) return { shipment: existing, created: false };

    if (!COVERED_CITIES.includes(city)) {
      throw new DomainError(422, "OUT_OF_COVERAGE", `We do not deliver to ${city}`);
    }

    const shipment: Shipment = {
      id: newId("shp"),
      orderId,
      city,
      deliveryDate: deliveryDateFromToday(DELIVERY_DAYS),
      status: "SCHEDULED",
    };
    this.shipments.set(shipment.id, shipment);
    return { shipment, created: true };
  }

  cancel(shipmentId: string): Shipment {
    const shipment = this.shipments.get(shipmentId);
    if (!shipment) throw notFound("Shipment", shipmentId);

    shipment.status = "CANCELLED";
    return shipment;
  }

  list(): Shipment[] {
    return [...this.shipments.values()].reverse();
  }

  clear(): void {
    this.shipments.clear();
  }

  private findByOrder(orderId: string): Shipment | undefined {
    return [...this.shipments.values()].find((shipment) => shipment.orderId === orderId);
  }
}

function deliveryDateFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
