import type { PublicUser } from "@api/__generated__/types";
import type { PlayerSettingsActions, PlayerSettingsView } from "@components/Player";

import { compressorPresetMatching } from "./compressor";
import { appliedEqualizerGains, equalizerPresetOf, headroomDbFor } from "./equalizer";
import { actions } from "./store";
import type { PlayerSessionState } from "./types";

type PlaybackProfile = Pick<PublicUser, "loudnessNormalization" | "loudnessPreampDb" | "autoplayEnabled">;

export function playerSettingsViewOf(session: PlayerSessionState, profile: PlaybackProfile | null): PlayerSettingsView {
  const { equalizer } = session;
  return {
    equalizer: {
      enabled: equalizer.enabled,
      gainsDb: equalizer.gainsDb,
      preampDb: equalizer.preampDb,
      preset: equalizerPresetOf(session.equalizerPresets, equalizer.gainsDb),
      headroomDb: headroomDbFor(appliedEqualizerGains(equalizer)),
      customPresets: session.equalizerPresets.map((preset) => preset.name),
    },
    compressor: { ...session.compressor, preset: compressorPresetMatching(session.compressor) },
    loudness: {
      enabled: profile?.loudnessNormalization ?? true,
      preAmpDb: profile?.loudnessPreampDb ?? 0,
    },
    autoplay: profile?.autoplayEnabled ?? false,
    conversion: session.conversion,
    transition: session.transition,
  };
}

export function playerSettingsActionsOf(
  setProfile: (profile: Partial<PlaybackProfile>) => void
): PlayerSettingsActions {
  return {
    setEqualizerEnabled: actions.setEqualizerEnabled,
    setEqualizerBand: actions.setEqualizerBand,
    setEqualizerPreamp: actions.setEqualizerPreamp,
    applyEqualizerPreset: actions.applyEqualizerPreset,
    saveEqualizerPreset: actions.saveEqualizerPreset,
    deleteEqualizerPreset: actions.deleteEqualizerPreset,
    setCompressorEnabled: actions.setCompressorEnabled,
    applyCompressorPreset: actions.applyCompressorPreset,
    setCompressorParam: actions.setCompressorParam,
    setLoudnessEnabled: (enabled) => setProfile({ loudnessNormalization: enabled }),
    setLoudnessPreamp: (preAmpDb) => setProfile({ loudnessPreampDb: preAmpDb }),
    setAutoplayEnabled: (enabled) => setProfile({ autoplayEnabled: enabled }),
    setConversion: actions.setConversion,
    setTransition: actions.setTransition,
  };
}
