import type { HangawiCardErrorCode } from "./types.js";

export class HangawiCardError extends Error {
  readonly code: HangawiCardErrorCode;

  constructor(code: HangawiCardErrorCode, message: string) {
    super(message);
    this.name = "HangawiCardError";
    this.code = code;
  }
}
