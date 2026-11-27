import { z } from "zod";

import { TIP_ID_MAX_LENGTH, TIPS_SEEN_LIMIT } from "./constants";

const SeenTipsSchema = z.array(z.string().min(1).max(TIP_ID_MAX_LENGTH)).max(TIPS_SEEN_LIMIT);

export function parseSeenTips(raw: string): string[] | null {
  try {
    const parsed = SeenTipsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function isSeenTips(raw: string): boolean {
  return parseSeenTips(raw) !== null;
}

export function withSeenTip(seen: readonly string[], tipId: string): string[] {
  return [...seen.filter((id) => id !== tipId), tipId].slice(-TIPS_SEEN_LIMIT);
}
