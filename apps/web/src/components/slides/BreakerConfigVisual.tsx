"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useStep } from "@/components/deck/DeckContext";
import { useSequence } from "@/hooks/useSequence";

export function BreakerConfigVisual() {
  const step = useStep();

  return (
    <AnimatePresence mode="wait">
      {step === 0 && (
        <motion.div key="dials" exit={{ opacity: 0, y: -16 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Dial index={0} value="50%" name="failureRateThreshold" meaning="fallas para cortar">
            <Gauge />
          </Dial>
          <Dial index={1} value="10" name="slidingWindowSize" meaning="llamadas que mira">
            <WindowDots />
          </Dial>
          <Dial index={2} value="10 s" name="waitDurationInOpenState" meaning="cortado antes de probar">
            <TimerRing />
          </Dial>
          <Dial index={3} value="3" name="permittedNumberOfCallsInHalfOpenState" meaning="llamadas de prueba">
            <TrialPulses />
          </Dial>
          <Dial index={4} value="> 1 s" name="slowCallDurationThreshold" meaning="cuenta como lenta">
            <SlowClock />
          </Dial>
        </motion.div>
      )}
      {step >= 1 && (
        <motion.div key="errors" data-focus-step="1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-4">
          <p className="text-[22px] font-semibold">¿Qué cuenta como falla?</p>
          <ErrorLane code="409" label="Sin stock" counts={false} caption="El servicio funciona y dijo que no. No cuenta." />
          <ErrorLane code="500" label="Error del servidor" counts caption="El servicio está mal. Cuenta como falla." />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Dial({ index, value, name, meaning, children }: { index: number; value: string; name: string; meaning: string; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.45 }}
      className="flex flex-col items-center rounded-xl border border-border bg-canvas-subtle p-5 text-center"
    >
      <div className="flex h-28 items-center justify-center">{children}</div>
      <p className="font-display text-[34px] font-bold leading-none [font-stretch:115%]">{value}</p>
      <p className="mt-2 text-[15px] text-fg">{meaning}</p>
      <p className="mt-2 break-all font-mono text-[11px] text-fg-subtle">{name}</p>
    </motion.div>
  );
}

function Gauge() {
  return (
    <svg viewBox="0 0 120 70" className="w-32">
      <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="var(--border)" strokeWidth="10" strokeLinecap="round" />
      <motion.path
        d="M10 60 A50 50 0 0 1 110 60"
        fill="none"
        stroke="var(--danger)"
        strokeWidth="10"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 0.5 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      />
      <motion.line
        x1="60"
        y1="60"
        x2="60"
        y2="18"
        stroke="var(--fg)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ rotate: -90 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 1.2, delay: 0.3, type: "spring", stiffness: 60 }}
        style={{ transformBox: "view-box", transformOrigin: "60px 60px" }}
      />
    </svg>
  );
}

function WindowDots() {
  const frame = useSequence(11, 200, { loop: true });
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {Array.from({ length: 10 }, (_, index) => (
        <motion.span
          key={index}
          animate={{ scale: index < frame ? 1 : 0.5, opacity: index < frame ? 1 : 0.25 }}
          className="h-4 w-4 rounded-sm"
          style={{ background: index % 3 === 2 ? "var(--danger)" : "var(--success)" }}
        />
      ))}
    </div>
  );
}

function TimerRing() {
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="8" />
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="var(--attention)"
        strokeWidth="8"
        strokeLinecap="round"
        initial={{ pathLength: 1 }}
        animate={{ pathLength: 0 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
}

function TrialPulses() {
  return (
    <div className="flex gap-3">
      {[0, 1, 2].map((index) => (
        <span key={index} className="relative flex h-5 w-5">
          <span className="pulse-ring absolute inset-0 rounded-full bg-attention" style={{ animationDelay: `${index * 0.35}s` }} />
          <span className="relative h-5 w-5 rounded-full bg-attention" />
        </span>
      ))}
    </div>
  );
}

function SlowClock() {
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24">
      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="6" />
      <motion.line
        x1="50"
        y1="50"
        x2="50"
        y2="18"
        stroke="var(--attention)"
        strokeWidth="5"
        strokeLinecap="round"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{ transformBox: "view-box", transformOrigin: "50px 50px" }}
      />
      <circle cx="50" cy="50" r="5" fill="var(--fg)" />
    </svg>
  );
}

function ErrorLane({ code, label, counts, caption }: { code: string; label: string; counts: boolean; caption: string }) {
  const color = counts ? "var(--danger)" : "var(--fg-muted)";
  return (
    <div className="grid items-center gap-5 rounded-xl border border-border bg-canvas-subtle p-5 md:grid-cols-[1fr_240px]">
      <div className="relative h-14">
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-border" />
        <motion.span
          initial={{ left: "0%" }}
          animate={{ left: counts ? ["0%", "52%", "52%"] : ["0%", "35%", "35%"], opacity: [1, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }}
          className="absolute top-1/2 -translate-y-1/2 rounded-full border px-3 py-1 font-mono text-[14px] font-semibold"
          style={{ color, borderColor: color, background: "var(--canvas)" }}
        >
          {code} · {label}
        </motion.span>
        <span className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-lg border border-border bg-canvas px-2 py-2">
          {Array.from({ length: 4 }, (_, index) => (
            <motion.span
              key={index}
              className="h-5 w-3 rounded-sm"
              animate={{ background: counts && index === 3 ? ["var(--border)", "var(--border)", "var(--danger)"] : "var(--border)" }}
              transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.5, times: [0, 0.85, 1] }}
            />
          ))}
          <span className="ml-1 text-[11px] text-fg-muted">ventana</span>
        </span>
      </div>
      <p className="text-[16px]" style={{ color: counts ? "var(--fg)" : "var(--fg-muted)" }}>
        {caption}
      </p>
    </div>
  );
}
