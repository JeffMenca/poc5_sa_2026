"use client";

import { useEffect, useState } from "react";

interface SequenceOptions {
  loop?: boolean;
  restartKey?: unknown;
  paused?: boolean;
}

export function useSequence(length: number, intervalMs: number, { loop = false, restartKey, paused = false }: SequenceOptions = {}): number {
  const [state, setState] = useState({ key: restartKey, frame: 0 });
  const frame = state.key === restartKey ? state.frame : 0;

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setState((current) => {
        const base = current.key === restartKey ? current.frame : 0;
        const next = base + 1;
        if (next < length) return { key: restartKey, frame: next };
        return { key: restartKey, frame: loop ? 0 : length - 1 };
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [length, intervalMs, loop, restartKey, paused]);

  return frame;
}
