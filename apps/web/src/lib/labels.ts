import type { BreakerState, ChaosMode, ErrorCode, OrderStatus } from "@poc5/contracts";

export const PRODUCT_LABELS: Record<string, string> = {
  KEYBOARD: "Teclado",
  MONITOR: "Monitor",
  HEADPHONES: "Audífonos",
};

export const ERROR_LABELS: Record<ErrorCode, string> = {
  INVALID_REQUEST: "Petición inválida",
  NOT_FOUND: "No existe",
  PAYMENT_DECLINED: "Tarjeta rechazada: supera el límite",
  OUT_OF_STOCK: "Sin stock",
  OUT_OF_COVERAGE: "No hay envíos a esa ciudad",
  SERVICE_UNAVAILABLE: "Servicio no disponible, intente más tarde",
  SIMULATED_FAILURE: "El servicio falló",
  INTERNAL_ERROR: "Error interno",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En curso",
  COMPLETED: "Completada",
  COMPENSATING: "Deshaciendo",
  CANCELLED: "Cancelada",
};

export const BREAKER_LABELS: Record<BreakerState, { title: string; plain: string; color: string }> = {
  closed: { title: "Cerrado", plain: "Deja pasar las llamadas", color: "var(--success)" },
  open: { title: "Abierto", plain: "Corta las llamadas", color: "var(--danger)" },
  "half-open": { title: "Semiabierto", plain: "Probando con 3 llamadas", color: "var(--attention)" },
};

export const CHAOS_LABELS: Record<ChaosMode, { title: string; hint: string }> = {
  healthy: { title: "Sano", hint: "Responde normal" },
  failing: { title: "Falla", hint: "Responde error 500" },
  slow: { title: "Lento", hint: "Tarda 1.2 s" },
  hanging: { title: "Colgado", hint: "Tarda 5 s y falla" },
};

export function formatQuetzales(amount: number): string {
  return `Q${amount.toLocaleString("es-GT")}`;
}
