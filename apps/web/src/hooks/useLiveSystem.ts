"use client";

import { useEffect, useState } from "react";
import {
  SERVICE_KEYS,
  type BreakerSnapshot,
  type DependencyKey,
  type HealthReport,
  type Order,
  type Payment,
  type Reservation,
  type SagaLogEntry,
  type ServiceKey,
  type Shipment,
  type StockLevel,
} from "@poc5/contracts";
import { api } from "@/lib/api";

const POLL_INTERVAL_MS = 600;
const PACKET_LIFETIME_MS = 4_000;
const PACKET_STAGGER_S = 0.45;

export type PacketKind = "ok" | "rejected" | "cut" | "undo";

export interface Packet {
  id: string;
  service: DependencyKey;
  kind: PacketKind;
  delay: number;
  bornAt: number;
}

export interface LiveSystem {
  health: Partial<Record<ServiceKey, HealthReport>>;
  orders: Order[];
  breakers: BreakerSnapshot[];
  payments: Payment[];
  stock: StockLevel[];
  reservations: Reservation[];
  shipments: Shipment[];
  packets: Packet[];
  observedAt: number;
}

const EMPTY: LiveSystem = {
  health: {},
  orders: [],
  breakers: [],
  payments: [],
  stock: [],
  reservations: [],
  shipments: [],
  packets: [],
  observedAt: 0,
};

const orEmpty = <T,>(promise: Promise<T>, fallback: T) => promise.catch(() => fallback);

function packetKind(entry: SagaLogEntry): PacketKind {
  if (entry.outcome === "unavailable") return "cut";
  if (entry.phase === "compensate") return "undo";
  return entry.outcome === "succeeded" ? "ok" : "rejected";
}

class PacketTracker {
  private readonly seen = new Map<string, number>();
  private primed = false;

  collect(orders: Order[], now: number): Packet[] {
    const fresh: Packet[] = [];
    for (const order of orders) {
      const known = this.seen.get(order.id) ?? 0;
      order.log.slice(known).forEach((entry, offset) => {
        if (!this.primed || entry.service === "order") return;
        fresh.push({
          id: `${order.id}-${known + offset}`,
          service: entry.service,
          kind: packetKind(entry),
          delay: fresh.length * PACKET_STAGGER_S,
          bornAt: now,
        });
      });
      this.seen.set(order.id, order.log.length);
    }
    this.primed = true;
    return fresh;
  }
}

async function observe(): Promise<Omit<LiveSystem, "packets" | "observedAt">> {
  const healthReports = await Promise.all(
    SERVICE_KEYS.map((service) => orEmpty(api.health(service).then((report) => [service, report] as const), null)),
  );
  const [orders, breakers, payments, inventory, shipments] = await Promise.all([
    orEmpty(api.orders(), []),
    orEmpty(api.breakers(), []),
    orEmpty(api.payments(), []),
    orEmpty(api.inventory(), { stock: [], reservations: [] }),
    orEmpty(api.shipments(), []),
  ]);

  return {
    health: Object.fromEntries(healthReports.filter((entry) => entry !== null)),
    orders,
    breakers,
    payments,
    stock: inventory.stock,
    reservations: inventory.reservations,
    shipments,
  };
}

export function useLiveSystem(): LiveSystem {
  const [system, setSystem] = useState<LiveSystem>(EMPTY);

  useEffect(() => {
    let active = true;
    const tracker = new PacketTracker();

    async function pollWhileMounted() {
      while (active) {
        const snapshot = await observe();
        const now = Date.now();
        const fresh = tracker.collect(snapshot.orders, now);
        if (active) {
          setSystem((previous) => ({
            ...snapshot,
            packets: [...previous.packets.filter((packet) => now - packet.bornAt < PACKET_LIFETIME_MS + packet.delay * 1000), ...fresh],
            observedAt: now,
          }));
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
    }

    pollWhileMounted();
    return () => {
      active = false;
    };
  }, []);

  return system;
}
