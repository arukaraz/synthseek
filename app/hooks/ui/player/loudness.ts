import type { PlayerReplayGain, PlayerTrack } from "@components/Player";

import { NO_GAIN_FACTOR } from "./constants";
import type { LoudnessMode, LoudnessPreferences } from "./types";

export function loudnessModeFor(queue: readonly PlayerTrack[], shuffle: boolean): LoudnessMode {
  if (shuffle) return "track";
  if (queue.length < 2) return "track";
  const first = queue[0]?.albumId;
  if (first === undefined || first.length === 0) return "track";
  return queue.every((entry) => entry.albumId === first) ? "album" : "track";
}

function readingFor(gain: PlayerReplayGain, mode: LoudnessMode): { gainDb: number; peak: number | null } | null {
  const album = { gainDb: gain.albumGain, peak: gain.albumPeak };
  const track = { gainDb: gain.trackGain, peak: gain.trackPeak };
  const preferred = mode === "album" ? album : track;
  const fallback = mode === "album" ? track : album;
  const chosen = preferred.gainDb !== null ? preferred : fallback;
  return chosen.gainDb === null ? null : { gainDb: chosen.gainDb, peak: chosen.peak };
}

export function gainFactorFor(track: PlayerTrack, mode: LoudnessMode, preferences: LoudnessPreferences): number {
  if (!preferences.enabled) return NO_GAIN_FACTOR;
  const reading = readingFor(track.replayGain, mode);
  if (reading === null) return NO_GAIN_FACTOR;

  const factor = Math.pow(10, (reading.gainDb + preferences.preAmpDb) / 20);
  if (!Number.isFinite(factor)) return NO_GAIN_FACTOR;
  if (reading.peak === null || reading.peak <= 0) return factor;
  return Math.min(factor, 1 / reading.peak);
}
