import type { z } from "zod";
import { DomainError } from "./domain-error";

export function parseBody<T extends z.ZodType>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new DomainError(400, "INVALID_REQUEST", `${issue?.path.join(".") || "body"}: ${issue?.message}`);
  }
  return result.data;
}
