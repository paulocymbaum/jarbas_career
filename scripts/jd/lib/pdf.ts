// Renders an approved cv.md to an ATS-safe PDF — same Playwright/pdf-lib pipeline as build-resumes.
// Markdown subset: h1-h3, "- " bullets, **bold**, paragraphs, "---" rule.

import fs from "node:fs";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { chromium } from "playwright";

const MAX_PAGES = 2;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(value: string): string {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`/g, "");
}

/** Markdown subset (h1–h3, "- " bullets, **bold**, paragraphs, "---" rule) → HTML body. */
export function markdownSubsetBody(markdown: string): string {
  const out: string[] = [];
  let inList = false;

  const closeList = (): void => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0) {
      closeList();
      continue;
    }

    if (/^- /.test(line)) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${renderInline(line.slice(2))}</li>`);
      continue;
    }
    closeList();

    if (line === "---") {
      out.push("<hr />");
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    out.push(`<p>${renderInline(line)}</p>`);
  }
  closeList();

  return out.join("\n");
}

/** Full CV print document (used for the approved-CV PDF). */
export function cvMarkdownToHtml(markdown: string): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  /* Margins MUST live here: Chromium honors CSS @page margin over the
     page.pdf margin params (params are ignored when @page margin exists). */
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "DejaVu Sans", Arial, Helvetica, sans-serif;
    font-size: 10.5pt;
    line-height: 1.4;
    color: #111;
    margin: 0;
  }
  h1 { font-size: 19pt; margin: 0 0 2pt; line-height: 1.2; }
  h2 {
    font-size: 12pt;
    margin: 12pt 0 4pt;
    padding-bottom: 2pt;
    border-bottom: 1px solid #333;
    break-after: avoid;
  }
  h3 { font-size: 11pt; margin: 8pt 0 2pt; break-after: avoid; }
  p { margin: 2pt 0; }
  ul { margin: 2pt 0 6pt; padding-left: 16pt; }
  li { margin-bottom: 2pt; break-inside: avoid; }
  hr { border: none; border-top: 1px solid #333; margin: 6pt 0; }
  strong { font-weight: 700; }
</style>
</head>
<body>
${markdownSubsetBody(markdown)}
</body>
</html>
`;
}

async function countPdfPages(buffer: Buffer): Promise<number> {
  const pdf = await PDFDocument.load(buffer);
  return pdf.getPageCount();
}

/** Renders cv.md markdown to a ≤2-page A4 PDF at outputPath. Throws on overflow. */
export async function renderCvPdf(markdown: string, outputPath: string): Promise<{ pages: number }> {
  const html = cvMarkdownToHtml(markdown);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      // 0 here: margins are declared via CSS @page (see <style> above).
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
    await page.close();

    const pages = await countPdfPages(buffer);
    if (pages > MAX_PAGES) {
      throw new Error(
        `Approved CV renders to ${pages} pages (max ${MAX_PAGES}). Trim cv.md — gate word limit is 1000.`,
      );
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, buffer);
    return { pages };
  } finally {
    await browser.close();
  }
}
