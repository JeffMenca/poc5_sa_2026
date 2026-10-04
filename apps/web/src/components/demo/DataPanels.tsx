"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CATALOG, type DependencyKey } from "@poc5/contracts";
import type { LiveSystem } from "@/hooks/useLiveSystem";
import { PRODUCT_LABELS, formatQuetzales } from "@/lib/labels";
import { SERVICES } from "@/lib/services";

const STATUS_COLORS: Record<string, string> = {
  CHARGED: "var(--success)",
  RESERVED: "var(--success)",
  SCHEDULED: "var(--success)",
  REFUNDED: "var(--severe)",
  RELEASED: "var(--severe)",
  CANCELLED: "var(--severe)",
};

const STATUS_LABELS: Record<string, string> = {
  CHARGED: "cobrado",
  REFUNDED: "reembolsado",
  RESERVED: "reservado",
  RELEASED: "liberado",
  SCHEDULED: "programado",
  CANCELLED: "cancelado",
};

export function DataPanels({ system }: { system: LiveSystem }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel service="payment" count={system.payments.length}>
        <Rows
          empty="Sin cobros todavía"
          rows={system.payments.map((payment) => ({
            key: payment.id,
            main: formatQuetzales(payment.amount),
            detail: payment.orderId,
            status: payment.status,
          }))}
        />
      </Panel>

      <Panel service="inventory" count={system.reservations.length}>
        <div className="space-y-2.5 border-b border-border-muted px-4 py-3">
          {system.stock.map((level) => {
            const initial = CATALOG.find((product) => product.sku === level.sku)?.initialStock || 1;
            return (
              <div key={level.sku} className="grid grid-cols-[80px_1fr_28px] items-center gap-3 text-[13px]">
                <span className="text-fg-muted">{PRODUCT_LABELS[level.sku]}</span>
                <span className="h-2 overflow-hidden rounded-full bg-overlay">
                  <motion.span
                    className="block h-full rounded-full"
                    animate={{ width: `${(level.available / initial) * 100}%`, background: level.available === 0 ? "#f85149" : "#3fb950" }}
                  />
                </span>
                <motion.span key={level.available} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="text-right font-mono">
                  {level.available}
                </motion.span>
              </div>
            );
          })}
        </div>
        <Rows
          empty="Sin reservas todavía"
          rows={system.reservations.map((reservation) => ({
            key: reservation.id,
            main: `${reservation.quantity} × ${PRODUCT_LABELS[reservation.sku]}`,
            detail: reservation.orderId,
            status: reservation.status,
          }))}
        />
      </Panel>

      <Panel service="shipping" count={system.shipments.length}>
        <Rows
          empty="Sin envíos todavía"
          rows={system.shipments.map((shipment) => ({
            key: shipment.id,
            main: `${shipment.city} · ${shipment.deliveryDate}`,
            detail: shipment.orderId,
            status: shipment.status,
          }))}
        />
      </Panel>
    </div>
  );
}

function Panel({ service, count, children }: { service: DependencyKey; count: number; children: ReactNode }) {
  const meta = SERVICES[service];
  const Icon = meta.icon;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-canvas-subtle">
      <p className="flex items-center gap-2 border-b border-border px-4 py-3 text-[14px] font-semibold">
        <Icon size={16} className="text-fg-muted" />
        Base de {meta.name}
        <span className="ml-auto rounded-full bg-overlay px-2 text-[12px] text-fg-muted">{count}</span>
      </p>
      {children}
    </div>
  );
}

function Rows({ rows, empty }: { rows: { key: string; main: string; detail: string; status: string }[]; empty: string }) {
  if (rows.length === 0) return <p className="px-4 py-6 text-center text-[13px] text-fg-muted">{empty}</p>;

  return (
    <ul className="max-h-[260px] divide-y divide-border-muted overflow-y-auto">
      <AnimatePresence initial={false}>
        {rows.map((row) => (
          <motion.li
            key={row.key}
            layout
            initial={{ opacity: 0, backgroundColor: "rgba(68,147,248,0.18)" }}
            animate={{ opacity: 1, backgroundColor: "rgba(0,0,0,0)" }}
            transition={{ duration: 1.2 }}
            className="flex items-center justify-between gap-3 px-4 py-2"
          >
            <span className="min-w-0">
              <span className="block truncate text-[13.5px] font-medium">{row.main}</span>
              <span className="block truncate font-mono text-[11px] text-fg-subtle">{row.detail}</span>
            </span>
            <motion.span
              key={row.status}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="shrink-0 rounded-full border px-2 py-0.5 text-[11.5px] font-medium"
              style={{ color: STATUS_COLORS[row.status], borderColor: STATUS_COLORS[row.status] }}
            >
              {STATUS_LABELS[row.status] ?? row.status}
            </motion.span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
