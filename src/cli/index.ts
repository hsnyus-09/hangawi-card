#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { Resvg } from "@resvg/resvg-js";
import { createHangawiCard, HangawiCardError, listHangawiTemplates, listHangawiThemes } from "../lib/index.js";
import type { HangawiCardOptions, TemplateId, ThemeName } from "../lib/index.js";

type OutputFormat = "svg" | "png";

interface CliOptions extends HangawiCardOptions {
  format: OutputFormat;
  output: string;
  fontFile?: string;
}

const HELP = `Hangawi Card CLI

Usage:
  hangawi-card --to <name> --from <name> --message <text> --output <file> [options]

Options:
  --to <name>           Recipient label. Required.
  --from <name>         Sender label. Required.
  --message <text>      Greeting message. Required.
  --theme <name>        ${Object.keys(listHangawiThemes()).join(" | ")}. Default: coral.
  --template <name>     ${listHangawiTemplates().join(" | ")}. Default: lunar.
  --format <format>     svg | png. Default: svg.
  --output <file>       Destination file path. Required.
  --font-file <path>    Optional Korean font file for PNG rendering.
  --help                Show this help.

Korean font note:
  SVG output keeps text live and uses system Korean font fallbacks.
  PNG output is rendered by @resvg/resvg-js. For best Korean glyph coverage,
  install Noto Sans CJK KR, Noto Serif CJK KR, Apple SD Gothic Neo, or Malgun Gothic.
  If the host has no Korean system font, pass --font-file /path/to/NotoSansCJKkr-Regular.otf.
`;

function fail(message: string, exitCode: number): never {
  console.error(message);
  process.exit(exitCode);
}

function readArgs(argv: string[]): CliOptions | "help" {
  const values = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg?.startsWith("--")) fail(`Unknown argument "${arg ?? ""}". Use --help for usage.`, 2);
    const key = arg.slice(2);
    if (key === "help") return "help";
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) fail(`Missing value for --${key}.`, 2);
    values.set(key, next);
    index += 1;
  }

  const format = values.get("format") ?? "svg";
  if (format !== "svg" && format !== "png") fail(`Invalid --format "${format}". Expected svg or png.`, 2);

  const output = values.get("output");
  if (!output) fail("Missing required --output <file>.", 2);

  const to = values.get("to");
  const from = values.get("from");
  const message = values.get("message");
  if (!to) fail("Missing required --to <name>.", 2);
  if (!from) fail("Missing required --from <name>.", 2);
  if (!message) fail("Missing required --message <text>.", 2);

  const parsed: CliOptions = {
    to,
    from,
    message,
    format,
    output,
    template: (values.get("template") ?? "lunar") as TemplateId,
    theme: (values.get("theme") ?? "coral") as ThemeName
  };
  const fontFile = values.get("font-file");
  if (fontFile) parsed.fontFile = fontFile;
  return parsed;
}

async function writeOutput(options: CliOptions): Promise<void> {
  const output = resolve(options.output);
  const card = createHangawiCard(options);
  await mkdir(dirname(output), { recursive: true });

  if (options.format === "svg") {
    await writeFile(output, card.svg, "utf8");
    return;
  }

  const renderer = new Resvg(card.svg, {
    fitTo: { mode: "width", value: 1200 },
    font: {
      fontFiles: options.fontFile ? [resolve(options.fontFile)] : [],
      loadSystemFonts: true,
      defaultFontFamily: "Noto Sans CJK KR"
    }
  });
  await writeFile(output, renderer.render().asPng());
}

async function main(): Promise<void> {
  const parsed = readArgs(process.argv.slice(2));
  if (parsed === "help") {
    console.log(HELP);
    return;
  }

  try {
    await writeOutput(parsed);
  } catch (error) {
    if (error instanceof HangawiCardError) fail(`${error.code}: ${error.message}`, 2);
    const message = error instanceof Error ? error.message : String(error);
    fail(`FILE_ERROR: ${message}`, 1);
  }
}

void main();
