"use client";

import { AnimatePresence, motion } from "motion/react";
import type { CallResult } from "@poc5/contracts";

const RESULT_COLORS: Record<CallResult, string> = {
  success: "var(--success)",
  failure: "var(--danger)",
  slow: "var(--attention)",
};

interface SlidingWindowProps {
  results: CallResult[];
  size?: number;
  threshold?: number;
  label?: string;
  compact?: boolean;
}

export function SlidingWindow({ results, size = 10, threshold = 50, label, compact = false }: SlidingWindowProps) {
  const recent = results.slice(-size);
  const failures = recent.filter((result) => result !== "success").length;
  const rate = recent.length === 0 ? 0 : Math.round((failures / recent.length) * 100);
  const tripped = rate >= threshold && recent.length > 0;

  return (
    <div className="space-y-2">
      {label && <p className="text-[12px] text-fg-muted">{label}</p>}
      <div className="flex gap-1.5">
        {Array.from({ length: size }, (_, index) => {
          const result = recent[index];
          return (
            <div
              key={index}
              className={`relative flex-1 rounded-md border border-dashed border-border ${compact ? "h-5" : "h-9"}`}
            >
              <AnimatePresence>
                {result && (
                  <motion.span
                    key={`${index}-${result}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 520, damping: 20 }}
                    className="absolute inset-[-1px] rounded-md"
                    style={{ background: RESULT_COLORS[result] }}
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-overlay">
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${rate}%`, background: tripped ? "var(--danger)" : "var(--fg-muted)" }}
            transition={{ type: "spring", stiffness: 140, damping: 20 }}
          />
          <span className="absolute inset-y-0 w-0.5 bg-fg" style={{ left: `${threshold}%` }} />
        </div>
        <span className="w-24 text-right font-mono text-[12px]" style={{ color: tripped ? "var(--danger)" : "var(--fg-muted)" }}>
          {rate}% fallas
        </span>
      </div>
    </div>
  );
}
