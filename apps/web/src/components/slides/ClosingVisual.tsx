"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FilterIcon, PlayIcon, UndoIcon, ZapIcon } from "@primer/octicons-react";

const LESSONS = [
  { icon: <UndoIcon size={28} />, color: "var(--severe)", title: "Sin rollback, se compensa", text: "Deshacer en orden inverso, repetible e insistente." },
  { icon: <ZapIcon size={28} />, color: "var(--accent)", title: "Fallar rápido > fallar lento", text: "Cortar a tiempo protege al resto del sistema." },
  { icon: <FilterIcon size={28} />, color: "var(--success)", title: "No todo error es una falla", text: "«Sin stock» es el servicio funcionando bien." },
];

export function ClosingVisual() {
  return (
    <div className="flex flex-1 flex-col gap-10">
      <div className="grid gap-5 md:grid-cols-3">
        {LESSONS.map((lesson, index) => (
          <motion.div
            key={lesson.title}
            initial={{ opacity: 0, y: 30, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.2 + index * 0.18, type: "spring", stiffness: 140, damping: 16 }}
            className="rounded-xl border border-border bg-canvas-subtle p-6"
            style={{ borderTop: `3px solid ${lesson.color}` }}
          >
            <span style={{ color: lesson.color }}>{lesson.icon}</span>
            <p className="mt-4 font-display text-[24px] font-bold leading-tight [font-stretch:110%]">{lesson.title}</p>
            <p className="mt-2 text-[16px] text-fg-muted">{lesson.text}</p>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="flex flex-wrap items-center gap-4">
        <Link
          href="/demo"
          className="flex items-center gap-2 rounded-lg bg-success-emphasis px-5 py-3 text-[17px] font-semibold text-white transition-colors hover:bg-[#29903b]"
        >
          <PlayIcon size={18} /> Abrir la demo
        </Link>
        <code className="rounded-lg border border-border bg-canvas-inset px-4 py-3 font-mono text-[15px]">
          <span className="text-success">$</span> npm run dev
        </code>
      </motion.div>
    </div>
  );
}
