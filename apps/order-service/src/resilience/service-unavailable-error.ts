import type { DependencyKey } from "@poc5/contracts";

export class ServiceUnavailableError extends Error {
  readonly code = "SERVICE_UNAVAILABLE";

  constructor(
    readonly dependency: DependencyKey,
    readonly reason: string,
  ) {
    super(`${dependency} service is unavailable, please try again later`);
  }
}
