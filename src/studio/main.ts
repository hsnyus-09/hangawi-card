import "../studio/styles.css";
import {
  createHangawiCard,
  downloadFileName,
  HangawiCardError,
  listHangawiTemplates,
  listHangawiThemes
} from "../lib/index.js";
import type { TemplateId, ThemeName } from "../lib/index.js";

const templates = listHangawiTemplates();
const themes = listHangawiThemes();

interface StudioState {
  to: string;
  from: string;
  message: string;
  theme: ThemeName;
  template: TemplateId;
}

const state: StudioState = {
  to: "소중한 사람",
  from: "우리 가족",
  message: "밝은 보름달처럼 넉넉하고 따뜻한 한가위 보내세요.",
  theme: "coral",
  template: "lunar"
};

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("App root is missing.");

app.innerHTML = `
  <header class="site-header">
    <div>
      <p class="eyebrow">Hangawi Card</p>
      <h1>한가위 카드 인쇄실</h1>
      <p class="lede">이름과 마음을 적으면 안전한 SVG 카드가 즉시 완성됩니다.</p>
    </div>
    <a class="skip-link" href="#recipient-input">편집으로 이동</a>
  </header>
  <main class="studio-shell">
    <section class="preview-pane" aria-label="카드 미리보기">
      <div id="card-preview" class="card-preview" aria-live="polite"></div>
      <div class="actions">
        <button id="download-svg" type="button">SVG 다운로드</button>
        <button id="download-png" type="button">PNG 다운로드</button>
      </div>
      <p id="status" class="status" role="status"></p>
    </section>
    <section class="editor-pane" aria-label="카드 편집">
      <label for="recipient-input">받는 분</label>
      <input id="recipient-input" maxlength="28" autocomplete="name" />
      <label for="sender-input">보내는 분</label>
      <input id="sender-input" maxlength="28" autocomplete="name" />
      <label for="message-input">인사말</label>
      <textarea id="message-input" maxlength="180" rows="5"></textarea>
      <fieldset>
        <legend>그림 양식</legend>
        <div class="segmented" id="template-controls"></div>
      </fieldset>
      <fieldset>
        <legend>색상 팔레트</legend>
        <div class="swatches" id="theme-controls"></div>
      </fieldset>
      <details>
        <summary>CLI/API</summary>
        <pre><code id="usage-snippet"></code></pre>
      </details>
      <p class="fine-print">PNG 렌더링은 브라우저 캔버스의 시스템 한글 글꼴 지원에 따라 모양이 달라질 수 있습니다.</p>
    </section>
  </main>
  <footer>
    <span>MIT 2026 Chuseok project contributors</span>
    <span>정적 사이트와 패키지 라이브러리는 분리되어 빌드됩니다.</span>
  </footer>
`;

const recipient = document.querySelector<HTMLInputElement>("#recipient-input");
const sender = document.querySelector<HTMLInputElement>("#sender-input");
const message = document.querySelector<HTMLTextAreaElement>("#message-input");
const preview = document.querySelector<HTMLDivElement>("#card-preview");
const status = document.querySelector<HTMLParagraphElement>("#status");
const templateControls = document.querySelector<HTMLDivElement>("#template-controls");
const themeControls = document.querySelector<HTMLDivElement>("#theme-controls");
const usageSnippet = document.querySelector<HTMLElement>("#usage-snippet");
const svgButton = document.querySelector<HTMLButtonElement>("#download-svg");
const pngButton = document.querySelector<HTMLButtonElement>("#download-png");

if (!recipient || !sender || !message || !preview || !status || !templateControls || !themeControls || !usageSnippet || !svgButton || !pngButton) {
  throw new Error("Studio controls are missing.");
}

const recipientInput = recipient;
const senderInput = sender;
const messageInput = message;
const previewPane = preview;
const statusLine = status;
const templateButtons = templateControls;
const themeButtons = themeControls;
const usageCode = usageSnippet;
const downloadSvgButton = svgButton;
const downloadPngButton = pngButton;

function setStatus(text: string, tone: "ok" | "error" = "ok"): void {
  statusLine.textContent = text;
  statusLine.dataset.tone = tone;
}

function renderControls(): void {
  templateButtons.innerHTML = templates
    .map(
      (template) =>
        `<button type="button" class="template-choice" data-template="${template}" aria-pressed="${state.template === template}">${template}</button>`
    )
    .join("");

  themeButtons.innerHTML = Object.entries(themes)
    .map(([name, theme]) => {
      const selected = state.theme === name;
      return `<button type="button" class="swatch" data-theme="${name}" aria-label="${theme.name} theme" aria-pressed="${selected}" title="${theme.name}">
        <span style="--swatch:${theme.primary}"></span><span style="--swatch:${theme.secondary}"></span><span style="--swatch:${theme.accent}"></span>
      </button>`;
    })
    .join("");
}

function currentCard() {
  return createHangawiCard({
    to: state.to,
    from: state.from,
    message: state.message,
    theme: state.theme,
    template: state.template
  });
}

function renderPreview(): void {
  try {
    const card = currentCard();
    previewPane.innerHTML = card.svg;
    usageCode.textContent = `hangawi-card --to "${state.to}" --from "${state.from}" --message "${state.message}" --theme ${state.theme} --template ${state.template} --format svg --output card.svg`;
    downloadSvgButton.disabled = false;
    downloadPngButton.disabled = false;
    setStatus("미리보기가 준비되었습니다.");
  } catch (error) {
    previewPane.innerHTML = `<div class="preview-error">카드를 만들 수 없습니다.</div>`;
    downloadSvgButton.disabled = true;
    downloadPngButton.disabled = true;
    const text = error instanceof HangawiCardError || error instanceof Error ? error.message : String(error);
    setStatus(text, "error");
  }
}

function syncInputs(): void {
  recipientInput.value = state.to;
  senderInput.value = state.from;
  messageInput.value = state.message;
}

function updateFromInputs(): void {
  state.to = recipientInput.value;
  state.from = senderInput.value;
  state.message = messageInput.value;
  renderPreview();
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function downloadSvg(): Promise<void> {
  const card = currentCard();
  downloadBlob(new Blob([card.svg], { type: "image/svg+xml;charset=utf-8" }), `${downloadFileName(state.to)}.svg`);
  setStatus("SVG 파일을 만들었습니다.");
}

async function downloadPng(): Promise<void> {
  const card = currentCard();
  const image = new Image();
  const svgUrl = URL.createObjectURL(new Blob([card.svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    await new Promise<void>((resolveImage, rejectImage) => {
      image.onload = () => resolveImage();
      image.onerror = () => rejectImage(new Error("브라우저가 SVG 미리보기를 PNG로 변환하지 못했습니다."));
      image.src = svgUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = card.width;
    canvas.height = card.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context is unavailable.");
    context.drawImage(image, 0, 0);
    const blob = await new Promise<Blob>((resolveBlob, rejectBlob) => {
      canvas.toBlob((value) => {
        if (value) resolveBlob(value);
        else rejectBlob(new Error("PNG export failed."));
      }, "image/png");
    });
    downloadBlob(blob, `${downloadFileName(state.to)}.png`);
    setStatus("PNG 파일을 만들었습니다.");
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

recipientInput.addEventListener("input", updateFromInputs);
senderInput.addEventListener("input", updateFromInputs);
messageInput.addEventListener("input", updateFromInputs);
downloadSvgButton.addEventListener("click", () => void downloadSvg().catch((error: unknown) => setStatus(error instanceof Error ? error.message : String(error), "error")));
downloadPngButton.addEventListener("click", () => void downloadPng().catch((error: unknown) => setStatus(error instanceof Error ? error.message : String(error), "error")));

templateButtons.addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-template]");
  if (!button) return;
  state.template = button.dataset.template as TemplateId;
  renderControls();
  renderPreview();
});

themeButtons.addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-theme]");
  if (!button) return;
  state.theme = button.dataset.theme as ThemeName;
  renderControls();
  renderPreview();
});

syncInputs();
renderControls();
renderPreview();
