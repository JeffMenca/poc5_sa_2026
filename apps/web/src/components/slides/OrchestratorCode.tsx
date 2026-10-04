"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useStep } from "@/components/deck/DeckContext";

export function OrchestratorCode({ forward, backward, switchAt }: { forward: ReactNode; backward: ReactNode; switchAt: number }) {
  const step = useStep();
  const showBackward = step >= switchAt;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Tab active={!showBackward} color="var(--success)" label="Avanzar · place()" />
        <Tab active={showBackward} color="var(--severe)" label="Deshacer · runCompensations()" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={showBackward ? "backward" : "forward"}
          data-focus-step={showBackward ? String(switchAt) : undefined}
          initial={{ opacity: 0, x: showBackward ? 40 : -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: showBackward ? -40 : 40 }}
          transition={{ duration: 0.35 }}
        >
          {showBackward ? backward : forward}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Tab({ active, color, label }: { active: boolean; color: string; label: string }) {
  return (
    <span
      className="rounded-full border px-3 py-1 font-mono text-[13px] transition-colors"
      style={{ borderColor: active ? color : "var(--border)", color: active ? color : "var(--fg-muted)" }}
    >
      {label}
    </span>
  );
}
