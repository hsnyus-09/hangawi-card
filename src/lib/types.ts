export type TemplateId = "lunar" | "paper" | "botanical" | "modern";

export type ThemeName = "coral" | "persimmon" | "pine" | "ink";

export interface CardTheme {
  name: string;
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  ink: string;
  muted: string;
}

export interface HangawiCardOptions {
  to: string;
  from: string;
  message: string;
  template?: TemplateId;
  theme?: ThemeName | Partial<CardTheme>;
  title?: string;
}

export interface RenderedHangawiCard {
  svg: string;
  width: number;
  height: number;
  title: string;
  template: TemplateId;
  theme: CardTheme;
}

export interface WrappedLine {
  text: string;
  units: number;
}

export type HangawiCardErrorCode =
  | "INVALID_COLOR"
  | "INVALID_FORMAT"
  | "INVALID_TEMPLATE"
  | "INVALID_THEME"
  | "TEXT_REQUIRED"
  | "TEXT_TOO_LONG"
  | "TEXT_TOO_MANY_LINES";
