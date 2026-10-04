"use client";

import { Fragment } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { ServiceKey } from "@poc5/contracts";
import { SERVICES } from "@/lib/services";
import { STATUS_COLORS, StatusIcon, type JobStatus } from "./StatusIcon";

export interface WorkflowJob {
  service: ServiceKey;
  status: JobStatus;
  undo?: JobStatus;
  note?: string;
}

export function WorkflowGraph({ jobs, compact = false }: { jobs: WorkflowJob[]; compact?: boolean }) {
  const hasUndo = jobs.some((job) => job.undo);

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[760px] items-stretch gap-y-3"
        style={{ gridTemplateColumns: jobs.map(() => "minmax(0,1fr)").join(" 56px ") }}
      >
        {jobs.map((job, index) => (
          <Fragment key={job.service}>
            <JobCard job={job} compact={compact} />
            {index < jobs.length - 1 && <Connector from={job.status} to={jobs[index + 1]!.status} />}
          </Fragment>
        ))}

        {hasUndo &&
          jobs.map((job, index) => (
            <Fragment key={`undo-${job.service}`}>
              <UndoSlot job={job} compact={compact} />
              {index < jobs.length - 1 && <UndoConnector active={isUndoActive(jobs[index + 1]!.undo) && Boolean(job.undo)} />}
            </Fragment>
          ))}
      </div>
    </div>
  );
}

function isUndoActive(status?: JobStatus): boolean {
  return status === "compensating" || status === "compensated";
}

function JobCard({ job, compact }: { job: WorkflowJob; compact: boolean }) {
  const meta = SERVICES[job.service];
  const color = STATUS_COLORS[job.status];
  const Icon = meta.icon;
  const lit = job.status !== "queued" && job.status !== "skipped";

  return (
    <motion.div
      layout
      animate={{
        borderColor: lit ? color : "var(--border)",
        boxShadow: job.status === "running" ? `0 0 0 4px color-mix(in srgb, ${color} 18%, transparent)` : "0 0 0 0 transparent",
        opacity: job.status === "skipped" ? 0.45 : 1,
      }}
      transition={{ duration: 0.35 }}
      className={`relative rounded-lg border bg-canvas-subtle ${compact ? "px-3 py-2.5" : "px-4 py-3.5"}`}
    >
      <div className="flex items-center gap-2.5">
        <StatusIcon status={job.status} size={compact ? 16 : 18} />
        <span className={`font-semibold ${compact ? "text-[13px]" : "text-[15px]"}`}>{meta.action}</span>
      </div>
      <div className={`mt-1.5 flex items-center gap-1.5 text-fg-muted ${compact ? "text-[11.5px]" : "text-[12.5px]"}`}>
        <Icon size={12} />
        {meta.name}
      </div>
      <AnimatePresence>
        {job.note && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 overflow-hidden text-[12px] font-medium"
            style={{ color }}
          >
            {job.note}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Connector({ from, to }: { from: JobStatus; to: JobStatus }) {
  const active = to === "running";
  const done = from === "success" && to !== "queued" && to !== "skipped";
  const color = active ? "var(--attention)" : done ? "var(--success)" : "var(--border)";

  return (
    <div className="relative h-6 self-center">
      <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 56 24">
        <line x1="0" y1="12" x2="56" y2="12" stroke={color} strokeWidth="2" className={active ? "flow" : undefined} />
      </svg>
      {active && (
        <motion.span
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-attention shadow-[0_0_12px_var(--attention)]"
          initial={{ left: "0%" }}
          animate={{ left: "90%" }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

function UndoSlot({ job, compact }: { job: WorkflowJob; compact: boolean }) {
  const meta = SERVICES[job.service];

  return (
    <div className="relative min-h-[64px]">
      <AnimatePresence>
        {job.undo && (
          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className={`relative rounded-lg border border-dashed bg-[color-mix(in_srgb,var(--severe)_8%,var(--canvas-subtle))] ${compact ? "px-3 py-2" : "px-4 py-3"}`}
            style={{ borderColor: STATUS_COLORS[job.undo] }}
          >
            <span className="absolute -top-3 left-6 h-3 w-0.5 bg-severe" />
            <div className="flex items-center gap-2.5">
              <StatusIcon status={job.undo} size={compact ? 15 : 17} />
              <span className={`font-semibold text-severe ${compact ? "text-[12.5px]" : "text-[14px]"}`}>{meta.undo}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UndoConnector({ active }: { active: boolean }) {
  return (
    <div className="relative h-6 self-center">
      <AnimatePresence>
        {active && (
          <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 56 24"
            preserveAspectRatio="none"
          >
            <line x1="56" y1="12" x2="6" y2="12" stroke="var(--severe)" strokeWidth="2" className="flow-reverse" />
            <path d="M10 6 3 12l7 6" fill="none" stroke="var(--severe)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  );
}
