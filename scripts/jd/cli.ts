// Job-application tailoring CLI.
//
// Usage (via `npm run jd -- <command> [args]`):
//   extract <url-or-file> [--role "…"] [--company "…"] [--force]
//   match   <dir>      jd.json → match-report.md
//   gate    <dir>      jd.json → gate.json + gate.md
//   score   <dir>      cv.md × gate.json → gate-report.md (exit 1 on FAIL)
//   deliver <dir>      copy final files to applications/CV and applications/COVER LETTER (gate must PASS)
//
// Global flags: --applications-dir <path> overrides the applications root.

import fs from "node:fs";
import path from "node:path";
import { fetchJobPostingText, htmlToText, isHttpUrl } from "./lib/html-text.js";
import { extractKeywords } from "./lib/keywords.js";
import { parseJd } from "./lib/jd-parse.js";
import {
  applicationDirName,
  applicationsRoot,
  parseInvocation,
  readJson,
  writeText,
  type GlobalArgs,
} from "./lib/paths.js";
import { buildGateJson, renderGateMarkdown, type GateJson } from "./lib/gate.js";
import { matchProfiles, renderMatchReportMarkdown } from "./lib/match.js";
import { renderGateReportMarkdown, scoreCvAgainstGate } from "./lib/score.js";
import {
  QUALITATIVE_CRITERIA,
  REVIEWER_PERSONA,
  scaffoldQualitativeJson,
  type QualitativeJson,
} from "./lib/qualitative.js";
import { renderCvPdf } from "./lib/pdf.js";
import { firstHeadingTitle, renderQaPageHtml } from "./lib/page-html.js";
import type { JdJson } from "./lib/types.js";

const DELIVERY_CV_DIR = "CV";
const DELIVERY_COVER_LETTER_DIR = "COVER LETTER";

function resolveApplicationDir(args: GlobalArgs, dirName: string): string {
  const dir = path.join(applicationsRoot(args), dirName);
  if (!fs.existsSync(dir)) {
    throw new Error(`Application folder not found: ${dir}`);
  }
  return dir;
}

function loadJdJson(dir: string): JdJson {
  const jdPath = path.join(dir, "jd.json");
  if (!fs.existsSync(jdPath)) {
    throw new Error(`jd.json not found in ${dir}. Run \`extract\` first.`);
  }
  const jd = readJson<JdJson>(jdPath);
  if (jd.dir && jd.dir !== path.basename(dir)) {
    console.info(
      `Note: jd.json dir "${jd.dir}" differs from folder name "${path.basename(dir)}"; using jd.json.`,
    );
  }
  return jd;
}

async function loadInputText(
  input: string,
): Promise<{ text: string; sourceType: "url" | "file" }> {
  if (isHttpUrl(input)) {
    return { text: await fetchJobPostingText(input), sourceType: "url" };
  }
  const filePath = path.resolve(input);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Input not found: ${filePath} (pass a URL or a .txt/.md/.html file)`);
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const text = /\.html?$/i.test(filePath) ? htmlToText(raw) : raw;
  return { text, sourceType: "file" };
}

async function cmdExtract(input: string, args: GlobalArgs): Promise<void> {
  const { text, sourceType } = await loadInputText(input);
  if (text.trim().length < 200) {
    throw new Error(
      "Extracted posting text is suspiciously short (<200 chars). The page is likely JS-rendered — browse it, save the visible text to a .txt file, and run extract on that file instead.",
    );
  }

  const parsed = parseJd(text, { role: args.role, company: args.company });
  const dirName = applicationDirName(parsed.role, parsed.company);
  const dir = path.join(applicationsRoot(args), dirName);

  const jdMd = [
    `# Job Description — ${parsed.role} @ ${parsed.company}`,
    parsed.location ? `Location: ${parsed.location}` : null,
    `Source: ${sourceType} — ${input}`,
    "",
    "---",
    "",
    text,
    "",
  ]
    .filter((line) => line !== null)
    .join("\n");
  writeText(path.join(dir, "jd.md"), jdMd);

  const jdJsonPath = path.join(dir, "jd.json");
  if (fs.existsSync(jdJsonPath) && !args.force) {
    console.info(`jd.md refreshed; jd.json kept (use --force to overwrite curated keywords).`);
    console.info(`Next: npm run jd -- match "${dirName}"`);
    return;
  }

  const jdJson: JdJson = {
    version: 1,
    source: { type: sourceType, value: input },
    role: parsed.role,
    company: parsed.company,
    location: parsed.location,
    dir: dirName,
    summary: "",
    requirements: parsed.sections.requirements,
    responsibilities: parsed.sections.responsibilities,
    niceToHave: parsed.sections.niceToHave,
    keywords: extractKeywords(parsed),
    extraKeywords: [],
  };
  writeText(jdJsonPath, `${JSON.stringify(jdJson, null, 2)}\n`);

  const mustHave = jdJson.keywords.filter((keyword) => keyword.weight === 3).length;
  console.info(`Application folder: ${dir}`);
  console.info(
    `Parsed ${jdJson.keywords.length} candidate keywords (${mustHave} must-have) → ${jdJsonPath}`,
  );
  console.info(
    `Next: curate jd.json (verify role/company, write a 1–3 sentence summary, review keywords, add JD-specific terms to extraKeywords), then run: npm run jd -- match "${dirName}"`,
  );
}

function cmdMatch(dirName: string, args: GlobalArgs): void {
  const dir = resolveApplicationDir(args, dirName);
  const jd = loadJdJson(dir);
  const matches = matchProfiles(jd);
  const reportPath = path.join(dir, "match-report.md");
  writeText(reportPath, renderMatchReportMarkdown(jd, matches));

  const best = matches[0];
  console.info(`Match report: ${reportPath}`);
  if (best) {
    console.info(`BEST_PROFILE: ${best.slug}`);
    for (const match of matches) {
      console.info(
        `  ${match.slug.padEnd(20)} must-have ${String(match.mustHaveCoverage).padStart(5)}% · overall ${String(match.coverage).padStart(5)}%`,
      );
    }
  }
  console.info(`Next: npm run jd -- gate "${jd.dir || dirName}"`);
}

function cmdGate(dirName: string, args: GlobalArgs): void {
  const dir = resolveApplicationDir(args, dirName);
  const jd = loadJdJson(dir);
  const gate = buildGateJson(jd);

  const gateJsonPath = path.join(dir, "gate.json");
  const gateMdPath = path.join(dir, "gate.md");
  writeText(gateJsonPath, `${JSON.stringify(gate, null, 2)}\n`);
  writeText(gateMdPath, renderGateMarkdown(gate, jd.summary));

  const mustHave = gate.keywords.filter((keyword) => keyword.weight >= 3).length;
  console.info(`Gate spec: ${gateJsonPath}`);
  console.info(`Gate doc:  ${gateMdPath}`);
  console.info(
    `${gate.keywords.length} keywords (${mustHave} must-have) · thresholds: presence ≥ ${gate.thresholds.presenceScore}%, must-have ≥ ${gate.thresholds.mustHaveCoverage}%, headline ≥ ${Math.round(gate.thresholds.headlineRoleMatchRatio * 100)}%, ≤ ${gate.thresholds.maxWords} words, overall ≥ ${gate.thresholds.minOverallScore}/100 (${Math.round(gate.thresholds.qualitativeWeight * 100)}% agent-graded qualitative)`,
  );
  console.info(
    `Next: write cv.md and cover-letter.md following .claude/skills/job-application/templates, then: npm run jd -- score "${jd.dir || dirName}"`,
  );
}

function assertGatePassed(dir: string): void {
  const reportPath = path.join(dir, "gate-report.md");
  if (!fs.existsSync(reportPath)) {
    throw new Error(`gate-report.md not found in ${dir}. Run \`score\` first.`);
  }
  const report = fs.readFileSync(reportPath, "utf-8");
  const verdict = /\*\*Verdict:\*\*\s*(PASS|FAIL)/i.exec(report);
  if (!verdict || verdict[1].toUpperCase() !== "PASS") {
    throw new Error(
      "Gate verdict is not PASS — improve cv.md per gate-report.md and re-score before delivering.",
    );
  }
  if (!/\*\*Status:\*\* complete/.test(report)) {
    throw new Error(
      'Qualitative review is pending or invalid — run `npm run jd -- qualitative "<dir>"`, grade the rubric with evidence, and re-score before delivering.',
    );
  }
}

function cmdQualitative(dirName: string, args: GlobalArgs): void {
  const dir = resolveApplicationDir(args, dirName);
  const gateJsonPath = path.join(dir, "gate.json");
  if (!fs.existsSync(gateJsonPath)) {
    throw new Error(`gate.json not found in ${dir}. Run \`gate\` first.`);
  }

  const qualPath = path.join(dir, "qualitative.json");
  const previous: QualitativeJson | null = fs.existsSync(qualPath)
    ? readJson<QualitativeJson>(qualPath)
    : null;
  writeText(qualPath, `${JSON.stringify(scaffoldQualitativeJson(previous), null, 2)}\n`);

  console.info(`Qualitative rubric scaffold: ${qualPath}`);
  console.info(
    `Reviewer persona: ${REVIEWER_PERSONA.label} — grade from the hiring side, as the screener who owns the shortlist.`,
  );
  for (const criterion of QUALITATIVE_CRITERIA) {
    console.info(`  ${"★".repeat(criterion.weight)} ${criterion.label} — grade 0–100 with evidence`);
  }
  console.info(
    "Next: read cv.md against the rubric, fill each score + evidence honestly, then re-run: npm run jd -- score",
  );
}

async function cmdScore(dirName: string, args: GlobalArgs): Promise<void> {
  const dir = resolveApplicationDir(args, dirName);
  const gateJsonPath = path.join(dir, "gate.json");
  if (!fs.existsSync(gateJsonPath)) {
    throw new Error(`gate.json not found in ${dir}. Run \`gate\` first.`);
  }
  const gate = readJson<GateJson>(gateJsonPath);

  const cvPath = path.join(dir, "cv.md");
  if (!fs.existsSync(cvPath)) {
    throw new Error(`cv.md not found in ${dir}. Write the tailored CV first (see the skill templates).`);
  }

  const qualitativePath = path.join(dir, "qualitative.json");
  const qualitative: QualitativeJson | null = fs.existsSync(qualitativePath)
    ? readJson<QualitativeJson>(qualitativePath)
    : null;

  const result = scoreCvAgainstGate(fs.readFileSync(cvPath, "utf-8"), gate, qualitative);
  const reportPath = path.join(dir, "gate-report.md");
  writeText(reportPath, renderGateReportMarkdown(gate, result));

  console.info(`Gate report: ${reportPath}`);
  console.info(
    `Verdict: ${result.verdict} · presence ${result.presenceScore}% · must-have ${result.mustHaveCoverage}% · headline ${result.headlineMatchRatio}% · placement ${result.score}/100 (advisory) · overall ${
      result.overallScore !== null ? `${result.overallScore}/100` : "pending qualitative"
    } · ${result.wordCount} words`,
  );

  if (result.qualitative.status === "pending") {
    console.info(
      `Qualitative review pending — run: npm run jd -- qualitative "${gate.dir || dirName}" (delivery blocks on it).`,
    );
  }

  if (result.verdict !== "PASS") {
    console.info("Follow the improvement plan in gate-report.md, revise cv.md, and re-score.");
    process.exitCode = 1;
    return;
  }

  // Gate passed → generate the approved-CV PDF (ephemeral local artifact).
  try {
    const pdfPath = path.join(dir, "cv.pdf");
    const { pages } = await renderCvPdf(fs.readFileSync(cvPath, "utf-8"), pdfPath);
    console.info(`Approved CV PDF: ${pdfPath} (${pages} page${pages === 1 ? "" : "s"})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `Warning: PDF generation failed (${message}). Re-run: npm run jd -- pdf "${gate.dir || dirName}"`,
    );
  }

  console.info(`Next: npm run jd -- deliver "${gate.dir || dirName}"`);
}

async function cmdPdf(dirName: string, args: GlobalArgs): Promise<void> {
  const dir = resolveApplicationDir(args, dirName);
  if (!fs.existsSync(path.join(dir, "gate.json"))) {
    throw new Error(`gate.json not found in ${dir}. Run \`gate\` first.`);
  }
  assertGatePassed(dir);

  const cvPath = path.join(dir, "cv.md");
  if (!fs.existsSync(cvPath)) {
    throw new Error(`cv.md not found in ${dir}.`);
  }

  const pdfPath = path.join(dir, "cv.pdf");
  const { pages } = await renderCvPdf(fs.readFileSync(cvPath, "utf-8"), pdfPath);
  console.info(`Approved CV PDF: ${pdfPath} (${pages} page${pages === 1 ? "" : "s"})`);
}

async function cmdDeliver(dirName: string, args: GlobalArgs): Promise<void> {
  const dir = resolveApplicationDir(args, dirName);
  const gateJsonPath = path.join(dir, "gate.json");
  if (!fs.existsSync(gateJsonPath)) {
    throw new Error(`gate.json not found in ${dir}. Run \`gate\` first.`);
  }
  const gate = readJson<GateJson>(gateJsonPath);
  assertGatePassed(dir);

  const cvPath = path.join(dir, "cv.md");
  const coverLetterPath = path.join(dir, "cover-letter.md");
  for (const filePath of [cvPath, coverLetterPath]) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`${path.basename(filePath)} not found in ${dir}.`);
    }
  }

  // Approved-CV PDF: reuse cv.pdf, or render it now if missing.
  const pdfPath = path.join(dir, "cv.pdf");
  if (!fs.existsSync(pdfPath)) {
    await renderCvPdf(fs.readFileSync(cvPath, "utf-8"), pdfPath);
  }

  const root = applicationsRoot(args);
  const fileBaseName = `${gate.dir || dirName}`;
  const cvDestination = path.join(root, DELIVERY_CV_DIR, `${fileBaseName}.md`);
  const cvPdfDestination = path.join(root, DELIVERY_CV_DIR, `${fileBaseName}.pdf`);
  const coverLetterDestination = path.join(root, DELIVERY_COVER_LETTER_DIR, `${fileBaseName}.md`);

  writeText(cvDestination, fs.readFileSync(cvPath, "utf-8"));
  fs.copyFileSync(pdfPath, cvPdfDestination);
  writeText(coverLetterDestination, fs.readFileSync(coverLetterPath, "utf-8"));

  console.info(`Delivered CV:           ${cvDestination}`);
  console.info(`Delivered CV PDF:       ${cvPdfDestination}`);
  console.info(`Delivered cover letter: ${coverLetterDestination}`);
}


function cmdHtml(dirName: string, args: GlobalArgs, fileArg?: string): void {
  const dir = resolveApplicationDir(args, dirName);
  const mdFileName = fileArg?.replace(/\.html?$/i, "").concat(".md") ?? "profile-questions.md";
  const mdPath = path.join(dir, mdFileName);
  if (!fs.existsSync(mdPath)) {
    throw new Error(
      `${mdFileName} not found in ${dir}. Pass the file name as the second argument: html <dir> <file.md>`,
    );
  }

  const markdown = fs.readFileSync(mdPath, "utf-8");
  const fallback = loadJdJsonSilently(dir);
  const title = firstHeadingTitle(markdown, `${fallback.role} — ${fallback.company}`);
  const htmlPath = mdPath.replace(/\.md$/i, ".html");
  writeText(htmlPath, renderQaPageHtml(markdown, title));
  console.info(`Static HTML page: ${htmlPath}`);
}

function loadJdJsonSilently(dir: string): { role: string; company: string } {
  const jdPath = path.join(dir, "jd.json");
  if (fs.existsSync(jdPath)) {
    const jd = readJson<JdJson>(jdPath);
    return { role: jd.role, company: jd.company };
  }
  return { role: path.basename(dir), company: "" };
}

const USAGE = `Usage: npm run jd -- <command> [args]

Commands:
  extract <url-or-file> [--role "…"] [--company "…"] [--force]
      Fetch a job posting (URL or .txt/.md/.html file), extract sections and
      keywords, and scaffold the application folder "<ROLE> - <COMPANY>".
  match <dir>    Rank profile CV variants against jd.json → match-report.md.
  gate <dir>     Build the ATS gate from curated jd.json → gate.json + gate.md.
  qualitative <dir>
                 Scaffold qualitative.json — the agent-graded rubric blended
                 into the overall nota (preserves scores already filled).
  score <dir>    Score cv.md × gate.json (+ qualitative.json) → gate-report.md
                 (exit 1 on FAIL). On PASS, renders the approved cv.md to
                 cv.pdf automatically.
  pdf <dir>      Re-render the approved CV PDF (gate must be PASS).
  html <dir> [file.md]
                 Render a markdown document (default: profile-questions.md)
                 to a styled static HTML page next to it.
  deliver <dir>  Copy cv.md + cv.pdf + cover-letter.md to applications/CV/ and
                 applications/COVER LETTER/ as "<ROLE> - <COMPANY>.*" (PASS only).

Global flags:
  --applications-dir <path>   Override the applications root (default: applications/).

All files under applications/ are ephemeral local artifacts — gitignored and
blocked from committing by the pre-commit hook.
`;

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const command = argv[0];

  if (!command || command === "--help" || command === "-h") {
    console.info(USAGE);
    return;
  }

  const { args, positional } = parseInvocation(argv.slice(1));

  switch (command) {
    case "extract": {
      const input = positional[0];
      if (!input) throw new Error("extract requires a URL or file path");
      await cmdExtract(input, args);
      return;
    }
    case "match":
    case "gate":
    case "qualitative":
    case "score":
    case "pdf":
    case "html":
    case "deliver": {
      const dirName = positional[0];
      if (!dirName) throw new Error(`${command} requires an application folder name`);
      if (command === "match") cmdMatch(dirName, args);
      else if (command === "gate") cmdGate(dirName, args);
      else if (command === "qualitative") cmdQualitative(dirName, args);
      else if (command === "score") await cmdScore(dirName, args);
      else if (command === "pdf") await cmdPdf(dirName, args);
      else if (command === "html") cmdHtml(dirName, args, positional[1]);
      else await cmdDeliver(dirName, args);
      return;
    }
    default:
      console.info(USAGE);
      throw new Error(`Unknown command: ${command}`);
  }
}

try {
  await main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(1);
}



