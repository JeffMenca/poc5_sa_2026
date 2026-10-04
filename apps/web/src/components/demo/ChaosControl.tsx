"use client";

import { ClockIcon, HeartIcon, HourglassIcon, XCircleIcon, type Icon } from "@primer/octicons-react";
import { CHAOS_MODES, type ChaosMode } from "@poc5/contracts";
import { CHAOS_LABELS } from "@/lib/labels";

const ICONS: Record<ChaosMode, Icon> = {
  healthy: HeartIcon,
  failing: XCircleIcon,
  slow: ClockIcon,
  hanging: HourglassIcon,
};

interface ChaosControlProps {
  mode?: ChaosMode;
  disabled: boolean;
  onChange: (mode: ChaosMode) => void;
}

export function ChaosControl({ mode, disabled, onChange }: ChaosControlProps) {
  return (
    <div>
      <div className="grid grid-cols-4 overflow-hidden rounded-md border border-border" role="radiogroup" aria-label="Simular falla">
        {CHAOS_MODES.map((candidate) => {
          const ModeIcon = ICONS[candidate];
          const selected = mode === candidate;
          const tone = candidate === "healthy" ? "success" : "danger";
          return (
            <button
              key={candidate}
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(candidate)}
              title={CHAOS_LABELS[candidate].hint}
              className={`flex items-center justify-center gap-1.5 border-r border-border px-2 py-1.5 text-[12px] font-medium transition-colors last:border-r-0 disabled:opacity-40 ${
                selected
                  ? tone === "success"
                    ? "bg-success-emphasis text-white"
                    : "bg-danger-emphasis text-white"
                  : "bg-canvas text-fg-muted hover:bg-overlay hover:text-fg"
              }`}
            >
              <ModeIcon size={12} />
              {CHAOS_LABELS[candidate].title}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-[11.5px] text-fg-muted">{mode ? CHAOS_LABELS[mode].hint : "Sin conexión"}</p>
    </div>
  );
}
