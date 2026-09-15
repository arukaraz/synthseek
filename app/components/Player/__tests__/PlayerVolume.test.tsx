import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { createPlayerActions, createPlayerView } from "@test/factories";
import enPlayer from "@modules/i18n/messages/en/player.json";

import { VOLUME_STEP } from "../constants";
import { PlayerVolume } from "../PlayerVolume";
import type { PlayerView } from "../types";

function renderVolume(overrides: Partial<PlayerView> = {}) {
  const actions = createPlayerActions();
  const view = createPlayerView(overrides);
  render(<PlayerVolume view={view} actions={actions} size="bar" />);
  return { actions, slider: screen.getByRole("slider", { name: enPlayer.controls.volume }), user: userEvent.setup() };
}

describe("the volume slider", () => {
  it("reports the level as a percentage", () => {
    const { slider } = renderVolume({ volume: 0.65 });

    expect(slider).toHaveAttribute("aria-valuenow", "65");
    expect(slider).toHaveAttribute("aria-valuetext", "65%");
  });

  it("reports nothing coming out while the player is muted, whatever the level is set to", () => {
    const { slider } = renderVolume({ volume: 0.65, muted: true });

    expect(slider).toHaveAttribute("aria-valuenow", "0");
  });

  it("offers to mute while sound is coming out", async () => {
    const { actions, user } = renderVolume();

    await user.click(screen.getByRole("button", { name: enPlayer.controls.mute }));

    expect(actions.toggleMute).toHaveBeenCalled();
  });

  it("offers to unmute once it is muted", () => {
    renderVolume({ muted: true });

    expect(screen.getByRole("button", { name: enPlayer.controls.unmute })).toBeInTheDocument();
  });
});

describe("setting the volume from the keyboard", () => {
  it("steps up and down with the arrows", () => {
    const { actions, slider } = renderVolume({ volume: 0.5 });

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(actions.setVolume).toHaveBeenCalledWith(0.5 + VOLUME_STEP);

    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(actions.setVolume).toHaveBeenCalledWith(0.5 - VOLUME_STEP);
  });

  it("steps from zero while muted rather than from the level behind the mute", () => {
    const { actions, slider } = renderVolume({ volume: 0.5, muted: true });

    fireEvent.keyDown(slider, { key: "ArrowRight" });

    expect(actions.setVolume).toHaveBeenCalledWith(VOLUME_STEP);
  });

  it("steps with page up and page down too", () => {
    const { actions, slider } = renderVolume({ volume: 0.5 });

    fireEvent.keyDown(slider, { key: "PageUp" });
    expect(actions.setVolume).toHaveBeenCalledWith(0.5 + VOLUME_STEP);

    fireEvent.keyDown(slider, { key: "PageDown" });
    expect(actions.setVolume).toHaveBeenCalledWith(0.5 - VOLUME_STEP);
  });

  it("goes silent and goes full with home and end", () => {
    const { actions, slider } = renderVolume({ volume: 0.5 });

    fireEvent.keyDown(slider, { key: "Home" });
    expect(actions.setVolume).toHaveBeenCalledWith(0);

    fireEvent.keyDown(slider, { key: "End" });
    expect(actions.setVolume).toHaveBeenCalledWith(1);
  });

  it("ignores a key the slider has no meaning for", () => {
    const { actions, slider } = renderVolume();

    fireEvent.keyDown(slider, { key: "a" });

    expect(actions.setVolume).not.toHaveBeenCalled();
  });
});

describe("dragging the volume slider", () => {
  it("sets the level the pointer landed on", () => {
    const { actions, slider } = renderVolume();
    slider.getBoundingClientRect = () => new DOMRect(0, 0, 100, 8);
    slider.setPointerCapture = vi.fn();

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 40 });

    expect(actions.setVolume).toHaveBeenCalledWith(0.4);
  });

  it("follows a pointer that is being dragged", () => {
    const { actions, slider } = renderVolume();
    slider.getBoundingClientRect = () => new DOMRect(0, 0, 100, 8);
    slider.setPointerCapture = vi.fn();
    slider.hasPointerCapture = () => true;

    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 70 });

    expect(actions.setVolume).toHaveBeenCalledWith(0.7);
  });

  it("ignores a pointer merely passing over the slider", () => {
    const { actions, slider } = renderVolume();
    slider.getBoundingClientRect = () => new DOMRect(0, 0, 100, 8);
    slider.hasPointerCapture = () => false;

    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 70 });

    expect(actions.setVolume).not.toHaveBeenCalled();
  });

  it("lets the pointer go when the drag ends", () => {
    const { slider } = renderVolume();
    const release = vi.fn();
    slider.releasePointerCapture = release;

    fireEvent.pointerUp(slider, { pointerId: 1 });

    expect(release).toHaveBeenCalledWith(1);
  });
});
