"use client";

import { AnimatePresence, motion } from "motion/react";
import type { BreakerSnapshot, ChaosMode, DependencyKey, HealthReport, ServiceKey } from "@poc5/contracts";
import type { LiveSystem, Packet, PacketKind } from "@/hooks/useLiveSystem";
import { BreakerSwitch } from "@/components/visual/BreakerSwitch";
import { BREAKER_LABELS } from "@/lib/labels";
import { SERVICES } from "@/lib/services";
import { ChaosControl } from "./ChaosControl";

const DEPENDENCIES: DependencyKey[] = ["payment", "inventory", "shipping"];

const SWITCH_POSITION = 46;

const PACKET_STYLES: Record<PacketKind, { color: string; label: string }> = {
  ok: { color: "#3fb950", label: "Llamada que salió bien" },
  rejected: { color: "#d29922", label: "El servicio dijo que no (negocio)" },
  cut: { color: "#f85149", label: "Falló o el breaker la cortó" },
  undo: { color: "#db6d28", label: "Compensación (deshacer)" },
};

interface SystemMapProps {
  system: LiveSystem;
  onChaos: (service: ServiceKey, mode: ChaosMode) => void;
}

export function SystemMap({ system, onChaos }: SystemMapProps) {
  return (
    <div className="rounded-xl border border-border bg-canvas-subtle">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border px-5 py-3">
        {Object.values(PACKET_STYLES).map((style) => (
          <span key={style.label} className="flex items-center gap-2 text-[12.5px] text-fg-muted">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: style.color, boxShadow: `0 0 8px ${style.color}` }} />
            {style.label}
          </span>
        ))}
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[220px_1fr]">
        <OrderCard health={system.health.order} />
        <div className="space-y-3">
          {DEPENDENCIES.map((service) => (
            <Lane
              key={service}
              service={service}
              health={system.health[service]}
              breaker={system.breakers.find((breaker) => breaker.dependency === service)}
              packets={system.packets.filter((packet) => packet.service === service)}
              now={system.observedAt}
              onChaos={(mode) => onChaos(service, mode)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function HealthDot({ up }: { up: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-[11.5px]" style={{ color: up ? "var(--success)" : "var(--danger)" }}>
      <span className="relative flex h-2 w-2">
        {up && <span className="pulse-ring absolute inset-0 rounded-full bg-success" />}
        <span className="relative h-2 w-2 rounded-full" style={{ background: "currentColor" }} />
      </span>
      {up ? "responde" : "apagado"}
    </span>
  );
}

function OrderCard({ health }: { health?: HealthReport }) {
  const Icon = SERVICES.order.icon;
  return (
    <div className="flex flex-col justify-center rounded-xl border-2 border-accent/60 bg-canvas p-5">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
        <Icon size={24} />
      </span>
      <p className="text-[18px] font-bold">Order Service</p>
      <p className="font-mono text-[11.5px] text-fg-subtle">:{SERVICES.order.port}</p>
      <p className="mt-2 text-[13.5px] leading-snug text-fg-muted">
        Recibe la compra, dirige la saga y protege cada llamada con un breaker.
      </p>
      <div className="mt-3">
        <HealthDot up={Boolean(health)} />
      </div>
    </div>
  );
}

interface LaneProps {
  service: DependencyKey;
  health?: HealthReport;
  breaker?: BreakerSnapshot;
  packets: Packet[];
  now: number;
  onChaos: (mode: ChaosMode) => void;
}

function Lane({ service, health, breaker, packets, now, onChaos }: LaneProps) {
  const meta = SERVICES[service];
  const Icon = meta.icon;
  const state = breaker?.state ?? "closed";
  const label = BREAKER_LABELS[state];

  return (
    <div className="grid items-center gap-4 rounded-xl border border-border-muted bg-canvas/40 p-3 md:grid-cols-[1fr_300px]">
      <div className="relative h-[136px]">
        <div className="absolute left-0 right-0 top-[73px] h-[3px] rounded-full bg-border" />
        <motion.div
          className="absolute left-0 top-[73px] h-[3px] rounded-full"
          animate={{ width: state === "open" ? `${SWITCH_POSITION - 6}%` : "100%", background: label.color }}
          transition={{ duration: 0.5 }}
        />

        <div className="absolute top-0 w-[120px] -translate-x-1/2" style={{ left: `${SWITCH_POSITION}%` }}>
          <BreakerSwitch state={state} compact className="w-full" />
        </div>

        <AnimatePresence>
          {packets.map((packet) => (
            <PacketDot key={packet.id} packet={packet} />
          ))}
        </AnimatePresence>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3">
          <div>
            <p className="text-[14px] font-semibold" style={{ color: label.color }}>
              Breaker {label.title.toLowerCase()}
            </p>
            <p className="text-[12.5px] text-fg-muted">{breakerSentence(breaker, meta.name, now)}</p>
          </div>
          {breaker && <MiniWindow breaker={breaker} />}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-canvas p-3.5">
        <div className="mb-2.5 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-overlay">
            <Icon size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold leading-tight">{meta.name}</p>
            <p className="text-[12px] text-fg-muted">
              {meta.action.toLowerCase()} · <span className="font-mono text-fg-subtle">:{meta.port}</span>
            </p>
          </div>
          <HealthDot up={Boolean(health)} />
        </div>
        <ChaosControl mode={health?.chaos} disabled={!health} onChange={onChaos} />
      </div>
    </div>
  );
}

function breakerSentence(breaker: BreakerSnapshot | undefined, name: string, now: number): string {
  if (!breaker) return "Esperando al Order Service…";
  if (breaker.state === "open") {
    const remaining = Math.max(0, Math.ceil((breaker.settings.waitDurationInOpenStateMs - (now - Date.parse(breaker.stateSince))) / 1000));
    return `Order no llama a ${name}: responde «no disponible» al instante. Prueba en ${remaining} s.`;
  }
  if (breaker.state === "half-open") {
    return `Deja pasar llamadas de prueba: ${breaker.window.length} de ${breaker.settings.permittedNumberOfCallsInHalfOpenState}.`;
  }
  return `Las llamadas pasan. Se abre con ${breaker.settings.failureRateThreshold}% de fallas.`;
}

function MiniWindow({ breaker }: { breaker: BreakerSnapshot }) {
  const size = breaker.state === "half-open" ? breaker.settings.permittedNumberOfCallsInHalfOpenState : breaker.settings.slidingWindowSize;
  const recent = breaker.window.slice(-size);
  const colors = { success: "#3fb950", failure: "#f85149", slow: "#d29922" };

  return (
    <div className="shrink-0 text-right">
      <div className="flex gap-[3px]">
        {Array.from({ length: size }, (_, index) => {
          const result = recent[index];
          return (
            <motion.span
              key={`${index}-${result ?? "empty"}`}
              initial={result ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              className="h-3.5 w-2.5 rounded-[3px] border"
              style={result ? { background: colors[result], borderColor: colors[result] } : { borderColor: "var(--border)" }}
            />
          );
        })}
      </div>
      <p className="mt-1 font-mono text-[10.5px] text-fg-subtle">
        {breaker.state === "open"
          ? "ventana reiniciada"
          : `${breaker.state === "half-open" ? "pruebas" : "últimas 10"} · ${breaker.failureRate + breaker.slowCallRate}% mal`}
      </p>
    </div>
  );
}

function PacketDot({ packet }: { packet: Packet }) {
  const { color } = PACKET_STYLES[packet.kind];
  const path =
    packet.kind === "cut"
      ? ["0%", `${SWITCH_POSITION - 4}%`, "0%"]
      : packet.kind === "rejected"
        ? ["0%", "98%", "98%"]
        : ["0%", "98%"];

  return (
    <motion.span
      className="absolute top-[68px] z-10 h-[13px] w-[13px] rounded-full"
      style={{ background: color, boxShadow: `0 0 12px ${color}` }}
      initial={{ left: "0%", opacity: 0 }}
      animate={{ left: path, opacity: [1, 1, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: packet.kind === "cut" ? 1.1 : 1.3, delay: packet.delay, ease: "easeInOut" }}
    />
  );
}
