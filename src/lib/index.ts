import { HangawiCardError } from "./errors.js";
import { renderTemplate, TEMPLATES } from "./templates.js";
import { resolveTheme, THEMES } from "./themes.js";
import type { CardTheme, HangawiCardOptions, RenderedHangawiCard, TemplateId, ThemeName } from "./types.js";
import { escapeXml, normalizeText } from "./utils.js";
import { wrapText } from "./wrap.js";

export { HangawiCardError } from "./errors.js";
export { TEMPLATES } from "./templates.js";
export { THEMES, resolveTheme } from "./themes.js";
export { downloadFileName, escapeXml } from "./utils.js";
export { wrapText } from "./wrap.js";
export type { CardTheme, HangawiCardOptions, RenderedHangawiCard, TemplateId, ThemeName, WrappedLine } from "./types.js";

const WIDTH = 1200;
const HEIGHT = 1700;

function resolveTemplate(template: TemplateId | undefined): TemplateId {
  const value = template ?? "lunar";
  if (!TEMPLATES.includes(value)) {
    throw new HangawiCardError("INVALID_TEMPLATE", `Unknown template "${value}".`);
  }
  return value;
}

function svgShell(inner: string, title: string, theme: CardTheme): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="card-title card-desc">
  <title id="card-title">${escapeXml(title)}</title>
  <desc id="card-desc">A printable Hangawi greeting card generated with safe escaped text.</desc>
  <style>
    .title{font-family:"Apple SD Gothic Neo","Noto Serif CJK KR","Nanum Myeongjo",serif;font-weight:800;letter-spacing:0}
    .label{font-family:"Apple SD Gothic Neo","Noto Sans CJK KR",sans-serif;font-size:30px;font-weight:700;letter-spacing:0}
    .recipient{font-family:"Apple SD Gothic Neo","Noto Serif CJK KR","Nanum Myeongjo",serif;font-weight:800;letter-spacing:0}
    .message{font-family:"Apple SD Gothic Neo","Noto Sans CJK KR","Malgun Gothic",sans-serif;font-weight:650;letter-spacing:0}
    .sender{font-family:"Apple SD Gothic Neo","Noto Sans CJK KR","Malgun Gothic",sans-serif;font-weight:700;letter-spacing:0}
    @media (prefers-color-scheme: dark){:root{color:${theme.ink}}}
  </style>
  ${inner}
</svg>`;
}

export function createHangawiCard(options: HangawiCardOptions): RenderedHangawiCard {
  const to = normalizeText(options.to, "Recipient", 28);
  const from = normalizeText(options.from, "Sender", 28);
  const message = normalizeText(options.message, "Message", 180);
  const template = resolveTemplate(options.template);
  const theme = resolveTheme(options.theme);
  const title = normalizeText(options.title ?? "풍요로운 한가위", "Title", 20);
  const messageLines = wrapText(message, 18, 5, "Message");
  const svg = svgShell(renderTemplate(template, { theme, messageLines, to, from, title }), title, theme);

  return { svg, width: WIDTH, height: HEIGHT, title, template, theme };
}

export function listHangawiThemes(): Record<ThemeName, CardTheme> {
  return THEMES;
}

export function listHangawiTemplates(): TemplateId[] {
  return [...TEMPLATES];
}
