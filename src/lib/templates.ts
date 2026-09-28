import type { CardTheme, TemplateId, WrappedLine } from "./types.js";
import { escapeXml } from "./utils.js";
import { wrapText } from "./wrap.js";

export const TEMPLATES: TemplateId[] = ["lunar", "paper", "botanical", "modern"];

interface TemplateContext {
  theme: CardTheme;
  messageLines: WrappedLine[];
  to: string;
  from: string;
  title: string;
}

interface TextLayout {
  lines: WrappedLine[];
  fontSize: number;
  gap: number;
}

function fitText(value: string, maxPixels: number, baseSize: number, minSize: number, maxLines: number, label: string): TextLayout {
  const oneLineUnits = wrapText(value, 1000, 1, label)[0]?.units ?? 0;
  if (oneLineUnits * baseSize <= maxPixels) {
    return { lines: [{ text: value, units: oneLineUnits }], fontSize: baseSize, gap: Math.round(baseSize * 1.18) };
  }

  let best: TextLayout | undefined;
  for (let size = baseSize; size >= minSize; size -= 1) {
    try {
      const lines = wrapText(value, maxPixels / size, maxLines, label);
      const longest = Math.max(...lines.map((line) => line.units));
      if (longest * size <= maxPixels) {
        best = { lines, fontSize: size, gap: Math.round(size * 1.18) };
        break;
      }
    } catch (error) {
      if (!(error instanceof Error)) throw error;
    }
  }

  if (best) return best;
  const fallback = wrapText(value, maxPixels / minSize, maxLines, label);
  return { lines: fallback, fontSize: minSize, gap: Math.round(minSize * 1.18) };
}

function textLines(className: string, lines: WrappedLine[], x: number, y: number, size: number, gap: number, fill: string): string {
  const [first, ...rest] = lines;
  const tspans = [
    `<tspan x="${x}" dy="0">${escapeXml(first?.text ?? "")}</tspan>`,
    ...rest.map((line) => `<tspan x="${x}" dy="${gap}">${escapeXml(line.text)}</tspan>`)
  ].join("");
  return `<text x="${x}" y="${y}" text-anchor="middle" class="${className}" font-size="${size}" fill="${fill}">${tspans}</text>`;
}

function textBlock(lines: WrappedLine[], x: number, y: number, size: number, gap: number, fill: string): string {
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * gap}" text-anchor="middle" class="message" font-size="${size}" fill="${fill}">${escapeXml(line.text)}</text>`
    )
    .join("");
}

function commonText(ctx: TemplateContext): string {
  const title = fitText(ctx.title, 880, 76, 46, 2, "Title");
  const recipient = fitText(`${ctx.to}에게`, 900, 58, 34, 2, "Recipient");
  const sender = fitText(`${ctx.from} 드림`, 820, 38, 28, 2, "Sender");
  const titleY = title.lines.length === 1 ? 368 : 342;
  const recipientY = recipient.lines.length === 1 ? 480 : 462;
  const messageY = 640 + (title.lines.length - 1) * 28 + (recipient.lines.length - 1) * 34;

  return `
    <text x="600" y="282" text-anchor="middle" class="label" fill="${ctx.theme.muted}">한가위 마음 카드</text>
    ${textLines("title", title.lines, 600, titleY, title.fontSize, title.gap, ctx.theme.ink)}
    ${textLines("recipient", recipient.lines, 600, recipientY, recipient.fontSize, recipient.gap, ctx.theme.primary)}
    ${textBlock(ctx.messageLines, 600, messageY, 48, 76, ctx.theme.ink)}
    ${textLines("sender", sender.lines, 600, sender.lines.length === 1 ? 1376 : 1354, sender.fontSize, sender.gap, ctx.theme.muted)}
  `;
}

function grain(theme: CardTheme): string {
  return Array.from({ length: 56 }, (_, index) => {
    const x = 120 + ((index * 157) % 960);
    const y = 180 + ((index * 211) % 1320);
    const r = 1 + (index % 3);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${index % 2 ? theme.secondary : theme.accent}" opacity="0.16"/>`;
  }).join("");
}

export function renderTemplate(template: TemplateId, ctx: TemplateContext): string {
  switch (template) {
    case "lunar":
      return `
        <rect width="1200" height="1700" rx="52" fill="${ctx.theme.background}"/>
        <g aria-hidden="true">${grain(ctx.theme)}</g>
        <circle cx="600" cy="866" r="464" fill="${ctx.theme.surface}" stroke="${ctx.theme.secondary}" stroke-width="4"/>
        <circle cx="600" cy="866" r="338" fill="${ctx.theme.accent}" opacity="0.22"/>
        <path d="M275 1127c146 92 503 104 650 0" fill="none" stroke="${ctx.theme.primary}" stroke-width="10" stroke-linecap="round"/>
        <path d="M353 1185c105 56 390 64 494 0" fill="none" stroke="${ctx.theme.secondary}" stroke-width="8" stroke-linecap="round"/>
        <g fill="${ctx.theme.primary}" opacity="0.95">
          <circle cx="258" cy="402" r="12"/><circle cx="934" cy="474" r="9"/><circle cx="1016" cy="1084" r="13"/><circle cx="197" cy="1087" r="8"/>
        </g>
        ${commonText(ctx)}
      `;
    case "paper":
      return `
        <rect width="1200" height="1700" rx="52" fill="${ctx.theme.background}"/>
        <path d="M176 178h848c36 0 64 30 59 66L941 1302c-5 34-34 60-69 60H328c-35 0-64-26-69-60L117 244c-5-36 23-66 59-66Z" fill="${ctx.theme.surface}" stroke="${ctx.theme.secondary}" stroke-width="5"/>
        <path d="M236 307h728M267 1203h666" stroke="${ctx.theme.secondary}" stroke-width="3" opacity="0.55"/>
        <path d="M175 243c157 43 320 43 489 0s300-43 389 0" fill="none" stroke="${ctx.theme.primary}" stroke-width="8" stroke-linecap="round"/>
        <g transform="translate(520 1225)">
          <path d="M79 27c59 37 75 94 36 126s-113 26-165-18c-46-38-46-90-5-117 35-23 88-20 134 9Z" fill="${ctx.theme.accent}" opacity="0.78"/>
          <path d="M-21 50c32 22 66 41 104 56" fill="none" stroke="${ctx.theme.primary}" stroke-width="6" stroke-linecap="round"/>
        </g>
        <g aria-hidden="true">${grain(ctx.theme)}</g>
        ${commonText(ctx)}
      `;
    case "botanical":
      return `
        <rect width="1200" height="1700" rx="52" fill="${ctx.theme.surface}"/>
        <rect x="86" y="86" width="1028" height="1528" rx="38" fill="none" stroke="${ctx.theme.primary}" stroke-width="5"/>
        <path d="M146 1310c157-36 224-119 263-260 42-153 108-251 238-327" fill="none" stroke="${ctx.theme.secondary}" stroke-width="12" stroke-linecap="round"/>
        <path d="M1050 403c-157 36-224 119-263 260-42 153-108 251-238 327" fill="none" stroke="${ctx.theme.primary}" stroke-width="12" stroke-linecap="round"/>
        <g fill="${ctx.theme.accent}" opacity="0.68">
          <ellipse cx="330" cy="1091" rx="56" ry="24" transform="rotate(-32 330 1091)"/>
          <ellipse cx="403" cy="928" rx="63" ry="26" transform="rotate(-48 403 928)"/>
          <ellipse cx="817" cy="607" rx="56" ry="24" transform="rotate(148 817 607)"/>
          <ellipse cx="747" cy="773" rx="63" ry="26" transform="rotate(132 747 773)"/>
        </g>
        <circle cx="600" cy="870" r="352" fill="${ctx.theme.background}" opacity="0.84"/>
        ${commonText(ctx)}
      `;
    case "modern":
      return `
        <rect width="1200" height="1700" rx="52" fill="${ctx.theme.background}"/>
        <path d="M0 0h1200v498C890 386 657 451 438 355 260 277 112 223 0 266V0Z" fill="${ctx.theme.primary}" opacity="0.96"/>
        <path d="M1200 1700H0v-444c306 105 538 42 753 140 180 82 327 127 447 82v222Z" fill="${ctx.theme.ink}" opacity="0.95"/>
        <circle cx="965" cy="314" r="112" fill="${ctx.theme.accent}"/>
        <circle cx="965" cy="314" r="76" fill="${ctx.theme.background}" opacity="0.32"/>
        <rect x="170" y="424" width="860" height="860" rx="26" fill="${ctx.theme.surface}" stroke="${ctx.theme.secondary}" stroke-width="4"/>
        <path d="M245 522h710M245 1224h710" stroke="${ctx.theme.secondary}" stroke-width="4" opacity="0.5"/>
        ${commonText(ctx)}
      `;
  }
}
