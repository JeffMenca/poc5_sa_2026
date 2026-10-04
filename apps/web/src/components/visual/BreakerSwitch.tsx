"use client";

import { AnimatePresence, motion } from "motion/react";
import type { BreakerState } from "@poc5/contracts";

const COLORS: Record<BreakerState, string> = {
  closed: "#3fb950",
  open: "#f85149",
  "half-open": "#d29922",
};

const DEAD_WIRE = "#30363d";

const LEVER_ANGLE: Record<BreakerState, number> = {
  closed: 0,
  "half-open": -16,
  open: -48,
};

const PIVOT = { x: 130, y: 92 };
const CONTACT = { x: 250, y: 92 };
const LEVER_REACH = 135;

interface BreakerSwitchProps {
  state: BreakerState;
  from?: string;
  to?: string;
  compact?: boolean;
  className?: string;
}

export function BreakerSwitch({ state, from = "Order", to = "Inventory", compact = false, className }: BreakerSwitchProps) {
  const color = COLORS[state];
  return (
    <svg viewBox={compact ? "104 -14 170 120" : "0 0 400 150"} className={className} role="img" aria-label={`Interruptor ${state}`}>
      {!compact && <Terminal x={24} label={from} color="var(--fg-muted)" />}
      {!compact && <Terminal x={360} label={to} color={state === "open" ? "var(--fg-subtle)" : "var(--fg-muted)"} />}

      <line x1={40} y1={PIVOT.y} x2={PIVOT.x} y2={PIVOT.y} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <motion.line
        x1={CONTACT.x}
        y1={CONTACT.y}
        x2={340}
        y2={CONTACT.y}
        strokeWidth={4}
        strokeLinecap="round"
        animate={{ stroke: state === "open" ? DEAD_WIRE : color }}
      />

      {!compact && <Packets state={state} />}

      <circle cx={PIVOT.x} cy={PIVOT.y} r={9} fill="var(--canvas)" stroke={color} strokeWidth={3} />
      <motion.circle cx={CONTACT.x} cy={CONTACT.y} r={9} fill="var(--canvas)" strokeWidth={3} animate={{ stroke: color }} />

      <motion.g
        animate={{ rotate: LEVER_ANGLE[state] }}
        transition={{ type: "spring", stiffness: 180, damping: 12 }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
      >
        <rect x={PIVOT.x - LEVER_REACH} y={PIVOT.y - LEVER_REACH} width={LEVER_REACH * 2} height={LEVER_REACH * 2} fill="none" />
        <motion.rect
          x={PIVOT.x}
          y={PIVOT.y - 5}
          width={128}
          height={10}
          rx={5}
          animate={{ fill: color }}
        />
        <motion.rect x={PIVOT.x + 112} y={PIVOT.y - 22} width={10} height={30} rx={5} animate={{ fill: color }} />
      </motion.g>

      <AnimatePresence>{state === "open" && <Spark key="spark" />}</AnimatePresence>
    </svg>
  );
}

function Terminal({ x, label, color }: { x: number; label: string; color: string }) {
  return (
    <g>
      <rect x={x - 16} y={PIVOT.y - 16} width={32} height={32} rx={8} fill="var(--canvas-subtle)" stroke="var(--border)" />
      <circle cx={x} cy={PIVOT.y} r={4} fill={color} />
      <text x={x} y={PIVOT.y + 38} textAnchor="middle" fontSize={13} fill="var(--fg-muted)" fontFamily="var(--font-mona)">
        {label}
      </text>
    </g>
  );
}

function Packets({ state }: { state: BreakerState }) {
  const delays = [0, 0.45, 0.9];

  if (state === "closed") {
    return (
      <>
        {delays.map((delay) => (
          <motion.circle
            key={`c-${delay}`}
            r={5}
            cy={PIVOT.y}
            fill="var(--success)"
            initial={{ cx: 40 }}
            animate={{ cx: [40, 340] }}
            transition={{ duration: 1.35, delay, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </>
    );
  }

  if (state === "open") {
    return (
      <>
        {delays.map((delay) => (
          <motion.circle
            key={`o-${delay}`}
            r={5}
            cy={PIVOT.y}
            initial={{ cx: 40 }}
            animate={{ cx: [40, 118, 40], fill: ["var(--fg-muted)", "var(--danger)", "var(--danger)"] }}
            transition={{ duration: 1.35, delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </>
    );
  }

  return (
    <motion.circle
      r={5}
      cy={PIVOT.y}
      fill="var(--attention)"
      initial={{ cx: 40 }}
      animate={{ cx: [40, 340], opacity: [1, 1, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.6, ease: "linear" }}
    />
  );
}

function Spark() {
  const rays = [-60, -20, 20, 60, 100, 140];
  return (
    <motion.g initial={{ opacity: 1 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, delay: 0.25 }}>
      {rays.map((angle) => (
        <motion.line
          key={angle}
          x1={CONTACT.x}
          y1={CONTACT.y}
          initial={{ x2: CONTACT.x, y2: CONTACT.y }}
          animate={{
            x2: CONTACT.x + Math.cos((angle * Math.PI) / 180) * 26,
            y2: CONTACT.y + Math.sin((angle * Math.PI) / 180) * 26,
          }}
          transition={{ duration: 0.3 }}
          stroke="var(--attention)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      ))}
    </motion.g>
  );
}
