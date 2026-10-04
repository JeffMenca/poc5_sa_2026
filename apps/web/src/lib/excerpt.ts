export interface LineRange {
  start: number;
  end: number;
}

const OPENERS = new Set(["{", "(", "["]);
const CLOSERS = new Set(["}", ")", "]"]);

export function locateSymbol(lines: string[], symbol: string): LineRange {
  const start = findDeclaration(lines, symbol);
  if (start < 0) throw new Error(`Symbol "${symbol}" not found`);
  return { start, end: findEnd(lines, start) };
}

export function dedent(lines: string[]): string[] {
  const indents = lines.filter((line) => line.trim()).map((line) => line.length - line.trimStart().length);
  const shared = Math.min(...indents);
  return lines.map((line) => line.slice(shared));
}

function findDeclaration(lines: string[], symbol: string): number {
  const declaration = new RegExp(
    String.raw`^\s*(export\s+)?(default\s+)?(async\s+)?(function|class|const|let|interface|type|enum)\s+${symbol}\b`,
  );
  const method = new RegExp(
    String.raw`^\s*((public|private|protected|static|readonly|async)\s+)*${symbol}\s*[(<].*\{\s*$`,
  );
  const byDeclaration = lines.findIndex((line) => declaration.test(line));
  return byDeclaration >= 0 ? byDeclaration : lines.findIndex((line) => method.test(line));
}

function findEnd(lines: string[], start: number): number {
  let depth = 0;
  let opened = false;

  for (let index = start; index < lines.length; index++) {
    const line = stripStringsAndComments(lines[index] ?? "");
    for (const char of line) {
      if (OPENERS.has(char)) {
        depth++;
        opened = true;
      } else if (CLOSERS.has(char)) {
        depth--;
      }
    }
    if (opened && depth === 0) return index;
    if (!opened && line.trimEnd().endsWith(";")) return index;
  }
  return lines.length - 1;
}

function stripStringsAndComments(line: string): string {
  return line
    .replace(/(["'])(?:\\.|(?!\1).)*\1/g, '""')
    .replace(/\/\/.*$/, "");
}
