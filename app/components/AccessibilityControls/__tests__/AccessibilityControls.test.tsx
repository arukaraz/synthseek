import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";
import { DEFAULT_ACCESSIBILITY, type AccessibilitySettings } from "@modules/accessibility";

import { AccessibilityControls } from "../AccessibilityControls";

const copy = enSettings.accessibility;

const state = vi.hoisted(() => ({
  update: vi.fn(),
  setTextSize: vi.fn(),
  textSize: "normal",
  values: {} as AccessibilitySettings,
}));

vi.mock("@modules/providers/AccessibilityProvider", () => ({
  useAccessibility: () => ({
    ...state.values,
    motionReduced: false,
    transparencyReduced: false,
    moreContrast: false,
    signedIn: true,
    textSize: state.textSize,
    update: state.update,
    setTextSize: state.setTextSize,
  }),
}));

beforeEach(async () => {
  await i18n.changeLanguage("en");
  state.update.mockReset();
  state.setTextSize.mockReset();
  state.textSize = "normal";
  state.values = { ...DEFAULT_ACCESSIBILITY };
});

describe("AccessibilityControls, the four settings that follow the first six", () => {
  it("lists every control of the account page in the approved order", () => {
    render(<AccessibilityControls scope="account" />);

    const labels = [
      copy.mode.label,
      copy.motion.label,
      copy.transparency.label,
      copy.contrast.label,
      copy.toastDuration.label,
      copy.shortcuts.label,
      copy.textSize.label,
      copy.buttonNames.label,
      copy.monoAudio.label,
      copy.reactiveWave.label,
    ];
    const shown = Array.from(document.querySelectorAll("[data-anchor-target]")).map(
      (row) => row.querySelector("span")?.textContent
    );

    expect(shown).toEqual(labels);
  });

  it("changes the text size at once and keeps it in this browser", async () => {
    const user = userEvent.setup();
    render(<AccessibilityControls scope="account" />);

    await user.click(screen.getByRole("button", { name: new RegExp(copy.textSize.label) }));
    await user.click(await screen.findByRole("menuitemradio", { name: copy.textSize.options.larger }));

    expect(state.setTextSize).toHaveBeenCalledWith("larger");
    expect(state.update).not.toHaveBeenCalled();
  });

  it("turns the button names on at once", async () => {
    render(<AccessibilityControls scope="account" />);

    await userEvent.setup().click(screen.getByRole("switch", { name: copy.buttonNames.label }));

    expect(state.update).toHaveBeenCalledWith({ buttonNames: true });
  });

  it("turns mono audio on at once", async () => {
    render(<AccessibilityControls scope="account" />);

    await userEvent.setup().click(screen.getByRole("switch", { name: copy.monoAudio.label }));

    expect(state.update).toHaveBeenCalledWith({ monoAudio: true });
  });

  it("shows the moving wave as on by default and turns it off at once", async () => {
    render(<AccessibilityControls scope="account" />);
    const wave = screen.getByRole("switch", { name: copy.reactiveWave.label });

    expect(wave).toBeChecked();
    await userEvent.setup().click(wave);

    expect(state.update).toHaveBeenCalledWith({ reactiveWave: false });
  });

  it("offers a guest the text size and the button names, and leaves the player settings to the account", () => {
    render(<AccessibilityControls scope="guest" />);

    expect(screen.getByRole("button", { name: new RegExp(copy.textSize.label) })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: copy.buttonNames.label })).toBeInTheDocument();
    expect(screen.queryByRole("switch", { name: copy.monoAudio.label })).not.toBeInTheDocument();
    expect(screen.queryByRole("switch", { name: copy.reactiveWave.label })).not.toBeInTheDocument();
  });
});

describe("AccessibilityControls for an account", () => {
  it("offers the six controls by role and name", () => {
    render(<AccessibilityControls scope="account" />);

    expect(screen.getByRole("switch", { name: copy.mode.label })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: copy.motion.label })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: copy.transparency.label })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: copy.contrast.label })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(copy.toastDuration.label) })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: copy.shortcuts.label })).toBeInTheDocument();
  });

  it("describes each switch with its one-line help", () => {
    render(<AccessibilityControls scope="account" />);

    expect(screen.getByRole("switch", { name: copy.mode.label })).toHaveAccessibleDescription(copy.mode.description);
    expect(screen.getByRole("switch", { name: copy.shortcuts.label })).toHaveAccessibleDescription(
      copy.shortcuts.description
    );
  });

  it("shows the stored choices", () => {
    state.values = { ...DEFAULT_ACCESSIBILITY, mode: true, motion: "on", singleKeyShortcuts: false };
    render(<AccessibilityControls scope="account" />);

    expect(screen.getByRole("switch", { name: copy.mode.label })).toBeChecked();
    expect(screen.getByRole("switch", { name: copy.shortcuts.label })).not.toBeChecked();
    const motion = screen.getByRole("radiogroup", { name: copy.motion.label });
    expect(within(motion).getByRole("radio", { name: copy.choices.on })).toBeChecked();
    expect(within(motion).getByRole("radio", { name: copy.choices.auto })).not.toBeChecked();
  });

  it("applies the mode switch at once with no save step", async () => {
    render(<AccessibilityControls scope="account" />);

    await userEvent.setup().click(screen.getByRole("switch", { name: copy.mode.label }));

    expect(state.update).toHaveBeenCalledWith({ mode: true });
    expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
  });

  it("applies a preference choice at once", async () => {
    render(<AccessibilityControls scope="account" />);
    const transparency = screen.getByRole("radiogroup", { name: copy.transparency.label });

    await userEvent.setup().click(within(transparency).getByRole("radio", { name: copy.choices.off }));

    expect(state.update).toHaveBeenCalledWith({ transparency: "off" });
  });

  it("turns the single-key shortcuts off at once", async () => {
    render(<AccessibilityControls scope="account" />);

    await userEvent.setup().click(screen.getByRole("switch", { name: copy.shortcuts.label }));

    expect(state.update).toHaveBeenCalledWith({ singleKeyShortcuts: false });
  });

  it("applies a notification duration at once", async () => {
    const user = userEvent.setup();
    render(<AccessibilityControls scope="account" />);

    await user.click(screen.getByRole("button", { name: new RegExp(copy.toastDuration.label) }));
    await user.click(await screen.findByRole("menuitemradio", { name: copy.toastDuration.options.sticky }));

    expect(state.update).toHaveBeenCalledWith({ toastDuration: "sticky" });
  });
});

describe("AccessibilityControls for a guest", () => {
  it("leaves out the controls a guest cannot keep", () => {
    render(<AccessibilityControls scope="guest" />);

    expect(screen.getByRole("switch", { name: copy.mode.label })).toBeInTheDocument();
    expect(screen.getAllByRole("radiogroup")).toHaveLength(3);
    expect(screen.queryByRole("switch", { name: copy.shortcuts.label })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: new RegExp(copy.toastDuration.label) })).not.toBeInTheDocument();
  });
});
