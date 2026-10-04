"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { BeakerIcon, PlayIcon, TerminalIcon, UndoIcon, ZapIcon } from "@primer/octicons-react";
import { useStep } from "@/components/deck/DeckContext";
import { Reveal } from "@/components/deck/Stage";
import { StatusIcon } from "@/components/visual/StatusIcon";
import { useSequence } from "@/hooks/useSequence";

const CHECKS: { pattern: "saga" | "breaker"; name: string; expected: string }[] = [
  { pattern: "saga", name: "Compra exitosa", expected: "201 · orden completada" },
  { pattern: "saga", name: "Tarjeta rechazada", expected: "422 · nada que deshacer" },
  { pattern: "saga", name: "Sin stock", expected: "422 · reembolso" },
  { pattern: "saga", name: "Ciudad sin envíos", expected: "422 · libera stock y reembolsa" },
  { pattern: "saga", name: "Cancelar orden completada", expected: "4 compensaciones" },
  { pattern: "breaker", name: "Inventory falla", expected: "se abre solo su breaker" },
  { pattern: "breaker", name: "Circuito abierto", expected: "503 sin llamar al servicio" },
  { pattern: "breaker", name: "Recuperación", expected: "semiabierto → cerrado" },
  { pattern: "breaker", name: "Inventory lento o colgado", expected: "abre por lentitud · timeout" },
  { pattern: "saga", name: "Payment cae al reembolsar", expected: "queda pendiente y se completa sola" },
];

export function ChecksVisual() {
  const step = useStep();
  const progress = useSequence(CHECKS.length * 2 + 1, 220);
  const done = Math.floor(progress / 2);
  const allDone = done >= CHECKS.length;

  return (
    <div className="grid flex-1 items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div className="overflow-hidden rounded-xl border border-border bg-canvas-subtle">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <StatusIcon status={allDone ? "success" : "running"} size={28} />
          <div>
            <p className="text-[17px] font-semibold">{allDone ? "Todas las pruebas pasaron" : "Corriendo pruebas…"}</p>
            <p className="text-[13px] text-fg-muted">
              {done} de {CHECKS.length} escenarios de falla
            </p>
          </div>
        </div>
        <ul className="divide-y divide-border-muted">
          {CHECKS.map((check, index) => {
            const status = index < done ? "success" : index === done ? "running" : "queued";
            return (
              <motion.li
                key={check.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className="flex items-center gap-3 px-5 py-2.5 text-[14.5px]"
              >
                <StatusIcon status={status} />
                <span className={check.pattern === "saga" ? "text-severe" : "text-accent"}>
                  {check.pattern === "saga" ? <UndoIcon size={14} /> : <ZapIcon size={14} />}
                </span>
                <span className="font-semibold">{check.name}</span>
                <span className="ml-auto text-[13px] text-fg-muted">{check.expected}</span>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-4" data-focus-step="1">
        <Reveal when={step >= 1}>
          <div className="rounded-xl border border-border bg-canvas-inset p-5 font-mono text-[14px]">
            <p className="mb-3 flex items-center gap-2 text-fg-muted">
              <TerminalIcon /> terminal
            </p>
            <p>
              <span className="text-success">$</span> npm test
            </p>
            <p className="mt-1 text-success">✓ 58 pruebas pasaron</p>
          </div>
        </Reveal>
        <Reveal when={step >= 1} delay={0.15}>
          <div className="rounded-xl border border-border bg-canvas-subtle p-5">
            <p className="flex items-center gap-2 text-[15px] text-fg-muted">
              <BeakerIcon /> Cada servicio tiene un interruptor de fallas: sano, falla, lento, colgado.
            </p>
            <Link
              href="/demo"
              className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-success-emphasis px-4 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-[#29903b]"
            >
              <PlayIcon size={18} /> Verlo en vivo
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
