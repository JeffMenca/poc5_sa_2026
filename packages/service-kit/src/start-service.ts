import type { Express } from "express";
import { SERVICE_PORTS, type ServiceKey } from "@poc5/contracts";

export function startService(service: ServiceKey, app: Express) {
  const port = Number(process.env.PORT) || SERVICE_PORTS[service];
  const server = app.listen(port, () => console.log(`[${service}] listening on http://localhost:${port}`));

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => server.close(() => process.exit(0)));
  }
  return server;
}
