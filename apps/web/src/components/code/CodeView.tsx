"use client";

import { Fragment, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CommentDiscussionIcon, FileCodeIcon } from "@primer/octicons-react";
import { useStep } from "@/components/deck/DeckContext";

export type CodeLine = { content: string; color?: string }[];

export interface CodeNote {
  line: number;
  step: number;
  text: ReactNode;
}

interface CodeViewProps {
  file: string;
  firstLine: number;
  lines: CodeLine[];
  notes: CodeNote[];
}

export function CodeView({ file, firstLine, lines, notes }: CodeViewProps) {
  const step = useStep();
  const visibleNotes = notes.filter((note) => note.step <= step);
  const focused = visibleNotes.at(-1)?.line;
  const directories = file.split("/").slice(0, -1);
  const fileName = file.split("/").at(-1);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-canvas">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-canvas-subtle px-4 py-2.5 text-[13px]">
        <FileCodeIcon className="text-fg-muted" />
        <span className="text-fg-muted">
          {directories.map((directory) => (
            <span key={directory}>
              {directory}
              <span className="px-1">/</span>
            </span>
          ))}
        </span>
        <span className="font-semibold">{fileName}</span>
        <span className="ml-auto text-[12px] text-fg-muted">
          líneas {firstLine}–{firstLine + lines.length - 1} · TypeScript
        </span>
      </div>

      <div className="overflow-x-auto py-2 font-mono text-[13px] leading-[1.75]">
        {lines.map((tokens, index) => {
          const lineNotes = visibleNotes.filter((note) => note.line === index);
          const highlighted = lineNotes.length > 0;
          return (
            <Fragment key={index}>
              <motion.div
                className="flex min-w-max"
                animate={{
                  backgroundColor: highlighted ? "rgba(187,128,9,0.15)" : "rgba(0,0,0,0)",
                  opacity: focused === undefined || focused === index || highlighted ? 1 : 0.55,
                }}
                transition={{ duration: 0.3 }}
              >
                <span
                  className="w-14 shrink-0 select-none pr-4 text-right text-fg-subtle"
                  style={{ boxShadow: highlighted ? "inset 2px 0 0 var(--attention)" : undefined }}
                >
                  {firstLine + index}
                </span>
                <span className="whitespace-pre pr-6">
                  {tokens.length === 0
                    ? " "
                    : tokens.map((token, position) => (
                        <span key={position} style={{ color: token.color }}>
                          {token.content}
                        </span>
                      ))}
                </span>
              </motion.div>

              <AnimatePresence>
                {lineNotes.map((note) => (
                  <ReviewComment key={note.step} step={note.step} number={notes.indexOf(note) + 1}>
                    {note.text}
                  </ReviewComment>
                ))}
              </AnimatePresence>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

function ReviewComment({ step, number, children }: { step: number; number: number; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden font-sans"
      data-focus-step={step}
    >
      <div className="mx-4 my-2 ml-14 flex gap-3 rounded-lg border border-border bg-canvas-subtle p-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-emphasis text-white">
          <CommentDiscussionIcon size={16} />
        </span>
        <div>
          <p className="text-[12px] font-semibold text-fg-muted">Nota {number}</p>
          <p className="text-[15px] leading-snug text-fg">{children}</p>
        </div>
      </div>
    </motion.div>
  );
}
