"use client";

import { motion } from "motion/react";
import { CheckCircleFillIcon, SkipIcon, XCircleFillIcon } from "@primer/octicons-react";

export type JobStatus = "queued" | "running" | "success" | "failure" | "skipped" | "compensating" | "compensated";

export const STATUS_COLORS: Record<JobStatus, string> = {
  queued: "var(--fg-subtle)",
  running: "var(--attention)",
  success: "var(--success)",
  failure: "var(--danger)",
  skipped: "var(--fg-subtle)",
  compensating: "var(--severe)",
  compensated: "var(--severe)",
};

export function StatusIcon({ status, size = 16 }: { status: JobStatus; size?: number }) {
  const color = STATUS_COLORS[status];

  return (
    <motion.span
      key={status}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      className="inline-flex shrink-0"
      style={{ color, width: size, height: size }}
    >
      {status === "success" && <CheckCircleFillIcon size={size} />}
      {status === "failure" && <XCircleFillIcon size={size} />}
      {status === "skipped" && <SkipIcon size={size} />}
      {status === "compensated" && <UndoCircle size={size} />}
      {(status === "running" || status === "compensating") && <Spinner size={size} />}
      {status === "queued" && <QueuedDot size={size} />}
    </motion.span>
  );
}

function Spinner({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="spin">
      <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M8 1.5a6.5 6.5 0 0 1 6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function QueuedDot({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.5 2.5" />
    </svg>
  );
}

function UndoCircle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <path d="M5.2 6.6h4.3a2.2 2.2 0 0 1 0 4.4H7" fill="none" stroke="var(--canvas)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6.8 4.9 5.1 6.6l1.7 1.7" fill="none" stroke="var(--canvas)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
