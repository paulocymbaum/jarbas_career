// Styled static HTML page for answer documents (profile questions, follow-ups, etc.).

import { markdownSubsetBody } from "./pdf.js";

/** First "# " heading of the markdown, or the fallback title. */
export function firstHeadingTitle(markdown: string, fallback: string): string {
  const match = /^#\s+(.+)$/m.exec(markdown);
  return match ? match[1].trim() : fallback;
}

/** Screen-oriented styled page (not print-tuned like the CV PDF). */
export function renderQaPageHtml(markdown: string, title: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: ui-sans-serif, system-ui, "DejaVu Sans", Arial, Helvetica, sans-serif;
    color: #1c1c1c;
    background: #f4f4f2;
    margin: 0;
    line-height: 1.65;
  }
  main {
    max-width: 860px;
    margin: 0 auto;
    padding: 48px 30px 72px;
    background: #ffffff;
    min-height: 100vh;
  }
  h1 { font-size: 25px; margin: 0 0 8px; letter-spacing: -0.4px; line-height: 1.25; }
  h2 {
    font-size: 16.5px;
    margin: 30px 0 8px;
    padding-left: 10px;
    border-left: 4px solid #5b5bd6;
    color: #161616;
    line-height: 1.45;
  }
  p { margin: 0 0 12px; font-size: 15.5px; }
  strong { color: #000; }
  hr { border: none; border-top: 2px solid #ececec; margin: 18px 0 26px; }
  ul { margin: 4px 0 14px; padding-left: 20px; }
  li { margin-bottom: 4px; }
  @media print {
    body { background: #fff; }
    main { padding: 0; max-width: none; }
  }
</style>
</head>
<body>
<main>
${markdownSubsetBody(markdown)}
</main>
</body>
</html>
`;
}
