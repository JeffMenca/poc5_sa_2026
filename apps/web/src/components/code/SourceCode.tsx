import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import { codeToTokens } from "shiki";
import { dedent, locateSymbol } from "@/lib/excerpt";
import { CodeView, type CodeLine, type CodeNote } from "./CodeView";

const REPOSITORY_ROOT = path.join(process.cwd(), "..", "..");

export interface SourceNote {
  match: string;
  step: number;
  text: ReactNode;
}

interface SourceCodeProps {
  file: string;
  symbol?: string;
  notes?: SourceNote[];
}

export async function SourceCode({ file, symbol, notes = [] }: SourceCodeProps) {
  const allLines = fs.readFileSync(path.join(REPOSITORY_ROOT, file), "utf8").trimEnd().split("\n");
  const range = symbol ? locateSymbol(allLines, symbol) : { start: 0, end: allLines.length - 1 };
  const source = dedent(allLines.slice(range.start, range.end + 1));

  const { tokens } = await codeToTokens(source.join("\n"), { lang: "ts", theme: "github-dark-default" });
  const lines: CodeLine[] = tokens.map((line) => line.map(({ content, color }) => ({ content, color })));

  const resolvedNotes: CodeNote[] = notes.map((note) => ({
    line: lineContaining(source, note.match, file),
    step: note.step,
    text: note.text,
  }));

  return <CodeView file={file} firstLine={range.start + 1} lines={lines} notes={resolvedNotes} />;
}

function lineContaining(lines: string[], match: string, file: string): number {
  const index = lines.findIndex((line) => line.includes(match));
  if (index < 0) throw new Error(`Code note "${match}" not found in ${file}`);
  return index;
}
