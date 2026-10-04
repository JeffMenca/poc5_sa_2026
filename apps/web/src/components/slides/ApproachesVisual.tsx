"use client";

import { motion } from "motion/react";
import { BroadcastIcon, FileCodeIcon, ListOrderedIcon, PlugIcon, VerifiedIcon } from "@primer/octicons-react";
import type { ServiceKey } from "@poc5/contracts";
import { useStep } from "@/components/deck/DeckContext";
import { Reveal } from "@/components/deck/Stage";
import { useSequence } from "@/hooks/useSequence";
import { SERVICES } from "@/lib/services";

const CHAIN: ServiceKey[] = ["order", "payment", "inventory", "shipping"];
const EVENTS = ["OrderCreated", "PaymentCharged", "StockReserved"];
const COMMANDS = ["cobra", "reserva", "envía"];

export function ApproachesVisual() {
  const step = useStep();
  const frame = useSequence(6, 900, { loop: true });
  const chosen = step >= 1;

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="grid gap-5 lg:grid-cols-2">
        <motion.div animate={{ opacity: chosen ? 0.4 : 1, scale: chosen ? 0.97 : 1 }} className="rounded-xl border border-border bg-canvas-subtle p-6">
          <Heading icon={<BroadcastIcon size={20} />} title="Coreografía" caption="Nadie manda: cada uno reacciona a un evento" />
          <Choreography frame={frame} />
        </motion.div>

        <motion.div
          animate={{
            borderColor: chosen ? "var(--success)" : "var(--border)",
            boxShadow: chosen ? "0 0 0 4px rgba(63,185,80,0.15)" : "0 0 0 0 transparent",
          }}
          className="relative rounded-xl border bg-canvas-subtle p-6"
        >
          <Heading icon={<PlugIcon size={20} />} title="Orquestación" caption="Order dirige: le dice a cada uno qué hacer" />
          <Orchestration frame={frame} />
          <Reveal when={chosen} className="absolute -top-3 right-5">
            <span className="flex items-center gap-1.5 rounded-full bg-success-emphasis px-3 py-1 text-[13px] font-semibold text-white">
              <VerifiedIcon size={14} /> La que usamos
            </span>
          </Reveal>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-3" data-focus-step="1">
        <Reason show={chosen} delay={0} icon={<FileCodeIcon size={20} />} text="Todo el flujo en un archivo" />
        <Reason show={chosen} delay={0.1} icon={<ListOrderedIcon size={20} />} text="4 pasos con orden fijo" />
        <Reason show={chosen} delay={0.2} icon={<PlugIcon size={20} />} text="REST: justo donde protege el breaker" />
      </div>
    </div>
  );
}

function Heading({ icon, title, caption }: { icon: React.ReactNode; title: string; caption: string }) {
  return (
    <div className="mb-6">
      <p className="flex items-center gap-2 font-display text-[24px] font-bold [font-stretch:110%]">
        {icon}
        {title}
      </p>
      <p className="text-[15px] text-fg-muted">{caption}</p>
    </div>
  );
}

function ServiceChip({ service, lit }: { service: ServiceKey; lit: boolean }) {
  const Icon = SERVICES[service].icon;
  return (
    <motion.div
      animate={{ borderColor: lit ? "var(--accent)" : "var(--border)", scale: lit ? 1.06 : 1 }}
      className="flex items-center gap-2 rounded-lg border bg-canvas px-3 py-2 text-[14px] font-semibold"
    >
      <Icon size={16} />
      {SERVICES[service].name}
    </motion.div>
  );
}

function Choreography({ frame }: { frame: number }) {
  const active = Math.min(frame, 3);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-2">
        {CHAIN.map((service, index) => (
          <ServiceChip key={service} service={service} lit={index === active} />
        ))}
      </div>
      <div className="relative h-12 rounded-lg border border-dashed border-border">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-fg-subtle">bus de eventos</span>
        {frame < 3 && (
          <motion.span
            key={frame}
            initial={{ left: `${frame * 25 + 4}%`, opacity: 0 }}
            animate={{ left: `${(frame + 1) * 25 + 4}%`, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute top-1/2 -translate-y-1/2 rounded-full bg-done/20 px-2.5 py-1 font-mono text-[12px] text-done"
          >
            {EVENTS[frame]}
          </motion.span>
        )}
      </div>
    </div>
  );
}

function Orchestration({ frame }: { frame: number }) {
  const active = Math.min(frame, 2);
  return (
    <div className="flex items-center gap-4">
      <ServiceChip service="order" lit />
      <div className="flex flex-1 flex-col gap-2.5">
        {(["payment", "inventory", "shipping"] as const).map((service, index) => (
          <div key={service} className="flex items-center gap-3">
            <div className="relative h-0.5 flex-1 bg-border">
              {index === active && frame < 3 && (
                <motion.span
                  key={frame}
                  initial={{ left: "0%" }}
                  animate={{ left: "80%" }}
                  transition={{ duration: 0.8 }}
                  className="absolute -top-3 rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[11.5px] text-accent"
                >
                  {COMMANDS[index]}
                </motion.span>
              )}
            </div>
            <ServiceChip service={service} lit={index === active && frame < 3} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Reason({ show, delay, icon, text }: { show: boolean; delay: number; icon: React.ReactNode; text: string }) {
  return (
    <Reveal when={show} delay={delay}>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-canvas-subtle px-4 py-3.5 text-[16px] font-semibold">
        <span className="text-success">{icon}</span>
        {text}
      </div>
    </Reveal>
  );
}
