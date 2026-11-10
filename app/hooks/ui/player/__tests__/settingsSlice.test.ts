import { describe, expect, it, vi } from "vitest";

import { playerSettingsActionsOf, playerSettingsViewOf } from "../settingsSlice";
import { getSnapshot } from "../store";

describe("playerSettingsViewOf", () => {
  it("falls back to normalized volume on, no extra gain and no autoplay without a signed-in profile", () => {
    const view = playerSettingsViewOf(getSnapshot(), null);

    expect(view.loudness).toEqual({ enabled: true, preAmpDb: 0 });
    expect(view.autoplay).toBe(false);
  });

  it("mirrors the profile's playback preferences when there is one", () => {
    const view = playerSettingsViewOf(getSnapshot(), {
      loudnessNormalization: false,
      loudnessPreampDb: 3,
      autoplayEnabled: true,
    });

    expect(view.loudness).toEqual({ enabled: false, preAmpDb: 3 });
    expect(view.autoplay).toBe(true);
  });

  it("describes the equalizer and compressor the way the player does", () => {
    const session = getSnapshot();
    const view = playerSettingsViewOf(session, null);

    expect(view.equalizer.gainsDb).toEqual(session.equalizer.gainsDb);
    expect(view.equalizer.customPresets).toEqual(session.equalizerPresets.map((preset) => preset.name));
    expect(view.compressor.enabled).toBe(session.compressor.enabled);
    expect(view.conversion).toBe(session.conversion);
    expect(view.transition).toBe(session.transition);
  });
});

describe("playerSettingsActionsOf", () => {
  it("writes the account-wide preferences through the profile and nothing else", () => {
    const setProfile = vi.fn();
    const actions = playerSettingsActionsOf(setProfile);

    actions.setLoudnessEnabled(false);
    actions.setLoudnessPreamp(2.5);
    actions.setAutoplayEnabled(true);

    expect(setProfile.mock.calls).toEqual([
      [{ loudnessNormalization: false }],
      [{ loudnessPreampDb: 2.5 }],
      [{ autoplayEnabled: true }],
    ]);
  });
});
