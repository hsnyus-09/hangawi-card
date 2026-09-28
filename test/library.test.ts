import { describe, expect, it } from "vitest";
import { createHangawiCard, HangawiCardError, resolveTheme, wrapText } from "../src/lib/index.js";

describe("createHangawiCard", () => {
  it("escapes user text and renders Korean unicode SVG", () => {
    const card = createHangawiCard({
      to: "달 <친구>",
      from: "나 & 우리",
      message: "풍요로운 한가위 & 건강하세요",
      template: "paper",
      theme: "coral"
    });

    expect(card.svg).toContain("달 &lt;친구&gt;");
    expect(card.svg).toContain("나 &amp; 우리");
    expect(card.svg).toContain("풍요로운 한가위 &amp; 건강하세요");
    expect(card.svg).toContain('viewBox="0 0 1200 1700"');
  });

  it("scrubs invalid XML controls and lone surrogates", () => {
    const card = createHangawiCard({
      to: "받는\u0001분",
      from: "보내는\ud800분",
      message: "안전한 문자"
    });
    expect(card.svg).not.toContain("\u0001");
    expect(card.svg).toContain("보내는�분");
  });

  it("wraps Korean and Latin text inside requested line limits", () => {
    const lines = wrapText("가족과 friends 모두에게 따뜻한 보름달 마음을 전해요", 8, 8);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.every((line) => line.units <= 8)).toBe(true);
  });

  it("rejects text that wraps past line bounds", () => {
    expect(() =>
      createHangawiCard({
        to: "받는 분",
        from: "보내는 분",
        message: "긴문장".repeat(40)
      })
    ).toThrow(HangawiCardError);
  });

  it("validates custom theme colors", () => {
    expect(() => resolveTheme({ primary: "coral" })).toThrow(/six-digit hex color/);
  });

  it("keeps max Korean title, recipient, and sender as wrapped SVG text", () => {
    const maxRecipient = "가나다라마바사아자차카타파하가나다라마바사아자차카타파하";
    const maxTitle = "풍요로운한가위마음을가득담은달빛소원카드";
    const card = createHangawiCard({
      to: maxRecipient,
      from: maxRecipient,
      title: maxTitle,
      message: "풍성한 보름달처럼 따뜻한 명절 보내세요."
    });

    const textContent = card.svg.replace(/<[^>]+>/g, "");
    expect(textContent).toContain(maxRecipient);
    expect(card.svg).toContain(maxTitle);
    expect(card.svg.match(/class="recipient"/g)).toHaveLength(1);
    expect(card.svg.match(/<tspan/g)?.length).toBeGreaterThanOrEqual(6);
    expect(card.svg).not.toContain("scale(");
  });
});
