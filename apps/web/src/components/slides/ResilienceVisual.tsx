"use client";

import { Fragment } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CommentIcon, NoteIcon, PackageIcon, StackIcon, StopwatchIcon, SyncIcon, ZapIcon } from "@primer/octicons-react";
import { useStep } from "@/components/deck/DeckContext";

const GATES = [
  { key: "retry", name: "Retry", icon: SyncIcon, value: "1 reintento", sentence: "Si falla por algo pasajero, lo intenta una vez más. Nunca reintenta un «sin stock»." },
  { key: "breaker", name: "Circuit Breaker", icon: ZapIcon, value: "50% de 10", sentence: "Cuenta cada resultado. Si falla demasiado, corta y ni siquiera llama." },
  { key: "timeout", name: "Timeout", icon: StopwatchIcon, value: "2 s", sentence: "No espera para siempre: a los 2 segundos se rinde y lo cuenta como falla." },
  { key: "bulkhead", name: "Bulkhead", icon: StackIcon, value: "5 a la vez", sentence: "Como los compartimentos de un barco: un servicio lento no se come todos los recursos." },
] as const;

const FALLBACK_STEP = GATES.length + 1;

export function ResilienceVisual() {
  const step = useStep();
  const active = step >= 1 && step <= GATES.length ? GATES[step - 1] : undefined;
  const fallback = step >= FALLBACK_STEP;

  return (
    <div className="flex flex-1 flex-col gap-10" data-focus-step="1 2 3 4 5">
      <div className="relative rounded-xl border border-border bg-canvas-subtle px-6 pb-14 pt-8">
        <div className="relative flex items-center">
          <Endpoint icon={<NoteIcon size={22} />} label="Order" />
          {GATES.map((gate, index) => {
            const lit = active?.key === gate.key || (step > index + 1 && !fallback) || step === 0;
            const Icon = gate.icon;
            return (
              <Fragment key={gate.key}>
                <Wire />
                <motion.div
                  animate={{
                    borderColor: active?.key === gate.key ? "var(--accent)" : "var(--border)",
                    scale: active?.key === gate.key ? 1.12 : 1,
                    opacity: lit || fallback ? 1 : 0.45,
                  }}
                  className="relative z-10 flex w-28 shrink-0 flex-col items-center gap-1.5 rounded-xl border-2 bg-canvas px-2 py-3"
                >
                  <Icon size={22} className={active?.key === gate.key ? "text-accent" : "text-fg-muted"} />
                  <span className="text-center text-[13px] font-semibold leading-tight">{gate.name}</span>
                  <span className="font-mono text-[11px] text-fg-muted">{gate.value}</span>
                </motion.div>
              </Fragment>
            );
          })}
          <Wire />
          <Endpoint icon={<PackageIcon size={22} />} label="Inventory" />

          {!fallback && (
            <motion.span
              className="absolute top-1/2 z-20 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_14px_var(--accent)]"
              initial={{ left: "3%" }}
              animate={{ left: ["3%", "95%"] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>

        <AnimatePresence>
          {fallback && (
            <motion.svg
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              viewBox="0 0 1000 60"
              preserveAspectRatio="none"
              className="absolute inset-x-6 bottom-2 h-14"
            >
              <motion.path
                d="M390 0 C 380 50, 60 50, 40 0"
                fill="none"
                stroke="var(--danger)"
                strokeWidth="2.5"
                strokeDasharray="7 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9 }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={fallback ? "fallback" : active?.key ?? "all"}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mx-auto max-w-3xl text-center"
        >
          {fallback ? (
            <>
              <p className="flex items-center justify-center gap-2 font-display text-[30px] font-bold text-danger [font-stretch:110%]">
                <CommentIcon size={26} /> Fallback
              </p>
              <p className="mt-3 text-[20px] text-fg-muted">Si todo lo anterior falla, Order responde algo controlado:</p>
              <p className="mt-4 inline-block rounded-xl border border-danger/50 bg-danger/10 px-5 py-3 font-mono text-[18px] text-fg">
                503 · «Servicio no disponible, intente más tarde»
              </p>
            </>
          ) : active ? (
            <>
              <p className="flex items-center justify-center gap-2 font-display text-[30px] font-bold text-accent [font-stretch:110%]">
                <active.icon size={26} /> {active.name}
              </p>
              <p className="mt-3 text-[20px] text-fg-muted">{active.sentence}</p>
            </>
          ) : (
            <p className="text-[20px] text-fg-muted">Cada llamada de Order a otro servicio cruza estas capas, siempre en este orden.</p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Endpoint({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="relative z-10 flex shrink-0 flex-col items-center gap-1.5">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-border bg-canvas">{icon}</span>
      <span className="text-[13px] font-semibold">{label}</span>
    </div>
  );
}

function Wire() {
  return <span className="h-0.5 min-w-4 flex-1 bg-border" />;
}
