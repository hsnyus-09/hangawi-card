import { HangawiCardError } from "./errors.js";
import type { CardTheme, ThemeName } from "./types.js";
import { assertHexColor } from "./utils.js";

export const THEMES: Record<ThemeName, CardTheme> = {
  coral: {
    name: "Coral cream",
    background: "#fff4ea",
    surface: "#fffaf3",
    primary: "#e85d4f",
    secondary: "#f6b08f",
    accent: "#ffd166",
    ink: "#2f2926",
    muted: "#76645d"
  },
  persimmon: {
    name: "Persimmon dusk",
    background: "#fff1df",
    surface: "#fff9ef",
    primary: "#d95335",
    secondary: "#f0934f",
    accent: "#6c8a55",
    ink: "#2b2a24",
    muted: "#735f4b"
  },
  pine: {
    name: "Pine moon",
    background: "#f5f0de",
    surface: "#fffcf0",
    primary: "#2f6b52",
    secondary: "#93b48b",
    accent: "#df6d54",
    ink: "#26302a",
    muted: "#667060"
  },
  ink: {
    name: "Ink seal",
    background: "#f7efe3",
    surface: "#fffbf4",
    primary: "#343434",
    secondary: "#d8c3a5",
    accent: "#d84f45",
    ink: "#202020",
    muted: "#6f665e"
  }
};

export function resolveTheme(theme: ThemeName | Partial<CardTheme> | undefined): CardTheme {
  if (!theme) return THEMES.coral;
  if (typeof theme === "string") {
    const found = THEMES[theme];
    if (!found) throw new HangawiCardError("INVALID_THEME", `Unknown theme "${theme}".`);
    return found;
  }

  const merged: CardTheme = { ...THEMES.coral, ...theme, name: theme.name ?? "Custom" };
  return {
    name: merged.name,
    background: assertHexColor(merged.background, "theme.background"),
    surface: assertHexColor(merged.surface, "theme.surface"),
    primary: assertHexColor(merged.primary, "theme.primary"),
    secondary: assertHexColor(merged.secondary, "theme.secondary"),
    accent: assertHexColor(merged.accent, "theme.accent"),
    ink: assertHexColor(merged.ink, "theme.ink"),
    muted: assertHexColor(merged.muted, "theme.muted")
  };
}
