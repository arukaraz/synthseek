import { z } from "zod";

import type { PlayerTrack } from "@components/Player";

import {
  CONVERSION_BITRATES_KBPS,
  CONVERSION_DEFAULT_BITRATE_KBPS,
  CONVERTED_BITRATE_KBPS,
  CONVERTED_FORMAT,
} from "./constants";
import type { ConversionSettings, StreamConversion } from "./types";

const storedConversion = z.object({
  enabled: z.boolean(),
  bitrateKbps: z.number().refine((value) => CONVERSION_BITRATES_KBPS.includes(value)),
});

export function defaultConversion(): ConversionSettings {
  return { enabled: false, bitrateKbps: CONVERSION_DEFAULT_BITRATE_KBPS };
}

function alreadyFits(played: Pick<PlayerTrack, "format" | "bitrateKbps">, settings: ConversionSettings): boolean {
  if (played.format.toLowerCase() !== CONVERTED_FORMAT) return false;
  return played.bitrateKbps > 0 && played.bitrateKbps <= settings.bitrateKbps;
}

export function streamConversionFor(
  played: Pick<PlayerTrack, "format" | "bitrateKbps">,
  unplayable: boolean,
  settings: ConversionSettings
): StreamConversion | null {
  if (unplayable) {
    return { format: CONVERTED_FORMAT, bitrateKbps: settings.enabled ? settings.bitrateKbps : CONVERTED_BITRATE_KBPS };
  }
  if (!settings.enabled || alreadyFits(played, settings)) return null;
  return { format: CONVERTED_FORMAT, bitrateKbps: settings.bitrateKbps };
}

export function restorableConversion(raw: string | null): ConversionSettings | null {
  if (raw === null) return null;
  try {
    const parsed = storedConversion.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
