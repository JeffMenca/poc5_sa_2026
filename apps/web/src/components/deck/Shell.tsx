"use client";

import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, RepoIcon } from "@primer/octicons-react";
import { usePointer } from "@/components/PresenterPointer";
import { SECTIONS, SLIDES, firstSlideOf } from "@/lib/slides";
import { DeckProvider, useDeck } from "./DeckContext";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <DeckProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="dot-grid relative flex flex-1 flex-col">{children}</main>
          <Footer />
        </div>
      </DeckProvider>
    </Suspense>
  );
}

function Header() {
  const { index } = useDeck();
  const current = SLIDES[index]!;
  const [pointerOn, togglePointer] = usePointer();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-canvas-inset/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-3 px-6">
        <RepoIcon className="text-fg-muted" />
        <Link href="/" className="text-[15px]">
          <span className="text-accent">poc5</span>
          <span className="px-1 text-fg-muted">/</span>
          <span className="font-semibold text-accent">saga-vs-circuit-breaker</span>
        </Link>
        <span className="rounded-full border border-border px-2 text-[12px] text-fg-muted">Public</span>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={togglePointer}
            aria-pressed={pointerOn}
            className={`rounded-md border px-3 py-1 text-[12px] transition-colors ${
              pointerOn ? "border-accent text-accent" : "border-border text-fg-muted hover:text-fg"
            }`}
          >
            Puntero
          </button>
          <Link
            href="/demo"
            className="flex items-center gap-2 rounded-md border border-[rgba(240,246,252,0.1)] bg-success-emphasis px-3 py-1 text-[13px] font-medium text-white transition-colors hover:bg-[#29903b]"
          >
            <PlayIcon size={14} />
            Demo en vivo
          </Link>
        </div>
      </div>

      <nav className="mx-auto flex max-w-[1280px] gap-1 px-4" aria-label="Secciones">
        {SECTIONS.map((section) => {
          const active = section === current.section;
          return (
            <Link
              key={section}
              href={firstSlideOf(section).href}
              className="relative px-3 pb-2.5 pt-1 text-[14px] text-fg transition-colors"
            >
              <span className={`rounded-md px-2 py-1 ${active ? "font-semibold" : "text-fg-muted hover:bg-overlay hover:text-fg"}`}>
                {section}
              </span>
              {active && (
                <motion.span layoutId="tab-underline" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-tab-active" />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

function Footer() {
  const { index, step, stepCount, goTo, forward, back } = useDeck();

  return (
    <footer className="sticky bottom-0 z-30 border-t border-border bg-canvas-inset/95 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-[1280px] items-center gap-4 px-6">
        <div className="flex gap-1">
          {SLIDES.map((slide, i) => (
            <Link
              key={slide.href}
              href={slide.href}
              title={slide.title}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === index ? 28 : 10,
                background: i === index ? "var(--accent)" : i < index ? "var(--fg-subtle)" : "var(--border)",
              }}
            />
          ))}
        </div>

        {stepCount > 0 && (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: stepCount + 1 }, (_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Paso ${i + 1}`}
                className="h-2 w-2 rounded-full transition-colors"
                style={{ background: i <= step ? "var(--tab-active)" : "var(--border)" }}
              />
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-3 text-[12px] text-fg-muted">
          <span className="font-mono">
            {String(index + 1).padStart(2, "0")} / {SLIDES.length}
          </span>
          <button onClick={back} aria-label="Anterior" className="rounded-md border border-border p-1.5 hover:bg-overlay">
            <ChevronLeftIcon />
          </button>
          <button onClick={forward} aria-label="Siguiente" className="rounded-md border border-border p-1.5 hover:bg-overlay">
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </footer>
  );
}
