"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  CreditCardIcon,
  PackageIcon,
  PaperAirplaneIcon,
  PlayIcon,
  ZapIcon,
  type Icon,
} from "@primer/octicons-react";
import { ALL_CITIES, CATALOG, type Order, type PlaceOrderRequest } from "@poc5/contracts";
import type { HttpResult } from "@/lib/api";
import { ERROR_LABELS, PRODUCT_LABELS, formatQuetzales } from "@/lib/labels";

interface Scenario {
  icon: Icon;
  title: string;
  detail: string;
  order: PlaceOrderRequest;
}

const HAPPY: PlaceOrderRequest = { sku: "KEYBOARD", quantity: 1, city: "Quetzaltenango" };

const SCENARIOS: Scenario[] = [
  { icon: CheckCircleIcon, title: "Compra exitosa", detail: "1 teclado a Quetzaltenango", order: HAPPY },
  { icon: CreditCardIcon, title: "Tarjeta rechazada", detail: "3 monitores: Q5,400 > límite Q5,000", order: { sku: "MONITOR", quantity: 3, city: "Guatemala" } },
  { icon: PackageIcon, title: "Sin stock", detail: "Audífonos: quedan 0", order: { sku: "HEADPHONES", quantity: 1, city: "Quetzaltenango" } },
  { icon: PaperAirplaneIcon, title: "Ciudad sin envíos", detail: "1 teclado a Flores", order: { ...HAPPY, city: "Flores" } },
];

const BURST_SIZE = 10;
const BURST_GAP_MS = 300;

interface RunLauncherProps {
  onPlace: (order: PlaceOrderRequest) => Promise<HttpResult<Order>>;
}

export function RunLauncher({ onPlace }: RunLauncherProps) {
  const [busy, setBusy] = useState(false);
  const [custom, setCustom] = useState<PlaceOrderRequest>(HAPPY);
  const [showCustom, setShowCustom] = useState(false);
  const [response, setResponse] = useState<HttpResult<Order>>();
  const [burstSent, setBurstSent] = useState<number>();

  async function run(task: () => Promise<void>) {
    setBusy(true);
    try {
      await task();
    } finally {
      setBusy(false);
      setBurstSent(undefined);
    }
  }

  const place = async (order: PlaceOrderRequest) => setResponse(await onPlace(order));

  async function burst() {
    for (let sent = 1; sent <= BURST_SIZE; sent++) {
      setBurstSent(sent);
      await place(HAPPY);
      await new Promise((resolve) => setTimeout(resolve, BURST_GAP_MS));
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-canvas-subtle">
      <p className="border-b border-border px-4 py-3 text-[14px] font-semibold">Lanzar una compra</p>

      <div className="divide-y divide-border-muted">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.title}
            disabled={busy}
            onClick={() => run(() => place(scenario.order))}
            className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-overlay disabled:opacity-50"
          >
            <scenario.icon size={18} className="shrink-0 text-fg-muted group-hover:text-accent" />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold">{scenario.title}</span>
              <span className="block truncate text-[12px] text-fg-muted">{scenario.detail}</span>
            </span>
            <PlayIcon size={14} className="text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ))}

        <button
          disabled={busy}
          onClick={() => run(burst)}
          className="group relative flex w-full items-center gap-3 overflow-hidden px-4 py-3 text-left transition-colors hover:bg-overlay disabled:cursor-progress"
        >
          {burstSent && (
            <motion.span
              className="absolute inset-y-0 left-0 bg-accent/15"
              animate={{ width: `${(burstSent / BURST_SIZE) * 100}%` }}
            />
          )}
          <ZapIcon size={18} className="relative shrink-0 text-accent" />
          <span className="relative min-w-0 flex-1">
            <span className="block text-[14px] font-semibold text-accent">
              {burstSent ? `Ráfaga: ${burstSent} de ${BURST_SIZE}` : `Ráfaga de ${BURST_SIZE} compras`}
            </span>
            <span className="block text-[12px] text-fg-muted">Pon un servicio en «Falla» y lánzala</span>
          </span>
        </button>
      </div>

      <button
        onClick={() => setShowCustom(!showCustom)}
        className="flex items-center gap-2 border-t border-border px-4 py-2.5 text-[12.5px] text-fg-muted hover:text-fg"
      >
        <motion.span animate={{ rotate: showCustom ? 0 : -90 }}>
          <ChevronDownIcon />
        </motion.span>
        Compra personalizada
      </button>
      <AnimatePresence>
        {showCustom && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="grid grid-cols-[1fr_64px] gap-2 overflow-hidden px-4 pb-4"
            onSubmit={(event) => {
              event.preventDefault();
              run(() => place(custom));
            }}
          >
            <select
              value={custom.sku}
              onChange={(event) => setCustom({ ...custom, sku: event.target.value })}
              className="rounded-md border border-border bg-canvas px-2 py-1.5 text-[13px]"
            >
              {CATALOG.map((product) => (
                <option key={product.sku} value={product.sku}>
                  {PRODUCT_LABELS[product.sku]} · {formatQuetzales(product.price)}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={20}
              value={custom.quantity}
              aria-label="Cantidad"
              onChange={(event) => setCustom({ ...custom, quantity: Number(event.target.value) })}
              className="rounded-md border border-border bg-canvas px-2 py-1.5 text-[13px]"
            />
            <select
              value={custom.city}
              onChange={(event) => setCustom({ ...custom, city: event.target.value })}
              className="rounded-md border border-border bg-canvas px-2 py-1.5 text-[13px]"
            >
              {ALL_CITIES.map((city) => (
                <option key={city}>{city}</option>
              ))}
            </select>
            <button disabled={busy} className="rounded-md bg-success-emphasis text-[13px] font-semibold text-white disabled:opacity-50">
              Comprar
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {response && <ResponseBox key={response.body?.id ?? response.status} response={response} />}
      </AnimatePresence>
    </div>
  );
}

function ResponseBox({ response }: { response: HttpResult<Order> }) {
  const ok = response.status < 300;
  const color = ok ? "var(--success)" : response.status === 503 ? "var(--danger)" : "var(--attention)";
  const message = response.body?.failure ? ERROR_LABELS[response.body.failure.code] : ok ? "Compra completada" : "Error";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="border-t border-border bg-canvas-inset px-4 py-3 font-mono text-[12.5px]"
    >
      <p className="text-fg-muted">
        Respuesta de <span className="text-fg">POST /orders</span>
      </p>
      <p className="mt-1 flex items-center gap-2">
        <span className="rounded px-1.5 py-0.5 font-bold text-canvas" style={{ background: color }}>
          {response.status}
        </span>
        <span className="font-sans text-[13.5px] text-fg">{message}</span>
      </p>
    </motion.div>
  );
}
