"use client";

import { motion } from "motion/react";
import { CheckCircleFillIcon, CreditCardIcon, NoteIcon, SyncIcon } from "@primer/octicons-react";
import { useStep } from "@/components/deck/DeckContext";
import { Reveal } from "@/components/deck/Stage";
import { WorkflowGraph } from "@/components/visual/WorkflowGraph";
import { useSequence } from "@/hooks/useSequence";
import { COMPENSATION_PATH, FAILURE_PATH, HAPPY_PATH } from "./sagaFrames";

const CAPTIONS = [
  "Cada servicio confirma su paso en su propia base.",
  "Inventory no tiene stock. Payment ya cobró.",
  "Se ejecutan los pasos de deshacer, en orden inverso.",
  "Todo quedó coherente, un momento después.",
];

export function SagaVisual() {
  const step = useStep();
  const happy = useSequence(HAPPY_PATH.length - 1, 650, { restartKey: step === 0 });
  const failure = useSequence(FAILURE_PATH.length, 800, { restartKey: step === 1 });
  const compensation = useSequence(COMPENSATION_PATH.length, 800, { restartKey: step >= 2 });

  const jobs =
    step === 0 ? HAPPY_PATH[happy]! : step === 1 ? FAILURE_PATH[failure]! : COMPENSATION_PATH[compensation]!;

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="rounded-xl border border-border bg-canvas-subtle/60 p-6" data-focus-step="1 2">
        <WorkflowGraph jobs={jobs} />
      </div>

      <motion.p
        key={step}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-[22px] font-semibold"
      >
        {CAPTIONS[Math.min(step, CAPTIONS.length - 1)]}
      </motion.p>

      <div className="grid gap-4 sm:grid-cols-3" data-focus-step="3">
        <Outcome show={step >= 3} delay={0} icon={<CreditCardIcon size={20} />} text="Dinero devuelto" />
        <Outcome show={step >= 3} delay={0.12} icon={<NoteIcon size={20} />} text="Orden cancelada" />
        <Outcome show={step >= 3} delay={0.24} icon={<SyncIcon size={20} />} text="Consistencia eventual" />
      </div>
    </div>
  );
}

function Outcome({ show, delay, icon, text }: { show: boolean; delay: number; icon: React.ReactNode; text: string }) {
  return (
    <Reveal when={show} delay={delay}>
      <div className="flex items-center gap-3 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-[16px] font-semibold">
        <span className="text-success">{icon}</span>
        {text}
        <CheckCircleFillIcon className="ml-auto text-success" />
      </div>
    </Reveal>
  );
}
