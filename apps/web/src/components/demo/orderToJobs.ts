import type { DependencyKey, Order, SagaLogEntry } from "@poc5/contracts";
import type { JobStatus } from "@/components/visual/StatusIcon";
import type { WorkflowJob } from "@/components/visual/WorkflowGraph";
import { ERROR_LABELS } from "@/lib/labels";

const DEPENDENCIES: DependencyKey[] = ["payment", "inventory", "shipping"];

export function orderToJobs(order: Order): WorkflowJob[] {
  const failedIndex = DEPENDENCIES.findIndex((service) => {
    const outcome = executionOf(order, service)?.outcome;
    return outcome !== undefined && outcome !== "succeeded";
  });
  const cancelled = order.status === "CANCELLED";

  const orderJob: WorkflowJob = {
    service: "order",
    status: "success",
    undo: cancelled ? "compensated" : order.status === "COMPENSATING" ? "queued" : undefined,
  };

  const dependencyJobs = DEPENDENCIES.map((service, index): WorkflowJob => {
    const execution = executionOf(order, service);
    return {
      service,
      status: forwardStatus(order, execution, index, failedIndex),
      undo: undoStatus(order, service),
      note: execution?.code ? ERROR_LABELS[execution.code] : undefined,
    };
  });

  return [orderJob, ...dependencyJobs];
}

function executionOf(order: Order, service: DependencyKey): SagaLogEntry | undefined {
  return order.log.find((entry) => entry.service === service && entry.phase === "execute");
}

function forwardStatus(order: Order, execution: SagaLogEntry | undefined, index: number, failedIndex: number): JobStatus {
  if (execution) return execution.outcome === "succeeded" ? "success" : "failure";
  if (failedIndex >= 0 && index > failedIndex) return "skipped";
  if (order.status === "PENDING") {
    const completed = DEPENDENCIES.filter((service) => executionOf(order, service)).length;
    return index === completed ? "running" : "queued";
  }
  return "skipped";
}

function undoStatus(order: Order, service: DependencyKey): JobStatus | undefined {
  if (order.pendingCompensations.includes(service)) return "compensating";
  const compensation = order.log.findLast((entry) => entry.service === service && entry.phase === "compensate");
  if (!compensation) return undefined;
  return compensation.outcome === "unavailable" ? "compensating" : "compensated";
}
