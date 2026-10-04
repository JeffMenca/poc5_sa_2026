"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Steps } from "./DeckContext";

interface StageProps {
  icon: ReactNode;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  steps?: number;
  children: ReactNode;
}

export function Stage({ icon, eyebrow, title, lede, steps = 0, children }: StageProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-6 py-10">
      <Steps count={steps} />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <p className="mb-3 flex items-center gap-2 text-[13px] font-medium text-fg-muted">
          {icon}
          {eyebrow}
        </p>
        <h1 className="font-display text-[44px] font-bold leading-[1.02] tracking-[-0.02em] [font-stretch:115%] sm:text-[56px]">
          {title}
        </h1>
        {lede && <p className="mt-4 max-w-2xl text-[18px] leading-snug text-fg-muted">{lede}</p>}
      </motion.div>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}

interface RevealProps {
  when: boolean;
  children: ReactNode;
  className?: string;
  delay?: number;
  focusStep?: number;
}

export function Reveal({ when, children, className, delay = 0, focusStep }: RevealProps) {
  return (
    <motion.div
      className={className}
      data-focus-step={focusStep}
      initial={false}
      animate={when ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 16, filter: "blur(6px)" }}
      transition={{ duration: 0.5, delay: when ? delay : 0, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: when ? "auto" : "none" }}
    >
      {children}
    </motion.div>
  );
}
