import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const player = vi.hoisted(() => {
  const listeners = new Set<() => void>();
  const state: { playing: boolean; volume: number; muted: boolean; remote: object | null } = {
    playing: false,
    volume: 0.8,
    muted: false,
    remote: null,
  };
  return {
    state,
    listeners,
    pauseHere: vi.fn(),
    resumeHere: vi.fn(),
    set(playing: boolean): void {
      state.playing = playing;
      listeners.forEach((listener) => listener());
    },
  };
});

vi.mock("@hooks/ui/player", () => ({
  playerActions: { pauseHere: player.pauseHere, resumeHere: player.resumeHere },
  playerSnapshot: () => player.state,
  subscribePlayer: (listener: () => void) => {
    player.listeners.add(listener);
    return () => player.listeners.delete(listener);
  },
}));

import { FakeAudio } from "@test/mocks/audio.mock";

import { catalogPreviewClip, fileAuditionClip } from "../helpers";
import { getSnapshot, previewClock, resetTrackPreview, seekPreview, stopPreview, togglePreview } from "../store";

const ONE = catalogPreviewClip("3135556", "One More Time");
const TWO = catalogPreviewClip("912486", "Aerodynamic");

function element(): FakeAudio {
  return FakeAudio.only();
}

function pressEscape(): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true, bubbles: true });
  document.body.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  FakeAudio.reset();
  player.state.playing = false;
  player.state.volume = 0.8;
  player.state.muted = false;
  player.state.remote = null;
  player.listeners.clear();
  player.pauseHere.mockReset();
  player.resumeHere.mockReset();
  vi.stubGlobal("Audio", FakeAudio);
});

afterEach(() => {
  resetTrackPreview();
  vi.unstubAllGlobals();
});

describe("the preview clips", () => {
  it("point a catalog track at the server's preview route, never at the provider", () => {
    expect(catalogPreviewClip("a/b", "Odd")).toMatchObject({
      key: "catalog:a/b",
      src: "/api/v1/catalog/tracks/a%2Fb/preview",
      fallbackSeconds: 30,
    });
  });

  it("point a file under review at its own audio", () => {
    expect(fileAuditionClip("f 1", "Loose", 242)).toMatchObject({
      key: "file:f 1",
      src: "/api/v1/library-copies/f%201/audio",
      fallbackSeconds: 242,
    });
  });
});

describe("the preview store", () => {
  it("creates no audio element until the first preview is asked for", () => {
    expect(FakeAudio.made).toHaveLength(0);

    togglePreview(ONE);

    expect(FakeAudio.made).toHaveLength(1);
    expect(element().src).toBe(ONE.src);
    expect(getSnapshot()).toMatchObject({ key: ONE.key, status: "loading" });
  });

  it("turns to playing only once sound actually starts", () => {
    togglePreview(ONE);
    element().emit("playing");

    expect(getSnapshot()).toMatchObject({ status: "playing", notice: { kind: "playing", title: "One More Time" } });
  });

  it("plays at the player's volume and stays silent when the player is muted", () => {
    player.state.volume = 0.35;
    player.state.muted = true;

    togglePreview(ONE);

    expect(element().volume).toBe(0.35);
    expect(element().muted).toBe(true);
  });

  it("leaves playback with another device that took it over while the preview sounded", () => {
    player.state.playing = true;
    togglePreview(ONE);
    player.set(false);
    element().emit("playing");

    player.state.remote = {};
    player.listeners.forEach((listener) => listener());
    element().emit("ended");

    expect(getSnapshot()).toMatchObject({ key: null, notice: { kind: "ended", resumesPlayer: false } });
    expect(player.resumeHere).not.toHaveBeenCalled();
  });

  it("follows the player's volume and mute while it sounds", () => {
    togglePreview(ONE);
    element().emit("playing");

    player.state.volume = 0.2;
    player.state.muted = true;
    player.listeners.forEach((listener) => listener());

    expect(element().volume).toBe(0.2);
    expect(element().muted).toBe(true);
    expect(getSnapshot()).toMatchObject({ key: ONE.key, status: "playing" });
  });

  it("stops and releases the audio when the same preview is pressed again", () => {
    togglePreview(ONE);
    element().emit("playing");
    togglePreview(ONE);

    expect(element().paused).toBe(true);
    expect(element().src).toBe("");
    expect(element().loads).toBe(1);
    expect(getSnapshot()).toMatchObject({ key: null, status: "idle", notice: { kind: "stopped" } });
  });

  it("keeps one sound at a time by reusing the single element for the next preview", () => {
    togglePreview(ONE);
    element().emit("playing");
    togglePreview(TWO);

    expect(FakeAudio.made).toHaveLength(1);
    expect(element().src).toBe(TWO.src);
    expect(getSnapshot()).toMatchObject({ key: TWO.key, status: "loading" });
  });

  it("pauses the player for the preview and hands it back when the preview ends", () => {
    player.state.playing = true;

    togglePreview(ONE);
    expect(player.pauseHere).toHaveBeenCalledTimes(1);

    player.set(false);
    element().emit("playing");
    element().emit("ended");

    expect(player.resumeHere).toHaveBeenCalledTimes(1);
    expect(getSnapshot().notice).toEqual({
      kind: "ended",
      subject: "preview",
      title: "One More Time",
      resumesPlayer: true,
    });
  });

  it("leaves a player that was not playing alone when the preview ends", () => {
    togglePreview(ONE);
    element().emit("ended");

    expect(player.pauseHere).not.toHaveBeenCalled();
    expect(player.resumeHere).not.toHaveBeenCalled();
  });

  it("does not hand the player back between two previews, only after the last one", () => {
    player.state.playing = true;
    togglePreview(ONE);
    player.set(false);

    togglePreview(TWO);
    expect(player.resumeHere).not.toHaveBeenCalled();

    stopPreview();
    expect(player.resumeHere).toHaveBeenCalledTimes(1);
  });

  it("ends the preview for good when the user starts the player, without resuming it twice", () => {
    player.state.playing = true;
    togglePreview(ONE);
    player.set(false);
    element().emit("playing");

    player.set(true);

    expect(getSnapshot()).toMatchObject({ key: null, notice: { kind: "interrupted", resumesPlayer: false } });
    expect(element().paused).toBe(true);
    expect(player.resumeHere).not.toHaveBeenCalled();
  });

  it("is not ended by the player still reporting itself playing right after being paused for it", () => {
    player.state.playing = true;
    togglePreview(ONE);

    player.listeners.forEach((listener) => listener());

    expect(getSnapshot()).toMatchObject({ key: ONE.key, status: "loading" });
  });

  it("marks a preview that fails to load, hands the player back, and refuses to try it again", () => {
    player.state.playing = true;
    togglePreview(ONE);
    player.set(false);
    element().emit("error");

    expect(getSnapshot().failed.has(ONE.key)).toBe(true);
    expect(getSnapshot().notice).toMatchObject({ kind: "failed", resumesPlayer: true });
    expect(player.resumeHere).toHaveBeenCalledTimes(1);

    togglePreview(ONE);
    expect(getSnapshot()).toMatchObject({ key: null, status: "idle" });
  });

  it("marks a preview the browser refuses to start as failed", async () => {
    FakeAudio.refusal = new DOMException("blocked", "NotAllowedError");

    togglePreview(ONE);
    await Promise.resolve();
    await Promise.resolve();

    expect(getSnapshot().failed.has(ONE.key)).toBe(true);
  });

  it("does not count a start that was cut short by the next preview as a failure", async () => {
    FakeAudio.refusal = new DOMException("interrupted", "AbortError");

    togglePreview(ONE);
    await Promise.resolve();
    await Promise.resolve();

    expect(getSnapshot().failed.size).toBe(0);
    expect(getSnapshot()).toMatchObject({ key: ONE.key, status: "loading" });
  });

  it("stops on Escape and keeps the key from whatever is behind it, then lets the next Escape through", () => {
    const behind = vi.fn();
    document.addEventListener("keydown", behind);
    togglePreview(ONE);

    const first = pressEscape();
    expect(getSnapshot().key).toBeNull();
    expect(first.defaultPrevented).toBe(true);
    expect(behind).not.toHaveBeenCalled();

    const second = pressEscape();
    expect(second.defaultPrevented).toBe(false);
    expect(behind).toHaveBeenCalledTimes(1);
    document.removeEventListener("keydown", behind);
  });

  it("only stops the preview it is asked about", () => {
    togglePreview(ONE);

    stopPreview(TWO.key);
    expect(getSnapshot().key).toBe(ONE.key);

    stopPreview(ONE.key);
    expect(getSnapshot().key).toBeNull();
  });

  it("reads the clock from the audio, in whole seconds, and uses the clip length until the audio knows its own", () => {
    togglePreview(ONE);
    element().currentTime = 12;

    expect(previewClock(ONE.key)).toEqual({ elapsedSeconds: 12, totalSeconds: 30 });

    element().duration = 44.97;
    expect(previewClock(ONE.key)).toEqual({ elapsedSeconds: 12, totalSeconds: 45 });
    expect(previewClock(TWO.key)).toBeNull();
  });

  it("seeks only the clip that is sounding", () => {
    togglePreview(ONE);

    seekPreview(TWO.key, 20);
    expect(element().currentTime).toBe(0);

    seekPreview(ONE.key, 20);
    expect(element().currentTime).toBe(20);
  });
});
