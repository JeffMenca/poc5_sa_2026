import { describe, expect, it } from "vitest";
import type { Order, SagaLogEntry } from "@poc5/contracts";
import { orderToJobs } from "./orderToJobs";

const entry = (service: SagaLogEntry["service"], phase: SagaLogEntry["phase"], outcome: SagaLogEntry["outcome"], code?: SagaLogEntry["code"]): SagaLogEntry => ({
  at: "2026-01-01T00:00:00.000Z",
  service,
  phase,
  request: "",
  outcome,
  durationMs: 1,
  code,
});

const baseOrder: Order = {
  id: "ord_1",
  sku: "KEYBOARD",
  quantity: 1,
  city: "Guatemala",
  amount: 450,
  status: "PENDING",
  completedSteps: [],
  pendingCompensations: [],
  log: [entry("order", "execute", "succeeded")],
  createdAt: "",
  updatedAt: "",
};

const statuses = (order: Order) => orderToJobs(order).map((job) => [job.status, job.undo]);

describe("orderToJobs", () => {
  it("shows a completed order as four successful jobs", () => {
    const order: Order = {
      ...baseOrder,
      status: "COMPLETED",
      log: [...baseOrder.log, entry("payment", "execute", "succeeded"), entry("inventory", "execute", "succeeded"), entry("shipping", "execute", "succeeded")],
    };

    expect(statuses(order)).toEqual([
      ["success", undefined],
      ["success", undefined],
      ["success", undefined],
      ["success", undefined],
    ]);
  });

  it("marks the next step as running while the saga is in progress", () => {
    const order: Order = { ...baseOrder, log: [...baseOrder.log, entry("payment", "execute", "succeeded")] };

    expect(statuses(order).map(([status]) => status)).toEqual(["success", "success", "running", "queued"]);
  });

  it("shows the failed step, skips the rest and marks the undone steps", () => {
    const order: Order = {
      ...baseOrder,
      status: "CANCELLED",
      log: [
        ...baseOrder.log,
        entry("payment", "execute", "succeeded"),
        entry("inventory", "execute", "rejected", "OUT_OF_STOCK"),
        entry("payment", "compensate", "succeeded"),
        entry("order", "compensate", "succeeded"),
      ],
    };

    expect(statuses(order)).toEqual([
      ["success", "compensated"],
      ["success", "compensated"],
      ["failure", undefined],
      ["skipped", undefined],
    ]);
    expect(orderToJobs(order)[2]?.note).toBe("Sin stock");
  });

  it("keeps a compensation that could not run as in progress", () => {
    const order: Order = {
      ...baseOrder,
      status: "COMPENSATING",
      pendingCompensations: ["payment"],
      log: [...baseOrder.log, entry("payment", "execute", "succeeded"), entry("inventory", "execute", "rejected"), entry("payment", "compensate", "unavailable")],
    };

    expect(orderToJobs(order)[1]?.undo).toBe("compensating");
    expect(orderToJobs(order)[0]?.undo).toBe("queued");
  });
});
