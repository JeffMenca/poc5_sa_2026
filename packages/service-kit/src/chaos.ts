import type { RequestHandler } from "express";
import { HANGING_RESPONSE_MS, SLOW_RESPONSE_MS, type ApiError, type ChaosMode } from "@poc5/contracts";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class ChaosSwitch {
  mode: ChaosMode = "healthy";

  middleware(): RequestHandler {
    return async (req, res, next) => {
      if (req.method === "GET") return next();

      switch (this.mode) {
        case "healthy":
          return next();
        case "slow":
          await wait(SLOW_RESPONSE_MS);
          return next();
        case "failing":
          return res.status(500).json(simulatedFailure("The service crashed while processing the request"));
        case "hanging":
          await wait(HANGING_RESPONSE_MS);
          return res.status(503).json(simulatedFailure("The service stopped responding"));
      }
    };
  }
}

function simulatedFailure(message: string): ApiError {
  return { code: "SIMULATED_FAILURE", message };
}
