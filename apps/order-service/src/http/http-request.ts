import type { ApiError, ErrorCode } from "@poc5/contracts";

export interface HttpRequest {
  method: "GET" | "POST" | "DELETE";
  path: string;
  body?: unknown;
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export async function sendJson<T>(baseUrl: string, { method, path, body }: HttpRequest): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    const error = payload as Partial<ApiError> | undefined;
    throw new HttpError(response.status, error?.code ?? "INTERNAL_ERROR", error?.message ?? response.statusText);
  }
  return payload as T;
}

export function describeRequest({ method, path }: HttpRequest): string {
  return `${method} ${path}`;
}
