import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const source = path.join(root, "docs", "00-informe.md");
const target = path.join(root, "docs", "informe.docx");
const reference = path.join(root, "scripts", "informe-plantilla.docx");

// Page width minus both margins, in twips. Must match the reference doc's sectPr.
const TEXT_WIDTH = 12240 - 1080 - 1080;

// Auto identifiers are off so Word does not get a bookmark per heading.
execFileSync(
  "pandoc",
  [
    source,
    "-o", target,
    "--from", "gfm-gfm_auto_identifiers",
    "--reference-doc", reference,
    "--shift-heading-level-by=-1",
    "--metadata", "lang=es-GT",
  ],
  { stdio: "inherit" },
);

const work = fs.mkdtempSync(path.join(os.tmpdir(), "docx-"));
execFileSync("unzip", ["-q", "-o", target, "-d", work]);

const documentPath = path.join(work, "word", "document.xml");
let xml = fs.readFileSync(documentPath, "utf8");

// Pandoc sizes tables for a 5.5 in page; stretch them to the full text column.
xml = xml.replace(/<w:tblW[^/]*\/>/g, '<w:tblW w:type="pct" w:w="5000" />');
xml = xml.replace(/<w:tblGrid>([\s\S]*?)<\/w:tblGrid>/g, (all, grid) => {
  const widths = [...grid.matchAll(/<w:gridCol w:w="(\d+)"\s*\/>/g)].map((m) => Number(m[1]));
  const total = widths.reduce((sum, w) => sum + w, 0);
  if (!total) return all;
  const scaled = widths.map((w) => Math.round((w / total) * TEXT_WIDTH));
  return `<w:tblGrid>${scaled.map((w) => `<w:gridCol w:w="${w}" />`).join("")}</w:tblGrid>`;
});

fs.writeFileSync(documentPath, xml);

fs.rmSync(target);
execFileSync("zip", ["-q", "-X", "-r", target, "."], { cwd: work });
fs.rmSync(work, { recursive: true, force: true });

console.log(`Informe listo: ${path.relative(process.cwd(), target)}`);
