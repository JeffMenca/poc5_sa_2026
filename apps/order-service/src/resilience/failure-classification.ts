import { BreakerError, BreakerMaxAllowedRequestError } from "mollitia";
import { HttpError } from "../http/http-request";

export function isBusinessRejection(error: unknown): error is HttpError {
  return error instanceof HttpError && error.status < 500;
}

export function isTechnicalFailure(error: unknown): boolean {
  return !isBusinessRejection(error);
}

export function isShortCircuit(error: unknown): boolean {
  return error instanceof BreakerError || error instanceof BreakerMaxAllowedRequestError;
}

export function isRetryable(error: unknown): boolean {
  return isTechnicalFailure(error) && !isShortCircuit(error);
}
