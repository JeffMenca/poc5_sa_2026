import type { WorkflowJob } from "@/components/visual/WorkflowGraph";
import type { JobStatus } from "@/components/visual/StatusIcon";

type Row = [JobStatus, JobStatus, JobStatus, JobStatus];

function jobs(statuses: Row, undo: Partial<Record<number, JobStatus>> = {}, notes: Partial<Record<number, string>> = {}): WorkflowJob[] {
  const services = ["order", "payment", "inventory", "shipping"] as const;
  return services.map((service, index) => ({
    service,
    status: statuses[index]!,
    undo: undo[index],
    note: notes[index],
  }));
}

export const HAPPY_PATH: WorkflowJob[][] = [
  jobs(["queued", "queued", "queued", "queued"]),
  jobs(["running", "queued", "queued", "queued"]),
  jobs(["success", "running", "queued", "queued"]),
  jobs(["success", "success", "running", "queued"]),
  jobs(["success", "success", "success", "running"]),
  jobs(["success", "success", "success", "success"]),
  jobs(["success", "success", "success", "success"]),
];

export const FAILURE_PATH: WorkflowJob[][] = [
  jobs(["success", "success", "running", "queued"]),
  jobs(["success", "success", "failure", "skipped"], {}, { 1: "Q450 cobrados", 2: "Sin stock" }),
];

export const COMPENSATION_PATH: WorkflowJob[][] = [
  jobs(["success", "success", "failure", "skipped"], { 1: "compensating" }, { 2: "Sin stock" }),
  jobs(["success", "success", "failure", "skipped"], { 1: "compensated" }, { 2: "Sin stock" }),
  jobs(["success", "success", "failure", "skipped"], { 0: "compensating", 1: "compensated" }, { 2: "Sin stock" }),
  jobs(["success", "success", "failure", "skipped"], { 0: "compensated", 1: "compensated" }, { 2: "Sin stock" }),
];
