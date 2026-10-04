"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRightIcon, CheckCircleFillIcon, CommentIcon, CreditCardIcon, DashIcon, PlusIcon, UndoIcon, ZapIcon } from "@primer/octicons-react";
import { useStep } from "@/components/deck/DeckContext";
import { useSequence } from "@/hooks/useSequence";

const ROWS = [
  { label: "Protege", saga: "Los datos", breaker: "La disponibilidad" },
  { label: "Actúa cuando", saga: "Un paso de negocio falla", breaker: "Un servicio falla seguido" },
  { label: "Responde", saga: "Deshaciendo", breaker: "Cortando al instante" },
];

const TRADEOFFS = {
  saga: { pros: ["Cada servicio es dueño de su base", "Sin bloqueos entre servicios"], cons: ["Un deshacer por cada paso", "Datos a medias por un momento"] },
  breaker: { pros: ["Una falla no tumba a todos", "Respuestas rápidas"], cons: ["Hay que calibrar los umbrales", "Rechaza llamadas mientras está abierto"] },
};

const TOGETHER = [
  { icon: <ZapIcon size={18} />, text: "Breaker de Inventory abierto", color: "var(--danger)" },
  { icon: <CommentIcon size={18} />, text: "503 al instante, sin esperar", color: "var(--accent)" },
  { icon: <UndoIcon size={18} />, text: "La saga lo toma como paso fallido", color: "var(--severe)" },
  { icon: <CreditCardIcon size={18} />, text: "Reembolsa el pago", color: "var(--success)" },
];

const DECISIONS = [
  {
    question: "¿Una operación cruza varios servicios y debe quedar completa o deshecha?",
    examples: "Compras, reservas, transferencias",
    answer: "Saga",
    icon: <UndoIcon size={20} />,
    color: "var(--severe)",
    avoid: "No la uses si todo cabe en una sola base: ahí basta una transacción.",
  },
  {
    question: "¿Llamas a algo remoto que puede caerse o ponerse lento?",
    examples: "Otro servicio, una API externa, una base remota",
    answer: "Circuit Breaker",
    icon: <ZapIcon size={20} />,
    color: "var(--accent)",
    avoid: "No lo uses en llamadas locales o sin una respuesta alternativa.",
  },
  {
    question: "¿Las dos cosas a la vez?",
    examples: "Como esta compra",
    answer: "Los dos juntos",
    icon: <CheckCircleFillIcon size={20} />,
    color: "var(--success)",
    avoid: "El breaker corta rápido; la saga deshace lo que quedó a medias.",
  },
];

export function ComparisonVisual() {
  const step = useStep();

  return (
    <AnimatePresence mode="wait">
      {step < 2 ? (
        <motion.div key="versus" exit={{ opacity: 0, y: -16 }} className="space-y-3">
          <div className="grid grid-cols-[180px_1fr_1fr] gap-3">
            <span />
            <Header icon={<UndoIcon size={22} />} name="Saga" color="var(--severe)" />
            <Header icon={<ZapIcon size={22} />} name="Circuit Breaker" color="var(--accent)" />
          </div>
          {ROWS.map((row, index) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.12 }}
              className="grid grid-cols-[180px_1fr_1fr] items-center gap-3"
            >
              <span className="text-[15px] text-fg-muted">{row.label}</span>
              <Cell>{row.saga}</Cell>
              <Cell>{row.breaker}</Cell>
            </motion.div>
          ))}
          <AnimatePresence>
            {step >= 1 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} data-focus-step="1" className="grid grid-cols-[180px_1fr_1fr] gap-3 pt-3">
                <span className="text-[15px] text-fg-muted">Ventajas y costos</span>
                <Tradeoffs {...TRADEOFFS.saga} />
                <Tradeoffs {...TRADEOFFS.breaker} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : step === 2 ? (
        <motion.div key="together" data-focus-step="2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
          <p className="font-display text-[30px] font-bold [font-stretch:110%]">No compiten: se necesitan</p>
          <Together />
        </motion.div>
      ) : (
        <motion.div key="decision" data-focus-step="3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <p className="font-display text-[30px] font-bold [font-stretch:110%]">¿Cuál uso?</p>
          {DECISIONS.map((decision, index) => (
            <Decision key={decision.answer} {...decision} index={index} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Header({ icon, name, color }: { icon: React.ReactNode; name: string; color: string }) {
  return (
    <p className="flex items-center gap-2 font-display text-[26px] font-bold [font-stretch:110%]" style={{ color }}>
      {icon}
      {name}
    </p>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return <span className="rounded-lg border border-border bg-canvas-subtle px-4 py-3.5 text-[18px] font-semibold">{children}</span>;
}

function Tradeoffs({ pros, cons }: { pros: string[]; cons: string[] }) {
  return (
    <div className="space-y-1.5 rounded-lg border border-border bg-canvas-subtle px-4 py-3 text-[14.5px]">
      {pros.map((item) => (
        <p key={item} className="flex items-center gap-2">
          <PlusIcon className="text-success" /> {item}
        </p>
      ))}
      {cons.map((item) => (
        <p key={item} className="flex items-center gap-2 text-fg-muted">
          <DashIcon className="text-danger" /> {item}
        </p>
      ))}
    </div>
  );
}

function Together() {
  const frame = useSequence(TOGETHER.length + 2, 800, { loop: true });
  return (
    <div className="flex flex-wrap items-center gap-3">
      {TOGETHER.map((item, index) => (
        <div key={item.text} className="flex items-center gap-3">
          <motion.div
            animate={{
              opacity: index < frame ? 1 : 0.25,
              borderColor: index < frame ? item.color : "var(--border)",
              scale: index === frame - 1 ? 1.06 : 1,
            }}
            className="flex w-56 items-center gap-3 rounded-xl border-2 bg-canvas-subtle px-4 py-4 text-[16px] font-semibold"
          >
            <span style={{ color: item.color }}>{item.icon}</span>
            {item.text}
          </motion.div>
          {index < TOGETHER.length - 1 && (
            <motion.span animate={{ opacity: index < frame - 1 ? 1 : 0.2 }} className="text-[22px] text-fg-muted">
              →
            </motion.span>
          )}
        </div>
      ))}
    </div>
  );
}

function Decision({ question, examples, answer, icon, color, avoid, index }: (typeof DECISIONS)[number] & { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.25, duration: 0.45 }}
      className="grid items-center gap-4 rounded-xl border border-border bg-canvas-subtle px-5 py-4 md:grid-cols-[1fr_auto_240px]"
    >
      <div>
        <p className="text-[18px] font-semibold">{question}</p>
        <p className="text-[14px] text-fg-muted">{examples}</p>
      </div>
      <motion.span
        animate={{ x: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.4, delay: index * 0.25 }}
        className="hidden text-fg-muted md:block"
      >
        <ArrowRightIcon size={22} />
      </motion.span>
      <div>
        <p className="flex items-center gap-2 font-display text-[22px] font-bold [font-stretch:110%]" style={{ color }}>
          {icon}
          {answer}
        </p>
        <p className="text-[13px] text-fg-muted">{avoid}</p>
      </div>
    </motion.div>
  );
}
