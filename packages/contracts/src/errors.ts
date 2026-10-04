export type ErrorCode =
  | "INVALID_REQUEST"
  | "NOT_FOUND"
  | "PAYMENT_DECLINED"
  | "OUT_OF_STOCK"
  | "OUT_OF_COVERAGE"
  | "SERVICE_UNAVAILABLE"
  | "SIMULATED_FAILURE"
  | "INTERNAL_ERROR";

export interface ApiError {
  code: ErrorCode;
  message: string;
}
