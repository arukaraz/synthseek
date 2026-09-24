import type { EqualizerPresetId } from "@components/Player";
import { z } from "zod";

import {
  EQUALIZER_BANDS_HZ,
  EQUALIZER_MAX_CUSTOM_PRESETS,
  EQUALIZER_MAX_DB,
  EQUALIZER_MIN_DB,
  EQUALIZER_PRESET_NAME_MAX_LENGTH,
  EQUALIZER_PRESETS,
  EQUALIZER_Q,
  EQUALIZER_RESPONSE_MAX_HZ,
  EQUALIZER_RESPONSE_MIN_HZ,
  EQUALIZER_RESPONSE_POINTS_PER_OCTAVE,
  EQUALIZER_RESPONSE_SAMPLE_RATE,
  EQUALIZER_STEP_DB,
} from "./constants";
import type { EqualizerCustomPreset, EqualizerSettings } from "./types";

const gainsDb = z.array(z.number().min(EQUALIZER_MIN_DB).max(EQUALIZER_MAX_DB)).length(EQUALIZER_BANDS_HZ.length);

const storedEqualizer = z.object({
  enabled: z.boolean(),
  gainsDb,
  preampDb: z.number().min(EQUALIZER_MIN_DB).max(EQUALIZER_MAX_DB).default(0),
});

const storedPresets = z
  .array(z.object({ name: z.string().trim().min(1).max(EQUALIZER_PRESET_NAME_MAX_LENGTH), gainsDb }))
  .max(EQUALIZER_MAX_CUSTOM_PRESETS);

export function flatEqualizer(): EqualizerSettings {
  return { enabled: false, gainsDb: EQUALIZER_PRESETS.flat, preampDb: 0 };
}

export function presetNameFrom(raw: string): string | null {
  const name = raw.trim();
  if (name.length === 0 || name.length > EQUALIZER_PRESET_NAME_MAX_LENGTH) return null;
  return name;
}

export function withCustomPreset(
  presets: readonly EqualizerCustomPreset[],
  preset: EqualizerCustomPreset
): EqualizerCustomPreset[] {
  return [...presets.filter((entry) => entry.name !== preset.name), preset].slice(-EQUALIZER_MAX_CUSTOM_PRESETS);
}

export function customPresetMatching(
  presets: readonly EqualizerCustomPreset[],
  gainsDb: readonly number[]
): string | null {
  return (
    presets.find(
      (preset) =>
        preset.gainsDb.length === gainsDb.length && preset.gainsDb.every((gain, band) => gain === gainsDb[band])
    )?.name ?? null
  );
}

export function restorableEqualizerPresets(raw: string | null): EqualizerCustomPreset[] | null {
  if (raw === null) return null;
  try {
    const parsed = storedPresets.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function clampGainDb(value: number): number {
  return Math.min(EQUALIZER_MAX_DB, Math.max(EQUALIZER_MIN_DB, value));
}

export function steppedGainDb(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return clampGainDb(Math.round(value / EQUALIZER_STEP_DB) * EQUALIZER_STEP_DB);
}

export function isEqualizerPresetId(value: string): value is EqualizerPresetId {
  return Object.hasOwn(EQUALIZER_PRESETS, value);
}

export function equalizerPresetIds(): EqualizerPresetId[] {
  return Object.keys(EQUALIZER_PRESETS).filter(isEqualizerPresetId);
}

export function equalizerPresetMatching(gainsDb: readonly number[]): EqualizerPresetId | null {
  return (
    equalizerPresetIds().find((id) => {
      const preset = EQUALIZER_PRESETS[id];
      return preset.length === gainsDb.length && preset.every((gain, band) => gain === gainsDb[band]);
    }) ?? null
  );
}

function peakingResponseDb(hz: number, centreHz: number, q: number, gainDb: number, sampleRate: number): number {
  const amplitude = Math.pow(10, gainDb / 40);
  const centre = (2 * Math.PI * centreHz) / sampleRate;
  const alpha = Math.sin(centre) / (2 * q);
  const b0 = 1 + alpha * amplitude;
  const b1 = -2 * Math.cos(centre);
  const b2 = 1 - alpha * amplitude;
  const a0 = 1 + alpha / amplitude;
  const a1 = b1;
  const a2 = 1 - alpha / amplitude;
  const w = (2 * Math.PI * hz) / sampleRate;
  const numeratorReal = b0 + b1 * Math.cos(w) + b2 * Math.cos(2 * w);
  const numeratorImaginary = -(b1 * Math.sin(w) + b2 * Math.sin(2 * w));
  const denominatorReal = a0 + a1 * Math.cos(w) + a2 * Math.cos(2 * w);
  const denominatorImaginary = -(a1 * Math.sin(w) + a2 * Math.sin(2 * w));
  return (
    20 * Math.log10(Math.hypot(numeratorReal, numeratorImaginary) / Math.hypot(denominatorReal, denominatorImaginary))
  );
}

export function equalizerResponseDb(
  gainsDb: readonly number[],
  hz: number,
  sampleRate = EQUALIZER_RESPONSE_SAMPLE_RATE
): number {
  return EQUALIZER_BANDS_HZ.reduce(
    (sum, centreHz, band) => sum + peakingResponseDb(hz, centreHz, EQUALIZER_Q, gainsDb[band] ?? 0, sampleRate),
    0
  );
}

function responseProbeHz(): number[] {
  const step = Math.pow(2, 1 / EQUALIZER_RESPONSE_POINTS_PER_OCTAVE);
  const probes: number[] = [...EQUALIZER_BANDS_HZ];
  for (let hz = EQUALIZER_RESPONSE_MIN_HZ; hz <= EQUALIZER_RESPONSE_MAX_HZ; hz *= step) probes.push(hz);
  return probes;
}

export function headroomDbFor(gainsDb: readonly number[], sampleRate = EQUALIZER_RESPONSE_SAMPLE_RATE): number {
  if (gainsDb.every((gain) => gain <= 0)) return 0;
  const loudest = Math.max(...responseProbeHz().map((hz) => equalizerResponseDb(gainsDb, hz, sampleRate)));
  return loudest > 0 ? -loudest : 0;
}

export function headroomFactorFor(gainsDb: readonly number[], sampleRate = EQUALIZER_RESPONSE_SAMPLE_RATE): number {
  return Math.pow(10, headroomDbFor(gainsDb, sampleRate) / 20);
}

export function appliedEqualizerGains(settings: EqualizerSettings): readonly number[] {
  return settings.enabled ? settings.gainsDb : settings.gainsDb.map(() => 0);
}

export function restorableEqualizer(raw: string | null): EqualizerSettings | null {
  if (raw === null) return null;
  try {
    const parsed = storedEqualizer.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
