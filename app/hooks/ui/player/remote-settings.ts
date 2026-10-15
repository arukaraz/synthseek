import { compressorPresetIds, compressorPresetMatching, isCompressorPresetId } from "./compressor";
import {
  COMPRESSOR_LIMITS,
  COMPRESSOR_PARAMS,
  CONVERSION_BITRATES_KBPS,
  EQUALIZER_BANDS_HZ,
  EQUALIZER_MAX_DB,
  EQUALIZER_MIN_DB,
  TRANSITION_MAX_SECONDS,
  TRANSITION_MIN_SECONDS,
} from "./constants";
import { equalizerPresetIds, equalizerPresetOf, isEqualizerPresetId } from "./equalizer";
import { actions, getSnapshot } from "./store";
import type {
  CompressorParam,
  PlayerSessionState,
  PlayerSettingsReport,
  SettingsCommandPayload,
  ViewCommandPayload,
} from "./types";

function applyEqualizer(change: SettingsCommandPayload["equalizer"]): void {
  if (change === undefined) return;
  const { preset } = change;
  if (preset?.kind === "custom") actions.applyEqualizerPreset({ kind: "custom", name: preset.name });
  if (preset?.kind === "builtIn" && isEqualizerPresetId(preset.name))
    actions.applyEqualizerPreset({ kind: "builtIn", id: preset.name });
  change.gainsDb?.forEach((gainDb, band) => actions.setEqualizerBand(band, gainDb));
  if (change.preampDb !== undefined) actions.setEqualizerPreamp(change.preampDb);
  if (change.enabled !== undefined) actions.setEqualizerEnabled(change.enabled);
}

function applyCompressor(change: SettingsCommandPayload["compressor"]): void {
  if (change === undefined) return;
  if (change.preset !== undefined && isCompressorPresetId(change.preset)) actions.applyCompressorPreset(change.preset);
  for (const param of COMPRESSOR_PARAMS) {
    const value = change[param];
    if (value !== undefined) actions.setCompressorParam(param, value);
  }
  if (change.enabled !== undefined) actions.setCompressorEnabled(change.enabled);
}

function applyTransition(change: SettingsCommandPayload["transition"]): void {
  if (change === undefined) return;
  const current = getSnapshot().transition;
  actions.setTransition({
    mode: change.mode ?? current.mode,
    seconds: change.seconds ?? current.seconds,
    curve: change.curve ?? current.curve,
  });
}

function applyConversion(change: SettingsCommandPayload["conversion"]): void {
  if (change === undefined) return;
  const current = getSnapshot().conversion;
  actions.setConversion({
    enabled: change.enabled ?? current.enabled,
    bitrateKbps: change.bitrateKbps ?? current.bitrateKbps,
  });
}

export function applyRemoteSettings(command: SettingsCommandPayload): void {
  applyEqualizer(command.equalizer);
  applyCompressor(command.compressor);
  applyTransition(command.transition);
  applyConversion(command.conversion);
}

export function applyRemoteView(command: ViewCommandPayload): void {
  if (command.mode !== undefined && command.mode !== getSnapshot().mode) actions.selectMode(command.mode);
  if (command.fullscreen !== undefined && command.fullscreen !== getSnapshot().fullscreen) actions.toggleFullscreen();
  if (command.lyrics === true && !getSnapshot().lyricsOpen) actions.openLyrics();
  if (command.lyrics === false && getSnapshot().lyricsOpen) actions.toggleLyrics();
  if (command.queue !== undefined && command.queue !== getSnapshot().queueOpen) actions.toggleQueue();
}

function rangeOf(param: CompressorParam): { min: number; max: number } {
  return { min: COMPRESSOR_LIMITS[param].min, max: COMPRESSOR_LIMITS[param].max };
}

export function playerSettingsReport(state: PlayerSessionState): PlayerSettingsReport {
  const preset = equalizerPresetOf(state.equalizerPresets, state.equalizer.gainsDb);
  return {
    equalizer: {
      enabled: state.equalizer.enabled,
      preset:
        preset === null
          ? null
          : preset.kind === "custom"
            ? { kind: "custom", name: preset.name }
            : { kind: "builtIn", name: preset.id },
      preampDb: state.equalizer.preampDb,
      bandsHz: [...EQUALIZER_BANDS_HZ],
      gainsDb: [...state.equalizer.gainsDb],
      gainRangeDb: { min: EQUALIZER_MIN_DB, max: EQUALIZER_MAX_DB },
      builtInPresets: equalizerPresetIds(),
      customPresets: state.equalizerPresets.map((entry) => entry.name),
    },
    compressor: {
      ...state.compressor,
      preset: compressorPresetMatching(state.compressor),
      presets: compressorPresetIds(),
      ranges: {
        thresholdDb: rangeOf("thresholdDb"),
        ratio: rangeOf("ratio"),
        attackMs: rangeOf("attackMs"),
        releaseMs: rangeOf("releaseMs"),
        kneeDb: rangeOf("kneeDb"),
      },
    },
    transition: { ...state.transition, secondsRange: { min: TRANSITION_MIN_SECONDS, max: TRANSITION_MAX_SECONDS } },
    conversion: { ...state.conversion, bitrates: [...CONVERSION_BITRATES_KBPS] },
    view: {
      mode: state.mode,
      fullscreen: state.fullscreen,
      lyricsOpen: state.lyricsOpen,
      queueOpen: state.queueOpen,
    },
  };
}
