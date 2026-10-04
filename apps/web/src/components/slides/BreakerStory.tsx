"use client";

import { AnimatePresence, motion } from "motion/react";
import type { BreakerState, CallResult } from "@poc5/contracts";
import { useStep } from "@/components/deck/DeckContext";
import { BreakerSwitch } from "@/components/visual/BreakerSwitch";
import { SlidingWindow } from "@/components/visual/SlidingWindow";
import { useSequence } from "@/hooks/useSequence";
import { BREAKER_LABELS } from "@/lib/labels";

const STATES: BreakerState[] = ["closed", "open", "half-open"];

const FAILING_WINDOW: CallResult[][] = [
  [],
  ["failure"],
  ["failure", "failure"],
  ["failure", "failure", "failure"],
  ["failure", "failure", "failure", "failure"],
  ["failure", "failure", "failure", "failure", "failure"],
];

export function BreakerStory() {
  const step = useStep();
  const healthy = useSequence(11, 350, { loop: true, paused: step !== 0 });
  const failing = useSequence(FAILING_WINDOW.length + 1, 550, { restartKey: step === 1 });
  const countdown = useSequence(11, 380, { restartKey: step === 1 && failing >= FAILING_WINDOW.length, paused: failing < FAILING_WINDOW.length });
  const trial = useSequence(4, 650, { restartKey: step === 2 });

  const tripped = step === 1 && failing >= FAILING_WINDOW.length;
  const state: BreakerState = step === 0 || step >= 3 || (step === 1 && !tripped) ? "closed" : step === 1 ? "open" : "half-open";

  const window: CallResult[] =
    step === 0
      ? Array.from({ length: healthy }, () => "success" as const)
      : step === 1
        ? FAILING_WINDOW[Math.min(failing, FAILING_WINDOW.length - 1)]!
        : step === 2
          ? Array.from({ length: trial }, () => "success" as const)
          : [];

  const caption = [
    "Todo pasa. Anota si cada llamada salió bien o mal.",
    tripped ? "5 de 5 fallaron: corta. Order ya ni llama a Inventory." : "Inventory empieza a fallar…",
    trial >= 3 ? "Las 3 de prueba salieron bien." : "Pasaron 10 s: deja pasar 3 llamadas de prueba.",
    "Inventory se recuperó: vuelve a dejar pasar todo.",
  ][Math.min(step, 3)];

  return (
    <div className="grid flex-1 items-center gap-8 lg:grid-cols-[1.35fr_1fr]" data-focus-step="1 2 3">
      <div className="relative rounded-xl border border-border bg-canvas-subtle p-6">
        <BreakerSwitch state={state} className="w-full" />
        <AnimatePresence>
          {state === "open" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-danger/50 bg-danger/10 px-3 py-1 font-mono text-[13px] text-danger"
            >
              Semiabierto en {Math.max(0, 10 - countdown)} s
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-4">
          <SlidingWindow
            results={window}
            size={step === 2 ? 3 : 10}
            label={step === 2 ? "Llamadas de prueba" : "Últimas 10 llamadas"}
          />
        </div>
      </div>

      <div className="space-y-3">
        {STATES.map((candidate) => {
          const active = candidate === state;
          const label = BREAKER_LABELS[candidate];
          return (
            <motion.div
              key={candidate}
              animate={{
                opacity: active ? 1 : 0.4,
                borderColor: active ? label.color : "var(--border)",
                x: active ? 0 : 12,
              }}
              className="rounded-xl border bg-canvas-subtle px-5 py-4"
            >
              <p className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ background: label.color }} />
                <span className="font-display text-[26px] font-bold [font-stretch:110%]" style={{ color: active ? label.color : undefined }}>
                  {label.title}
                </span>
                <span className="font-mono text-[12px] text-fg-muted">{candidate}</span>
              </p>
              <p className="ml-6 text-[15px] text-fg-muted">{label.plain}</p>
            </motion.div>
          );
        })}
        <motion.p key={caption} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-2 text-[19px] font-semibold">
          {caption}
        </motion.p>
      </div>
    </div>
  );
}
