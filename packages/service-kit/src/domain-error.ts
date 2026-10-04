import type { ErrorCode } from "@poc5/contracts";

export class DomainError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export function notFound(resource: string, id: string): DomainError {
  return new DomainError(404, "NOT_FOUND", `${resource} ${id} does not exist`);
}
