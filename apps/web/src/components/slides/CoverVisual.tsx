"use client";

import { motion } from "motion/react";
import { QuestionIcon, UndoIcon, ZapIcon } from "@primer/octicons-react";
import { Reveal } from "@/components/deck/Stage";
import { useStep } from "@/components/deck/DeckContext";
import { WorkflowGraph } from "@/components/visual/WorkflowGraph";
import { useSequence } from "@/hooks/useSequence";
import { FAILURE_PATH, HAPPY_PATH } from "./sagaFrames";

export function CoverVisual() {
  const step = useStep();
  const happy = useSequence(HAPPY_PATH.length, 700, { loop: true, paused: step > 0 });
  const failure = useSequence(FAILURE_PATH.length, 900, { restartKey: step >= 1 });
  const jobs = step === 0 ? HAPPY_PATH[happy]! : FAILURE_PATH[failure]!;

  return (
    <div className="flex flex-1 flex-col gap-10">
      <div className="rounded-xl border border-border bg-canvas-subtle/60 p-6">
        <p className="mb-4 flex items-center gap-2 text-[13px] text-fg-muted">
          <span className="font-semibold text-fg">Comprar un teclado</span>
          <span>·</span>
          {step === 0 ? "cuando todo sale bien" : "cuando Inventory dice que no"}
        </p>
        <WorkflowGraph jobs={jobs} />
      </div>

      <Reveal when={step >= 1} focusStep={1} className="flex items-center gap-3 text-[22px] font-semibold">
        <motion.span animate={{ rotate: [0, -12, 12, 0] }} transition={{ repeat: Infinity, duration: 1.6, repeatDelay: 1 }}>
          <QuestionIcon size={28} className="text-attention" />
        </motion.span>
        Ya cobramos Q450. ¿Cómo lo devolvemos?
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2" data-focus-step="2">
        <QuestionCard
          show={step >= 2}
          delay={0}
          icon={<UndoIcon size={24} />}
          color="var(--severe)"
          name="Saga"
          question="Deshacer lo que ya se hizo"
        />
        <QuestionCard
          show={step >= 2}
          delay={0.15}
          icon={<ZapIcon size={24} />}
          color="var(--accent)"
          name="Circuit Breaker"
          question="Que una falla no tumbe todo"
        />
      </div>
    </div>
  );
}

interface QuestionCardProps {
  show: boolean;
  delay: number;
  icon: React.ReactNode;
  color: string;
  name: string;
  question: string;
}

function QuestionCard({ show, delay, icon, color, name, question }: QuestionCardProps) {
  return (
    <Reveal when={show} delay={delay}>
      <div className="flex items-center gap-4 rounded-xl border border-border bg-canvas-subtle p-5">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-lg"
          style={{ color, background: `color-mix(in srgb, ${color} 15%, transparent)` }}
        >
          {icon}
        </span>
        <div>
          <p className="font-display text-[22px] font-bold [font-stretch:110%]" style={{ color }}>
            {name}
          </p>
          <p className="text-[16px] text-fg-muted">{question}</p>
        </div>
      </div>
    </Reveal>
  );
}
