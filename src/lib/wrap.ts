import { HangawiCardError } from "./errors.js";
import type { WrappedLine } from "./types.js";

const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(["ko", "en"], { granularity: "word" })
    : undefined;

function tokenWidth(token: string): number {
  let width = 0;
  for (const char of token) {
    if (/\s/u.test(char)) width += 0.34;
    else if (/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/u.test(char)) width += 1.04;
    else if (/[\u3000-\u9fff\uff00-\uffef]/u.test(char)) width += 1;
    else if (/[.,:;'"!?()[\]{}]/u.test(char)) width += 0.3;
    else width += 0.58;
  }
  return width;
}

function words(input: string): string[] {
  if (!segmenter) return input.split(/(\s+)/u).filter(Boolean);
  return Array.from(segmenter.segment(input), (part) => part.segment).filter(Boolean);
}

function pushLine(lines: WrappedLine[], text: string): void {
  lines.push({ text: text.trimEnd(), units: Number(tokenWidth(text).toFixed(2)) });
}

export function wrapText(input: string, maxUnits: number, maxLines: number, label = "Text"): WrappedLine[] {
  const lines: WrappedLine[] = [];

  for (const paragraph of input.split("\n")) {
    if (paragraph.trim() === "") {
      pushLine(lines, "");
      continue;
    }

    let current = "";
    for (const word of words(paragraph)) {
      const candidate = `${current}${word}`;
      if (tokenWidth(candidate) <= maxUnits) {
        current = candidate;
        continue;
      }

      if (current.trim().length > 0) {
        pushLine(lines, current);
        current = "";
      }

      if (tokenWidth(word) <= maxUnits) {
        current = word.trimStart();
        continue;
      }

      let chunk = "";
      for (const char of Array.from(word)) {
        const candidateChunk = `${chunk}${char}`;
        if (tokenWidth(candidateChunk) <= maxUnits) {
          chunk = candidateChunk;
        } else {
          pushLine(lines, chunk);
          chunk = char;
        }
      }
      current = chunk;
    }

    if (current.trim().length > 0) pushLine(lines, current);
  }

  if (lines.length > maxLines) {
    throw new HangawiCardError(
      "TEXT_TOO_MANY_LINES",
      `${label} wraps to ${lines.length} lines; the card allows ${maxLines}. Shorten the text or choose fewer line breaks.`
    );
  }

  return lines;
}
