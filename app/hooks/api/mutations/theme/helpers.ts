import { z } from "zod";

import { extractAppCode } from "@modules/errors";

import { FONT_ERROR_FALLBACK_KEY, FONT_ERROR_KEYS, THEME_CHANGED_ELSEWHERE } from "./constants";

const FontErrorCodeSchema = z.enum(["THEME_FONT_UNSUPPORTED", "THEME_FONT_TOO_LARGE"]);

const FontFailureSchema = z.object({ error: z.string() });

interface AnsweredCache<TAnswer> {
  cancel: () => Promise<void>;
  setData: (input: undefined, answer: TAnswer) => unknown;
}

export async function keepAnswer<TAnswer>(cache: AnsweredCache<TAnswer>, answer: TAnswer): Promise<void> {
  await cache.cancel();
  cache.setData(undefined, answer);
}

export function isThemeChangedElsewhere(error: unknown): boolean {
  return extractAppCode(error) === THEME_CHANGED_ELSEWHERE;
}

export function fontErrorKey(code: string | null) {
  const known = FontErrorCodeSchema.safeParse(code);
  return known.success ? FONT_ERROR_KEYS[known.data] : FONT_ERROR_FALLBACK_KEY;
}

export async function fontUploadFailure(response: Response): Promise<string | null> {
  if (response.status === 413) return FontErrorCodeSchema.enum.THEME_FONT_TOO_LARGE;
  try {
    const parsed = FontFailureSchema.safeParse(await response.json());
    return parsed.success ? parsed.data.error : null;
  } catch {
    return null;
  }
}
