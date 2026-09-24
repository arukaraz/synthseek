import type { CompressorPresetId } from "@components/Player";
import { z } from "zod";

import { COMPRESSOR_DEFAULT_PRESET, COMPRESSOR_LIMITS, COMPRESSOR_PARAMS, COMPRESSOR_PRESETS } from "./constants";
import type { CompressorParam, CompressorParams, CompressorSettings } from "./types";

const storedCompressor = z.object({
  enabled: z.boolean(),
  thresholdDb: z.number().min(COMPRESSOR_LIMITS.thresholdDb.min).max(COMPRESSOR_LIMITS.thresholdDb.max),
  ratio: z.number().min(COMPRESSOR_LIMITS.ratio.min).max(COMPRESSOR_LIMITS.ratio.max),
  attackMs: z.number().min(COMPRESSOR_LIMITS.attackMs.min).max(COMPRESSOR_LIMITS.attackMs.max),
  releaseMs: z.number().min(COMPRESSOR_LIMITS.releaseMs.min).max(COMPRESSOR_LIMITS.releaseMs.max),
  kneeDb: z.number().min(COMPRESSOR_LIMITS.kneeDb.min).max(COMPRESSOR_LIMITS.kneeDb.max),
});

export function defaultCompressor(): CompressorSettings {
  return { enabled: false, ...COMPRESSOR_PRESETS[COMPRESSOR_DEFAULT_PRESET] };
}

export function steppedCompressorValue(param: CompressorParam, value: number): number {
  const limits = COMPRESSOR_LIMITS[param];
  if (!Number.isFinite(value)) return limits.min;
  const stepped = Math.round(value / limits.step) * limits.step;
  return Math.min(limits.max, Math.max(limits.min, Number(stepped.toFixed(3))));
}

export function isCompressorPresetId(value: string): value is CompressorPresetId {
  return Object.hasOwn(COMPRESSOR_PRESETS, value);
}

export function compressorPresetIds(): CompressorPresetId[] {
  return Object.keys(COMPRESSOR_PRESETS).filter(isCompressorPresetId);
}

export function compressorPresetMatching(params: CompressorParams): CompressorPresetId | null {
  return (
    compressorPresetIds().find((id) => {
      const preset = COMPRESSOR_PRESETS[id];
      return COMPRESSOR_PARAMS.every((param) => preset[param] === params[param]);
    }) ?? null
  );
}

export function restorableCompressor(raw: string | null): CompressorSettings | null {
  if (raw === null) return null;
  try {
    const parsed = storedCompressor.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
