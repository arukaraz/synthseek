import { z } from "zod";

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

export function streamConversionFor(unplayable: boolean, settings: ConversionSettings): StreamConversion | null {
  if (settings.enabled) return { format: CONVERTED_FORMAT, bitrateKbps: settings.bitrateKbps };
  if (unplayable) return { format: CONVERTED_FORMAT, bitrateKbps: CONVERTED_BITRATE_KBPS };
  return null;
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
