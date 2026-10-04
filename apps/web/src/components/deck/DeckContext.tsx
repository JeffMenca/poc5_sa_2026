"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { focusStep, scrollToTop } from "@/lib/focus";
import { SLIDES, slideIndex } from "@/lib/slides";

const FOCUS_DELAY_MS = 380;

interface DeckState {
  index: number;
  step: number;
  stepCount: number;
  setStepCount: (count: number) => void;
  goTo: (step: number) => void;
  forward: () => void;
  back: () => void;
}

const DeckContext = createContext<DeckState | null>(null);

export function DeckProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const index = slideIndex(path);
  const requestedStep = Number(useSearchParams().get("step")) || 0;
  const [position, setPosition] = useState({ path, step: requestedStep });
  const [stepCount, setStepCount] = useState(0);
  const step = position.path === path ? position.step : requestedStep;

  const goTo = useCallback((next: number) => setPosition({ path, step: next }), [path]);

  const forward = useCallback(() => {
    if (step < stepCount) return goTo(step + 1);
    const next = SLIDES[index]?.next ?? SLIDES[index + 1]?.href;
    if (next) router.push(next);
  }, [step, stepCount, index, goTo, router]);

  const back = useCallback(() => {
    if (step > 0) return goTo(step - 1);
    const previous = SLIDES[index - 1];
    if (previous) router.push(previous.href);
  }, [step, index, goTo, router]);

  useEffect(() => {
    if (step === 0) return scrollToTop();
    const timer = setTimeout(() => focusStep(step), FOCUS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [path, step]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
      if (["ArrowRight", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        forward();
      }
      if (["ArrowLeft", "PageUp"].includes(event.key)) {
        event.preventDefault();
        back();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [forward, back]);

  const value = useMemo(
    () => ({ index, step, stepCount, setStepCount, goTo, forward, back }),
    [index, step, stepCount, goTo, forward, back],
  );

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
}

export function useDeck(): DeckState {
  const deck = useContext(DeckContext);
  if (!deck) throw new Error("useDeck must be used inside DeckProvider");
  return deck;
}

export function useStep(): number {
  return useDeck().step;
}

export function Steps({ count }: { count: number }) {
  const { setStepCount } = useDeck();
  useEffect(() => setStepCount(count), [count, setStepCount]);
  return null;
}
