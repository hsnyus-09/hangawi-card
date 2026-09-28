import { HangawiCardError } from "./errors.js";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
function isInvalidXmlCodePoint(codePoint: number): boolean {
  return (
    (codePoint >= 0x00 && codePoint <= 0x08) ||
    codePoint === 0x0b ||
    codePoint === 0x0c ||
    (codePoint >= 0x0e && codePoint <= 0x1f) ||
    codePoint === 0xfffe ||
    codePoint === 0xffff
  );
}

function scrubXmlText(value: string): string {
  let output = "";
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        output += value[index] ?? "";
        output += value[index + 1] ?? "";
        index += 1;
      } else {
        output += "\uFFFD";
      }
      continue;
    }
    if (code >= 0xdc00 && code <= 0xdfff) {
      output += "\uFFFD";
      continue;
    }
    if (!isInvalidXmlCodePoint(code)) output += value[index] ?? "";
  }
  return output;
}

export function escapeXml(value: string): string {
  return scrubXmlText(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function assertHexColor(value: string, label: string): string {
  if (!HEX_COLOR.test(value)) {
    throw new HangawiCardError("INVALID_COLOR", `${label} must be a six-digit hex color such as #f26d5b.`);
  }
  return value.toLowerCase();
}

export function normalizeText(value: string, label: string, maxChars: number): string {
  const normalized = value.normalize("NFC").replace(/\r\n?/g, "\n").trim();
  if (normalized.length === 0) {
    throw new HangawiCardError("TEXT_REQUIRED", `${label} is required.`);
  }
  if ([...normalized].length > maxChars) {
    throw new HangawiCardError("TEXT_TOO_LONG", `${label} is too long. Use ${maxChars} characters or fewer.`);
  }
  return normalized;
}

export function downloadFileName(value: string): string {
  return (
    value
      .normalize("NFKD")
      .replace(/[^\p{Letter}\p{Number}._-]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "hangawi-card"
  );
}
