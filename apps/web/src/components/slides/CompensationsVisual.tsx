"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowSwitchIcon, IterationsIcon, SortDescIcon, SyncIcon } from "@primer/octicons-react";
import type { ServiceKey } from "@poc5/contracts";
import { useStep } from "@/components/deck/DeckContext";
import { useSequence } from "@/hooks/useSequence";
import { SERVICES } from "@/lib/services";

const PAIRS: { service: ServiceKey; action: string; undo: string }[] = [
  { service: "order", action: "POST /orders", undo: "DELETE /orders/{id}" },
  { service: "payment", action: "POST /payments", undo: "POST /payments/{id}/refund" },
  { service: "inventory", action: "POST /inventory/reserve", undo: "POST /inventory/release" },
  { service: "shipping", action: "POST /shipping/schedule", undo: "DELETE /shipping/{id}" },
];

export function CompensationsVisual() {
  const step = useStep();

  return (
    <AnimatePresence mode="wait">
      {step === 0 ? (
        <motion.div key="pairs" exit={{ opacity: 0, y: -16 }} className="space-y-3">
          {PAIRS.map((pair, index) => (
            <PairRow key={pair.service} {...pair} index={index} />
          ))}
        </motion.div>
      ) : (
        <motion.div key="rules" data-focus-step="1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5 md:grid-cols-3">
          <RuleCard icon={<SortDescIcon size={22} />} title="Al revés" caption="Lo último que se hizo se deshace primero">
            <ReverseStack />
          </RuleCard>
          <RuleCard icon={<IterationsIcon size={22} />} title="Repetible" caption="Reembolsar dos veces no devuelve el doble">
            <Idempotent />
          </RuleCard>
          <RuleCard icon={<SyncIcon size={22} />} title="Insistente" caption="Si el servicio está caído, se reintenta cada 5 s">
            <RetryRing />
          </RuleCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PairRow({ service, action, undo, index }: (typeof PAIRS)[number] & { index: number }) {
  const Icon = SERVICES[service].icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.12, duration: 0.45 }}
      className="grid grid-cols-[150px_1fr_60px_1fr] items-center gap-4 rounded-xl border border-border bg-canvas-subtle px-5 py-4"
    >
      <span className="flex items-center gap-2 text-[16px] font-semibold">
        <Icon size={18} />
        {SERVICES[service].name}
      </span>
      <span className="rounded-md bg-success/10 px-3 py-2 font-mono text-[13.5px] text-success">{action}</span>
      <motion.span
        animate={{ rotate: [0, 180, 180, 360] }}
        transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.3, times: [0, 0.2, 0.6, 0.8] }}
        className="flex justify-center text-fg-muted"
      >
        <ArrowSwitchIcon size={20} />
      </motion.span>
      <span className="rounded-md bg-severe/10 px-3 py-2 font-mono text-[13.5px] text-severe">{undo}</span>
    </motion.div>
  );
}

function RuleCard({ icon, title, caption, children }: { icon: React.ReactNode; title: string; caption: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-canvas-subtle p-6">
      <p className="flex items-center gap-2 font-display text-[24px] font-bold text-severe [font-stretch:110%]">
        {icon}
        {title}
      </p>
      <div className="flex min-h-[170px] flex-1 items-center justify-center">{children}</div>
      <p className="text-[15px] text-fg-muted">{caption}</p>
    </div>
  );
}

const STACK: ServiceKey[] = ["order", "payment", "inventory"];

function ReverseStack() {
  const frame = useSequence(8, 600, { loop: true });
  const visible = frame <= 3 ? frame : Math.max(0, 3 - (frame - 4));

  return (
    <div className="flex w-40 flex-col-reverse gap-2">
      <AnimatePresence>
        {STACK.slice(0, visible).map((service) => (
          <motion.div
            key={service}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 40, backgroundColor: "rgba(219,109,40,0.3)" }}
            className="rounded-md border border-border bg-canvas px-3 py-2 text-center text-[14px] font-semibold"
          >
            {SERVICES[service].name}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function Idempotent() {
  const frame = useSequence(6, 650, { loop: true });
  const pressed = frame === 1 || frame === 3;

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.span
        animate={{ scale: pressed ? 0.9 : 1, backgroundColor: pressed ? "#bd561d" : "#db6d28" }}
        className="rounded-md px-4 py-2 font-mono text-[13px] font-semibold text-white"
      >
        refund
      </motion.span>
      <span className="font-mono text-[13px] text-fg-muted">clics: {frame >= 3 ? 2 : frame >= 1 ? 1 : 0}</span>
      <span className="rounded-full bg-success/15 px-3 py-1 text-[14px] font-semibold text-success">
        {frame >= 1 ? "1 reembolso" : "0 reembolsos"}
      </span>
    </div>
  );
}

function RetryRing() {
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="6" />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="var(--severe)"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <SyncIcon size={22} className="spin text-severe" />
        <span className="mt-1 font-mono text-[12px] text-fg-muted">5 s</span>
      </span>
    </div>
  );
}
