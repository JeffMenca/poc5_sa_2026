import cors from "cors";
import express, { type ErrorRequestHandler, type Router } from "express";
import { isChaosMode, type ApiError, type HealthReport, type ServiceKey } from "@poc5/contracts";
import { ChaosSwitch } from "./chaos";
import { DomainError } from "./domain-error";

export interface ServiceDefinition {
  service: ServiceKey;
  routes: Router;
  reset: () => void;
}

export function createService({ service, routes, reset }: ServiceDefinition) {
  const app = express();
  const chaos = new ChaosSwitch();
  const startedAt = Date.now();

  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    const report: HealthReport = {
      service,
      status: "up",
      chaos: chaos.mode,
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    };
    res.json(report);
  });

  app.put("/chaos", (req, res) => {
    const mode: unknown = req.body?.mode;
    if (!isChaosMode(mode)) throw new DomainError(400, "INVALID_REQUEST", "mode must be healthy, failing, slow or hanging");
    chaos.mode = mode;
    res.json({ service, chaos: chaos.mode });
  });

  app.post("/admin/reset", (_req, res) => {
    chaos.mode = "healthy";
    reset();
    res.status(204).end();
  });

  app.use(chaos.middleware(), routes);

  app.use((_req, res) => {
    const body: ApiError = { code: "NOT_FOUND", message: "Route not found" };
    res.status(404).json(body);
  });

  app.use(errorHandler(service));

  return app;
}

function errorHandler(service: ServiceKey): ErrorRequestHandler {
  return (error, _req, res, _next) => {
    if (error instanceof DomainError) {
      const body: ApiError = { code: error.code, message: error.message };
      return res.status(error.status).json(body);
    }
    console.error(`[${service}] unexpected error`, error);
    const body: ApiError = { code: "INTERNAL_ERROR", message: "Unexpected error" };
    res.status(500).json(body);
  };
}
