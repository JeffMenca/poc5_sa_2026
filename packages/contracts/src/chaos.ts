export const CHAOS_MODES = ["healthy", "failing", "slow", "hanging"] as const;

export type ChaosMode = (typeof CHAOS_MODES)[number];

export const SLOW_RESPONSE_MS = 1_200;

export const HANGING_RESPONSE_MS = 5_000;

export function isChaosMode(value: unknown): value is ChaosMode {
  return CHAOS_MODES.includes(value as ChaosMode);
}
