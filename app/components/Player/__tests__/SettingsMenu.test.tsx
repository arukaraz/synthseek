import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { createPlayerActions, createPlayerDevice, createPlayerView } from "@test/factories";
import { EQUALIZER_MAX_DB, EQUALIZER_MIN_DB, EQUALIZER_PRESETS, EQUALIZER_STEP_DB } from "@hooks/ui/player/constants";
import enPlayer from "@modules/i18n/messages/en/player.json";

import { EQUALIZER_PAGE_STEP_DB } from "../constants";
import { SettingsMenu } from "../SettingsMenu";
import type { PanelAnchorPoint, PlayerCompressor, PlayerEqualizer, PlayerView } from "../types";

const anchor = vi.hoisted(() => ({ point: null as PanelAnchorPoint | null }));

vi.mock("../useAnchorRect", () => ({ useAnchorRect: () => anchor.point }));

function renderMenu(
  equalizer: Partial<PlayerEqualizer> = {},
  overrides: Partial<PlayerView> = {},
  compressor: Partial<PlayerCompressor> = {}
) {
  const actions = createPlayerActions();
  const base = createPlayerView();
  const view = createPlayerView({
    settingsOpen: true,
    equalizer: { ...base.equalizer, enabled: true, ...equalizer },
    compressor: { ...base.compressor, ...compressor },
    ...overrides,
  });
  render(<SettingsMenu view={view} actions={actions} chain={false} />);
  return { actions, view, user: userEvent.setup() };
}

function bands(): HTMLElement[] {
  return screen.getAllByRole("slider", { name: /Hz band/ });
}

function section(name: string): ReturnType<typeof within> {
  return within(screen.getByRole("region", { name }));
}

function equalizerPresetButton(): HTMLElement {
  return section(enPlayer.equalizer.caption).getByRole("button", { name: enPlayer.equalizer.preset });
}

function compressorPresetButton(): HTMLElement {
  return section(enPlayer.settings.compressor.caption).getByRole("button", {
    name: enPlayer.settings.compressor.preset,
  });
}

function band(index: number): HTMLElement {
  const found = bands()[index];
  if (found === undefined) throw new Error(`no band at ${index}`);
  return found;
}

describe("the playback settings panel", () => {
  it("names itself and lays out the four sections", () => {
    renderMenu();

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(enPlayer.settings.title)).toBeInTheDocument();
    expect(within(dialog).getByText(enPlayer.equalizer.caption)).toBeInTheDocument();
    expect(within(dialog).getByText(enPlayer.settings.compressor.caption)).toBeInTheDocument();
    expect(within(dialog).getByText(enPlayer.settings.loudness.caption)).toBeInTheDocument();
    expect(within(dialog).getByText(enPlayer.settings.conversion.caption)).toBeInTheDocument();
  });

  it("closes from its own button", async () => {
    const { actions, user } = renderMenu();

    await user.click(screen.getByRole("button", { name: enPlayer.settings.close }));

    expect(actions.toggleSettings).toHaveBeenCalled();
  });

  it("rises from the bar with its bottom edge open and closes downward", () => {
    anchor.point = null;
    renderMenu();

    const surface = screen.getByRole("button", { name: enPlayer.settings.close }).closest("[class*='rounded-t']");
    expect(surface?.className).toContain("border-b-0");
    expect(
      screen.getByRole("button", { name: enPlayer.settings.close }).querySelector("svg.lucide-chevron-down")
    ).not.toBeNull();
  });

  it("hangs from the header with its top edge open and closes upward in the compact player", () => {
    anchor.point = null;
    const actions = createPlayerActions();
    render(<SettingsMenu view={createPlayerView({ settingsOpen: true })} actions={actions} chain={false} hanging />);

    const close = screen.getByRole("button", { name: enPlayer.settings.close });
    expect(close.closest("[class*='rounded-t']")?.className).toContain("sm:border-t-0");
    expect(close.querySelector("svg.lucide-chevron-up")).not.toBeNull();
  });

  it("floats clear of both edges on the full screen stage, closing towards the toggle it hangs from", () => {
    anchor.point = { top: 80, bottom: 0, left: 1000, below: true, room: 600 };
    const actions = createPlayerActions();
    render(<SettingsMenu view={createPlayerView({ settingsOpen: true })} actions={actions} chain={false} anchored />);

    const close = screen.getByRole("button", { name: enPlayer.settings.close });
    const surface = close.closest("[class*='rounded-t']")?.className ?? "";
    expect(surface).not.toContain("border-t-0");
    expect(surface).not.toContain("border-b-0");
    expect(close.querySelector("svg.lucide-chevron-up")).not.toBeNull();
    anchor.point = null;
  });

  it("stays open when the page behind it is used or escape is pressed, because it closes by hand only", async () => {
    const { actions, user } = renderMenu();

    await user.click(document.body);
    await user.keyboard("{Escape}");

    expect(actions.toggleSettings).not.toHaveBeenCalled();
  });
});

describe("the equaliser bands", () => {
  it("lays out one slider per band, lowest first", () => {
    renderMenu();

    expect(bands()).toHaveLength(10);
    expect(band(0)).toHaveAttribute("aria-label", enPlayer.equalizer.band.replace("{{band}}", "32"));
    expect(band(9)).toHaveAttribute("aria-label", enPlayer.equalizer.band.replace("{{band}}", "16k"));
  });

  it("reports each band in decibels, signing a boost", () => {
    renderMenu({ gainsDb: EQUALIZER_PRESETS.rock, preset: { kind: "builtIn", id: "rock" } });

    expect(band(0)).toHaveAttribute("aria-valuenow", "5");
    expect(band(0)).toHaveAttribute("aria-valuetext", enPlayer.equalizer.gain.replace("{{value}}", "+5"));
    expect(band(4)).toHaveAttribute("aria-valuetext", enPlayer.equalizer.gain.replace("{{value}}", "-1"));
  });

  it("nudges a band from the keyboard, half a decibel at a time", () => {
    const { actions } = renderMenu();

    fireEvent.keyDown(band(3), { key: "ArrowUp" });
    expect(actions.setEqualizerBand).toHaveBeenLastCalledWith(3, EQUALIZER_STEP_DB);

    fireEvent.keyDown(band(3), { key: "ArrowDown" });
    expect(actions.setEqualizerBand).toHaveBeenLastCalledWith(3, -EQUALIZER_STEP_DB);
  });

  it("jumps by a page, and to either end", () => {
    const { actions } = renderMenu();

    fireEvent.keyDown(band(1), { key: "PageUp" });
    expect(actions.setEqualizerBand).toHaveBeenLastCalledWith(1, EQUALIZER_PAGE_STEP_DB);

    fireEvent.keyDown(band(1), { key: "PageDown" });
    expect(actions.setEqualizerBand).toHaveBeenLastCalledWith(1, -EQUALIZER_PAGE_STEP_DB);

    fireEvent.keyDown(band(1), { key: "Home" });
    expect(actions.setEqualizerBand).toHaveBeenLastCalledWith(1, EQUALIZER_MIN_DB);

    fireEvent.keyDown(band(1), { key: "End" });
    expect(actions.setEqualizerBand).toHaveBeenLastCalledWith(1, EQUALIZER_MAX_DB);
  });

  it("sets the band where the pointer lands and follows a drag", () => {
    const { actions } = renderMenu();
    const slider = band(0);
    slider.getBoundingClientRect = () => new DOMRect(0, 0, 20, 120);
    slider.setPointerCapture = vi.fn();
    slider.hasPointerCapture = () => true;

    fireEvent.pointerDown(slider, { pointerId: 1, clientY: 30 });
    fireEvent.pointerMove(slider, { pointerId: 1, clientY: 90 });

    expect(actions.setEqualizerBand).toHaveBeenCalledWith(0, 6);
    expect(actions.setEqualizerBand).toHaveBeenCalledWith(0, -6);
  });

  it("leaves the bands alone while the equaliser is off", () => {
    const { actions } = renderMenu({ enabled: false });
    const slider = band(0);
    slider.getBoundingClientRect = () => new DOMRect(0, 0, 20, 120);
    slider.setPointerCapture = vi.fn();

    fireEvent.keyDown(slider, { key: "ArrowUp" });
    fireEvent.pointerDown(slider, { pointerId: 1, clientY: 30 });

    expect(slider).toHaveAttribute("aria-disabled", "true");
    expect(actions.setEqualizerBand).not.toHaveBeenCalled();
  });
});

describe("the equaliser controls", () => {
  it("switches the equaliser off from the toggle", async () => {
    const { actions, user } = renderMenu();

    await user.click(screen.getByRole("switch", { name: enPlayer.equalizer.enabled }));

    expect(actions.setEqualizerEnabled).toHaveBeenCalledWith(false);
  });

  it("offers the built-in presets and applies the one picked", async () => {
    const { actions, user } = renderMenu();

    await user.click(equalizerPresetButton());
    await user.click(await screen.findByRole("menuitemradio", { name: enPlayer.equalizer.presets.rock }));

    expect(actions.applyEqualizerPreset).toHaveBeenCalledWith({ kind: "builtIn", id: "rock" });
  });

  it("lists the presets the listener saved under their own heading and applies one by name", async () => {
    const { actions, user } = renderMenu({ customPresets: ["Mine", "Evening"] });

    await user.click(equalizerPresetButton());
    expect(await screen.findByText(enPlayer.equalizer.customGroup)).toBeInTheDocument();
    await user.click(screen.getByRole("menuitemradio", { name: "Evening" }));

    expect(actions.applyEqualizerPreset).toHaveBeenCalledWith({ kind: "custom", name: "Evening" });
  });

  it("names the preset in play, and calls a curve that matches none custom", () => {
    renderMenu({ gainsDb: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0], preset: null });

    expect(equalizerPresetButton()).toHaveTextContent(enPlayer.equalizer.custom);
  });

  it("saves the current curve under a typed name and clears the box", async () => {
    const { actions, user } = renderMenu();
    const box = screen.getByRole("textbox", { name: enPlayer.equalizer.presetName });
    const save = screen.getByRole("button", { name: enPlayer.equalizer.savePreset });
    expect(save).toBeDisabled();

    await user.type(box, "Mine");
    await user.click(save);

    expect(actions.saveEqualizerPreset).toHaveBeenCalledWith("Mine");
    expect(box).toHaveValue("");
  });

  it("offers to delete the saved preset that is in play, and none other", async () => {
    const { actions, user } = renderMenu({ preset: { kind: "custom", name: "Mine" }, customPresets: ["Mine"] });

    await user.click(screen.getByRole("button", { name: enPlayer.equalizer.deletePreset.replace("{{name}}", "Mine") }));

    expect(actions.deleteEqualizerPreset).toHaveBeenCalledWith("Mine");
  });

  it("shows no delete button for a built-in preset", () => {
    renderMenu({ gainsDb: EQUALIZER_PRESETS.rock, preset: { kind: "builtIn", id: "rock" } });

    expect(screen.queryByRole("button", { name: /Delete the preset/ })).not.toBeInTheDocument();
  });

  it("goes back to flat, and has nothing to reset while the curve is already flat", async () => {
    const { actions, user } = renderMenu({ gainsDb: EQUALIZER_PRESETS.rock, preset: { kind: "builtIn", id: "rock" } });

    await user.click(screen.getByRole("button", { name: enPlayer.equalizer.reset }));

    expect(actions.applyEqualizerPreset).toHaveBeenCalledWith({ kind: "builtIn", id: "flat" });
  });

  it("has nothing to reset while the curve is already flat", () => {
    renderMenu();

    expect(screen.getByRole("button", { name: enPlayer.equalizer.reset })).toBeDisabled();
  });

  it("moves the preamp from the keyboard, half a decibel at a time", () => {
    const { actions } = renderMenu();

    fireEvent.keyDown(screen.getByRole("slider", { name: enPlayer.equalizer.preamp }), { key: "ArrowRight" });

    expect(actions.setEqualizerPreamp).toHaveBeenCalledWith(EQUALIZER_STEP_DB);
  });

  it("says how much headroom the curve costs, to a tenth of a decibel", () => {
    renderMenu({ gainsDb: EQUALIZER_PRESETS.rock, preset: { kind: "builtIn", id: "rock" }, headroomDb: -6.12 });

    expect(screen.getByText(enPlayer.equalizer.headroom.replace("{{value}}", "-6.1"))).toBeInTheDocument();
  });

  it("says it shapes only this browser when the sound is somewhere else", () => {
    const kitchen = createPlayerDevice({ id: "kitchen", name: "Kitchen", local: false, active: true });
    renderMenu({}, { activeDevice: kitchen, devices: [createPlayerDevice({ active: false }), kitchen] });

    expect(screen.getByText(enPlayer.equalizer.remoteHint)).toBeInTheDocument();
  });
});

describe("the compressor controls", () => {
  it("switches the compressor on from the toggle", async () => {
    const { actions, user } = renderMenu();

    await user.click(screen.getByRole("switch", { name: enPlayer.settings.compressor.enabled }));

    expect(actions.setCompressorEnabled).toHaveBeenCalledWith(true);
  });

  it("names the preset in play once it is on", () => {
    renderMenu({}, {}, { enabled: true });

    expect(compressorPresetButton()).toHaveTextContent(enPlayer.settings.compressor.presets.moderate);
  });

  it("folds its sliders and its preset away while it is off, leaving the switch and what it does", () => {
    renderMenu();
    const compressor = section(enPlayer.settings.compressor.caption);

    expect(compressor.queryByRole("slider")).not.toBeInTheDocument();
    expect(compressor.queryByRole("button", { name: enPlayer.settings.compressor.preset })).not.toBeInTheDocument();
    expect(compressor.getByText(enPlayer.settings.compressor.hint)).toBeInTheDocument();
  });

  it("applies a preset and moves one parameter at a time while it is on", async () => {
    const { actions, user } = renderMenu({}, {}, { enabled: true });

    await user.click(compressorPresetButton());
    await user.click(await screen.findByRole("menuitemradio", { name: enPlayer.settings.compressor.presets.limiter }));
    fireEvent.keyDown(screen.getByRole("slider", { name: enPlayer.settings.compressor.params.thresholdDb }), {
      key: "ArrowRight",
    });

    expect(actions.applyCompressorPreset).toHaveBeenCalledWith("limiter");
    expect(actions.setCompressorParam).toHaveBeenCalledWith("thresholdDb", -23);
  });

  it("shows each parameter with its unit", () => {
    renderMenu({}, {}, { enabled: true });

    expect(screen.getByRole("slider", { name: enPlayer.settings.compressor.params.ratio })).toHaveAttribute(
      "aria-valuetext",
      "4:1"
    );
    expect(screen.getByRole("slider", { name: enPlayer.settings.compressor.params.attackMs })).toHaveAttribute(
      "aria-valuetext",
      "20 ms"
    );
  });
});

describe("the volume normalization controls", () => {
  it("switches normalization off for the account", async () => {
    const { actions, user } = renderMenu();

    await user.click(screen.getByRole("switch", { name: enPlayer.settings.loudness.enabled }));

    expect(actions.setLoudnessEnabled).toHaveBeenCalledWith(false);
  });

  it("commits the extra gain once, when the slider settles, not on every step", () => {
    const { actions } = renderMenu();
    const slider = screen.getByRole("slider", { name: enPlayer.settings.loudness.preamp });

    fireEvent.keyDown(slider, { key: "End" });

    expect(actions.setLoudnessPreamp).toHaveBeenCalledTimes(1);
    expect(actions.setLoudnessPreamp).toHaveBeenCalledWith(15);
  });

  it("folds the extra gain away while normalization is off", () => {
    renderMenu({}, { loudness: { enabled: false, preAmpDb: 0 } });

    expect(screen.queryByRole("slider", { name: enPlayer.settings.loudness.preamp })).not.toBeInTheDocument();
    expect(screen.getByText(enPlayer.settings.loudness.hint)).toBeInTheDocument();
  });
});

describe("the conversion controls", () => {
  it("turns conversion on for this browser at the bitrate shown", async () => {
    const { actions, user } = renderMenu();

    await user.click(screen.getByRole("switch", { name: enPlayer.settings.conversion.enabled }));

    expect(actions.setConversion).toHaveBeenCalledWith({ enabled: true, bitrateKbps: 192 });
  });

  it("folds the bitrate away while conversion is off", () => {
    renderMenu();

    expect(screen.queryByRole("button", { name: enPlayer.settings.conversion.bitrate })).not.toBeInTheDocument();
    expect(screen.getByText(enPlayer.settings.conversion.hint)).toBeInTheDocument();
  });

  it("offers the bitrates the server honours once conversion is on", async () => {
    const { actions, user } = renderMenu({}, { conversion: { enabled: true, bitrateKbps: 192 } });

    await user.click(screen.getByRole("button", { name: enPlayer.settings.conversion.bitrate }));
    await user.click(
      await screen.findByRole("menuitemradio", {
        name: enPlayer.settings.conversion.bitrateValue.replace("{{kbps}}", "320"),
      })
    );

    expect(actions.setConversion).toHaveBeenCalledWith({ enabled: true, bitrateKbps: 320 });
  });
});
