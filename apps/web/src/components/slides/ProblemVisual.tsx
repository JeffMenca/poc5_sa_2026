"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  BlockedIcon,
  CheckCircleFillIcon,
  DatabaseIcon,
  HourglassIcon,
  PeopleIcon,
  UndoIcon,
  XCircleFillIcon,
} from "@primer/octicons-react";
import type { ServiceKey } from "@poc5/contracts";
import { useStep } from "@/components/deck/DeckContext";
import { Reveal } from "@/components/deck/Stage";
import { useSequence } from "@/hooks/useSequence";
import { SERVICES } from "@/lib/services";

export function ProblemVisual() {
  const step = useStep();

  return (
    <AnimatePresence mode="wait">
      {step < 2 ? (
        <motion.div key="consistency" exit={{ opacity: 0, y: -20 }} className="space-y-4">
          <Tag color="var(--severe)">Problema 1 · los datos quedan a medias</Tag>
          <div className="grid gap-5 lg:grid-cols-2">
            <MonolithPanel />
            <Reveal when={step >= 1} focusStep={1}>
              <MicroservicesPanel active={step >= 1} />
            </Reveal>
          </div>
        </motion.div>
      ) : (
        <motion.div key="cascade" data-focus-step="2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Tag color="var(--accent)">Problema 2 · una falla se contagia</Tag>
          <CascadePanel />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full border px-3 py-1 text-[13px] font-semibold" style={{ color, borderColor: color }}>
      {children}
    </span>
  );
}

function Panel({ title, caption, children }: { title: string; caption: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-canvas-subtle p-6">
      <p className="font-display text-[22px] font-bold [font-stretch:110%]">{title}</p>
      <div className="flex flex-1 items-center justify-center py-6">{children}</div>
      <p className="text-center text-[16px] text-fg-muted">{caption}</p>
    </div>
  );
}

const MONOLITH_ROWS = ["orden", "pago", "stock"];

function MonolithPanel() {
  const frame = useSequence(7, 750, { loop: true });
  const rolledBack = frame >= 5;

  return (
    <Panel title="Monolito" caption={<>Una sola base: <b className="text-fg">ROLLBACK</b> deshace todo.</>}>
      <div className="relative w-64 rounded-xl border-2 border-border bg-canvas p-4">
        <DatabaseIcon size={20} className="mb-3 text-fg-muted" />
        <div className="space-y-2">
          {MONOLITH_ROWS.map((row, index) => {
            const written = frame > index && !rolledBack;
            const failed = index === 2 && frame >= 3 && !rolledBack;
            return (
              <motion.div
                key={row}
                animate={{ opacity: written ? 1 : 0.15, x: written ? 0 : -8 }}
                className="flex items-center gap-2 rounded-md bg-overlay px-3 py-2 text-[14px]"
              >
                {failed ? <XCircleFillIcon className="text-danger" /> : <CheckCircleFillIcon className="text-success" />}
                {row}
              </motion.div>
            );
          })}
        </div>
        <AnimatePresence>
          {frame === 4 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{ originX: 1 }}
              className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-attention/90 font-mono text-[18px] font-bold text-canvas"
            >
              <UndoIcon size={20} /> ROLLBACK
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Panel>
  );
}

const MICRO_SERVICES: ServiceKey[] = ["order", "payment", "inventory", "shipping"];

function MicroservicesPanel({ active }: { active: boolean }) {
  const frame = useSequence(7, 750, { loop: true, paused: !active, restartKey: active });

  return (
    <Panel title="Microservicios" caption={<>Cuatro bases: <b className="text-danger">no hay rollback</b> entre ellas.</>}>
      <div className="relative w-full">
        <div className="grid grid-cols-4 gap-3">
          {MICRO_SERVICES.map((service, index) => {
            const Icon = SERVICES[service].icon;
            const state = frame <= index ? "idle" : index === 2 ? "failed" : index === 3 ? "idle" : "done";
            return (
              <div key={service} className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{
                    borderColor: state === "done" ? "var(--success)" : state === "failed" ? "var(--danger)" : "var(--border)",
                    scale: frame === index + 1 ? 1.08 : 1,
                  }}
                  className="relative flex h-20 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 bg-canvas"
                >
                  <DatabaseIcon size={22} className="text-fg-muted" />
                  <span className="absolute -right-2 -top-2">
                    {state === "done" && <CheckCircleFillIcon size={18} className="text-success" />}
                    {state === "failed" && <XCircleFillIcon size={18} className="text-danger" />}
                  </span>
                </motion.div>
                <span className="flex items-center gap-1 text-[12.5px] text-fg-muted">
                  <Icon size={12} />
                  {SERVICES[service].name}
                </span>
              </div>
            );
          })}
        </div>
        <AnimatePresence>
          {frame >= 4 && (
            <motion.svg
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              viewBox="0 0 400 60"
              className="mt-3 w-full"
            >
              <motion.path
                d="M250 4 C 246 40, 222 46, 206 46"
                fill="none"
                stroke="var(--danger)"
                strokeWidth={2.5}
                strokeDasharray="6 6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7 }}
              />
              <foreignObject x={178} y={34} width={28} height={28}>
                <BlockedIcon size={24} className="text-danger" />
              </foreignObject>
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
    </Panel>
  );
}

function CascadePanel() {
  const frame = useSequence(16, 320, { loop: true });
  const waiting = Math.min(500, Math.round((frame / 11) * 500));
  const orderDown = frame >= 11;
  const clientsDown = frame >= 13;

  return (
    <div className="grid items-center gap-6 rounded-xl border border-border bg-canvas-subtle p-8 md:grid-cols-[1fr_auto_1.4fr_auto_1fr]">
      <Node icon={<PeopleIcon size={28} />} name="Clientes" down={clientsDown} caption={clientsDown ? "No pueden comprar" : "Compran"} />
      <Arrow />
      <motion.div
        animate={{ borderColor: orderDown ? "var(--danger)" : "var(--border)" }}
        className="rounded-xl border-2 bg-canvas p-5"
      >
        <p className="mb-3 flex items-center justify-between font-semibold">
          <span>Order</span>
          <span className="font-mono text-[13px]" style={{ color: orderDown ? "var(--danger)" : "var(--attention)" }}>
            {waiting} esperando
          </span>
        </p>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 40 }, (_, index) => (
            <motion.span
              key={index}
              animate={{ opacity: index < (waiting / 500) * 40 ? 1 : 0.1, scale: index < (waiting / 500) * 40 ? 1 : 0.6 }}
              className="h-3 rounded-sm"
              style={{ background: orderDown ? "var(--danger)" : "var(--attention)" }}
            />
          ))}
        </div>
        <p className="mt-3 text-[13px] text-fg-muted">{orderDown ? "Sin memoria ni conexiones: se cae" : "Cada compra espera 5 s"}</p>
      </motion.div>
      <Arrow />
      <Node
        icon={
          <motion.span animate={{ rotate: 180 }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }} className="inline-flex">
            <HourglassIcon size={28} />
          </motion.span>
        }
        name="Inventory"
        down
        caption="Tarda 5 s en responder"
      />
    </div>
  );
}

function Node({ icon, name, down, caption }: { icon: React.ReactNode; name: string; down: boolean; caption: string }) {
  return (
    <motion.div
      animate={{ color: down ? "var(--danger)" : "var(--fg)" }}
      className="flex flex-col items-center gap-2 text-center"
    >
      {icon}
      <span className="font-semibold">{name}</span>
      <span className="text-[13px] text-fg-muted">{caption}</span>
    </motion.div>
  );
}

function Arrow() {
  return (
    <svg width="60" height="16" viewBox="0 0 60 16" className="hidden md:block">
      <line x1="0" y1="8" x2="52" y2="8" stroke="var(--fg-subtle)" strokeWidth="2" className="flow" />
      <path d="M50 3 58 8 50 13" fill="none" stroke="var(--fg-subtle)" strokeWidth="2" />
    </svg>
  );
}
