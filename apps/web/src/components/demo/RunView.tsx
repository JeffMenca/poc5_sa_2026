"use client";

import { AnimatePresence, motion } from "motion/react";
import { ReplyIcon, TrashIcon } from "@primer/octicons-react";
import type { Order } from "@poc5/contracts";
import { StatusIcon, type JobStatus } from "@/components/visual/StatusIcon";
import { WorkflowGraph } from "@/components/visual/WorkflowGraph";
import { ERROR_LABELS, ORDER_STATUS_LABELS, PRODUCT_LABELS, formatQuetzales } from "@/lib/labels";
import { SERVICES } from "@/lib/services";
import { orderToJobs } from "./orderToJobs";

const RUN_STATUS: Record<Order["status"], JobStatus> = {
  PENDING: "running",
  COMPLETED: "success",
  COMPENSATING: "compensating",
  CANCELLED: "failure",
};

const OUTCOME_COLORS = { succeeded: "var(--success)", rejected: "var(--attention)", unavailable: "var(--danger)" };
const OUTCOME_LABELS = { succeeded: "ok", rejected: "rechazó", unavailable: "no disponible" };

interface RunViewProps {
  orders: Order[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onCancel: (id: string) => void;
}

export function RunView({ orders, selectedId, onSelect, onCancel }: RunViewProps) {
  const selected = orders.find((order) => order.id === selectedId) ?? orders[0];

  if (!selected) {
    return (
      <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
        <p className="text-[18px] font-semibold">Todavía no hay compras</p>
        <p className="mt-1 text-[14px] text-fg-muted">Lanza un escenario a la izquierda y aquí verás la saga paso a paso.</p>
      </div>
    );
  }

  return (
    <div className="grid overflow-hidden rounded-xl border border-border bg-canvas-subtle lg:grid-cols-[230px_1fr]">
      <ol className="max-h-[560px] overflow-y-auto border-b border-border lg:border-b-0 lg:border-r">
        <AnimatePresence initial={false}>
          {orders.map((order, index) => (
            <motion.li key={order.id} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
              <button
                onClick={() => onSelect(order.id)}
                className={`flex w-full items-start gap-2.5 border-l-2 px-3 py-2.5 text-left transition-colors hover:bg-overlay ${
                  order.id === selected.id ? "border-tab-active bg-overlay" : "border-transparent"
                }`}
              >
                <span className="mt-0.5">
                  <StatusIcon status={RUN_STATUS[order.status]} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold">
                    #{orders.length - index} · {PRODUCT_LABELS[order.sku]} → {order.city}
                  </span>
                  <span className="block text-[11.5px] text-fg-muted">{ORDER_STATUS_LABELS[order.status]}</span>
                </span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <StatusIcon status={RUN_STATUS[selected.status]} size={22} />
          <div>
            <p className="text-[17px] font-bold">
              {selected.quantity} × {PRODUCT_LABELS[selected.sku]} → {selected.city}
            </p>
            <p className="font-mono text-[12px] text-fg-muted">
              {selected.id} · {formatQuetzales(selected.amount)}
            </p>
          </div>
          {selected.status === "COMPLETED" && (
            <button
              onClick={() => onCancel(selected.id)}
              className="ml-auto flex items-center gap-2 rounded-md border border-border bg-canvas px-3 py-1.5 text-[13px] font-medium text-danger transition-colors hover:border-danger hover:bg-danger/10"
            >
              <TrashIcon size={14} /> Cancelar compra
            </button>
          )}
        </div>

        <motion.p
          key={`${selected.id}-${selected.status}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border bg-canvas px-5 py-3 text-[15px]"
        >
          {summarize(selected)}
        </motion.p>

        <div className="p-5">
          <WorkflowGraph jobs={orderToJobs(selected)} compact />
        </div>

        <div className="border-t border-border bg-canvas-inset">
          <p className="px-5 pt-3 text-[12px] font-semibold uppercase tracking-wider text-fg-subtle">Registro de llamadas</p>
          <ol className="px-2 py-2 font-mono text-[12.5px]">
            {selected.log.map((entry, index) => {
              const Icon = SERVICES[entry.service].icon;
              const undo = entry.phase === "compensate";
              return (
                <motion.li
                  key={`${selected.id}-${index}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-[24px_20px_1fr_auto] items-center gap-2 rounded-md px-3 py-1.5 hover:bg-overlay"
                >
                  <span className="text-right text-fg-subtle">{index + 1}</span>
                  <Icon size={14} className="text-fg-muted" />
                  <span className={`truncate ${undo ? "text-severe" : "text-fg"}`}>
                    {undo && <ReplyIcon size={12} className="mr-1.5" />}
                    {entry.request}
                    {entry.code && <span className="ml-2 font-sans text-fg-muted">· {ERROR_LABELS[entry.code]}</span>}
                  </span>
                  <span className="whitespace-nowrap">
                    <span style={{ color: OUTCOME_COLORS[entry.outcome] }}>{OUTCOME_LABELS[entry.outcome]}</span>
                    <span className="text-fg-subtle"> {entry.durationMs} ms</span>
                  </span>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

function summarize(order: Order): string {
  if (order.status === "PENDING") return "La saga está avanzando…";
  if (order.status === "COMPLETED") return "Todo salió bien: se cobró, se reservó el stock y se programó el envío.";
  if (order.status === "COMPENSATING") {
    const pending = order.pendingCompensations.map((service) => SERVICES[service].name).join(", ");
    return `Falta deshacer en ${pending}: no responde. Se reintenta solo cada 5 s.`;
  }
  if (!order.failure) return "Cancelada por el cliente: se deshicieron todos los pasos, del último al primero.";

  const service = SERVICES[order.failure.service].name;
  const undone = order.completedSteps.length === 0 ? "No había nada que deshacer." : "Se deshicieron los pasos anteriores.";
  if (order.failure.code === "SERVICE_UNAVAILABLE") {
    return `${service} no estaba disponible, así que la respuesta fue «Servicio no disponible, intente más tarde». ${undone}`;
  }
  return `${service} respondió «${ERROR_LABELS[order.failure.code]}». ${undone}`;
}
