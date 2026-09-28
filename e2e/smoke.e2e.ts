import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { createHangawiCard } from "../src/lib/index.js";

test("studio has no horizontal overflow and updates preview", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#card-preview svg")).toBeVisible();
  await page.locator("#recipient-input").fill("테스트 받는분");
  await page.locator("#sender-input").fill("테스트 보내는분");
  await page.locator("#message-input").fill("햇곡식처럼 든든한 명절 보내세요");
  await expect(page.locator("#card-preview")).toContainText("테스트 받는분");
  await expect(page.locator("#card-preview")).toContainText("햇곡식처럼");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});

test("theme swatches expose accessible selected state", async ({ page }) => {
  await page.goto("/");
  const pine = page.getByRole("button", { name: "Pine moon theme" });
  await pine.click();
  await expect(pine).toHaveAttribute("aria-pressed", "true");
});

test("downloads SVG and PNG from the current card", async ({ page }) => {
  await page.goto("/");
  await page.locator("#recipient-input").fill("다운로드");
  const svgDownload = page.waitForEvent("download");
  await page.locator("#download-svg").click();
  const svg = await svgDownload;
  expect(svg.suggestedFilename()).toMatch(/\.svg$/);

  const pngDownload = page.waitForEvent("download");
  await page.locator("#download-png").click();
  const png = await pngDownload;
  expect(png.suggestedFilename()).toMatch(/\.png$/);
});

test("max allowed Korean SVG labels stay inside the viewBox", async ({ page }) => {
  const maxName = "가나다라마바사아자차카타파하가나다라마바사아자차카타파하";
  const maxTitle = "풍요로운한가위마음을가득담은달빛소원카드";
  const card = createHangawiCard({
    to: maxName,
    from: maxName,
    title: maxTitle,
    message: "풍성한 보름달처럼 따뜻한 명절 보내세요."
  });

  await page.setContent(card.svg);
  const boxes = await page.locator(".title, .recipient, .sender").evaluateAll((nodes) =>
    nodes.map((node) => {
      const box = (node as SVGGraphicsElement).getBBox();
      return { x: box.x, width: box.width };
    })
  );

  for (const box of boxes) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1200);
  }
});

test("studio has no serious axe violations", async ({ page }) => {
  await page.goto("/");
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = result.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
  expect(serious).toEqual([]);
});
