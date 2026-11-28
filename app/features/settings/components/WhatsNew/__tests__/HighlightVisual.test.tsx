import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const reducedMotion = vi.hoisted(() => ({ value: false }));

vi.mock("@hooks/ui/useMotionReduced", () => ({ useMotionReduced: () => reducedMotion.value }));

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { GALLERY_INTERVAL_MS } from "../constants";
import { HighlightVisual } from "../HighlightVisual";
import type { WhatsNewMedia } from "../types";

const copy = enSettings.updates.whatsNew;
const play = vi.fn(() => Promise.resolve());
const pause = vi.fn();

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

beforeEach(() => {
  play.mockClear();
  pause.mockClear();
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(play);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pause);
});

const MEDIA_PATH = "/api/v1/whats-new/media/3.0.0";
const VIDEO: WhatsNewMedia = { type: "video", file: "stage.mp4", alt: "The Stage player", poster: "stage.webp" };

function videoElement(container: HTMLElement): HTMLVideoElement {
  const video = container.querySelector("video");
  if (!video) throw new Error("no video rendered");
  return video;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  reducedMotion.value = false;
});

describe("HighlightVisual", () => {
  it("draws the placeholder when the highlight has no media", () => {
    const { container } = render(<HighlightVisual media={undefined} mediaPath={MEDIA_PATH} />);

    expect(container.querySelector("img, video")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("draws the placeholder when the server gave no media path", () => {
    const { container } = render(<HighlightVisual media={VIDEO} mediaPath={null} />);

    expect(container.querySelector("img, video")).toBeNull();
  });

  it("shows an image with its alt text from the version's media path", () => {
    render(
      <HighlightVisual media={{ type: "image", file: "board.png", alt: "The new board" }} mediaPath={MEDIA_PATH} />
    );

    expect(screen.getByRole("img", { name: "The new board" })).toHaveAttribute(
      "src",
      expect.stringContaining(`${MEDIA_PATH}/board.png`)
    );
  });

  it("plays a video muted and in a loop, with its poster, when motion is allowed", () => {
    const { container } = render(<HighlightVisual media={VIDEO} mediaPath={MEDIA_PATH} />);
    const video = videoElement(container);

    expect(video).toHaveAttribute("src", `${MEDIA_PATH}/stage.mp4`);
    expect(video).toHaveAttribute("poster", `${MEDIA_PATH}/stage.webp`);
    expect(video).toHaveAttribute("aria-label", "The Stage player");
    expect(video.autoplay).toBe(true);
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video).toHaveAttribute("preload", "metadata");
  });

  it("holds a video on its poster with a play button under reduced motion", () => {
    reducedMotion.value = true;
    const { container } = render(<HighlightVisual media={VIDEO} mediaPath={MEDIA_PATH} />);
    const video = videoElement(container);

    expect(video.autoplay).toBe(false);
    expect(screen.getByRole("button", { name: copy.playVideo })).toBeInTheDocument();
  });

  it("pauses a playing video from its button and resumes it from the same button", () => {
    const { container } = render(<HighlightVisual media={VIDEO} mediaPath={MEDIA_PATH} />);
    const video = videoElement(container);
    fireEvent.play(video);
    Object.defineProperty(video, "paused", { configurable: true, value: false });

    fireEvent.click(screen.getByRole("button", { name: copy.pauseVideo }));

    expect(pause).toHaveBeenCalledTimes(1);
    fireEvent.pause(video);
    Object.defineProperty(video, "paused", { configurable: true, value: true });

    fireEvent.click(screen.getByRole("button", { name: copy.playVideo }));

    expect(play).toHaveBeenCalledTimes(1);
  });

  it("falls back to the placeholder when the media cannot load", () => {
    const { container } = render(<HighlightVisual media={VIDEO} mediaPath={MEDIA_PATH} />);

    fireEvent.error(videoElement(container));

    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });
});

describe("HighlightVisual gallery", () => {
  const GALLERY: WhatsNewMedia = {
    type: "gallery",
    slides: [
      { file: "artist.webp", alt: "The artist page", caption: "Artist pages" },
      { file: "request.webp", alt: "A request's detail", caption: "Requests" },
      { file: "settings.webp", alt: "The settings sidebar", caption: "Settings" },
    ],
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const shown = () => screen.getByRole("img");
  const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms));

  it("shows the first screenshot with its caption and hides the others from assistive technology", () => {
    render(<HighlightVisual media={GALLERY} mediaPath={MEDIA_PATH} />);

    expect(shown()).toHaveAccessibleName("The artist page");
    expect(shown()).toHaveAttribute("src", expect.stringContaining(`${MEDIA_PATH}/artist.webp`));
    expect(screen.getByText("Artist pages")).toBeInTheDocument();
    expect(screen.getAllByRole("img", { hidden: true })).toHaveLength(3);
  });

  it("moves to the next screenshot on its own and wraps after the last one", () => {
    render(<HighlightVisual media={GALLERY} mediaPath={MEDIA_PATH} />);

    wait(GALLERY_INTERVAL_MS);
    expect(shown()).toHaveAccessibleName("A request's detail");

    wait(GALLERY_INTERVAL_MS);
    expect(shown()).toHaveAccessibleName("The settings sidebar");

    wait(GALLERY_INTERVAL_MS);
    expect(shown()).toHaveAccessibleName("The artist page");
  });

  it("holds still under reduced motion until the reader presses play", () => {
    reducedMotion.value = true;
    render(<HighlightVisual media={GALLERY} mediaPath={MEDIA_PATH} />);

    wait(GALLERY_INTERVAL_MS * 3);
    expect(shown()).toHaveAccessibleName("The artist page");

    fireEvent.click(screen.getByRole("button", { name: copy.playSlides }));
    wait(GALLERY_INTERVAL_MS);
    expect(shown()).toHaveAccessibleName("A request's detail");
  });

  it("steps with the arrows, wrapping both ways, and stops moving on its own once the reader steps", () => {
    render(<HighlightVisual media={GALLERY} mediaPath={MEDIA_PATH} />);

    fireEvent.click(screen.getByRole("button", { name: copy.previousSlide }));
    expect(shown()).toHaveAccessibleName("The settings sidebar");

    fireEvent.click(screen.getByRole("button", { name: copy.nextSlide }));
    expect(shown()).toHaveAccessibleName("The artist page");

    wait(GALLERY_INTERVAL_MS * 3);
    expect(shown()).toHaveAccessibleName("The artist page");
    expect(screen.getByRole("button", { name: copy.playSlides })).toBeInTheDocument();
  });

  it("jumps to a screenshot from its dot and marks that dot current", () => {
    render(<HighlightVisual media={GALLERY} mediaPath={MEDIA_PATH} />);
    const third = screen.getByRole("button", { name: "Show screenshot 3 of 3" });

    fireEvent.click(third);

    expect(shown()).toHaveAccessibleName("The settings sidebar");
    expect(third).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("pauses from its button", () => {
    render(<HighlightVisual media={GALLERY} mediaPath={MEDIA_PATH} />);

    fireEvent.click(screen.getByRole("button", { name: copy.pauseSlides }));
    wait(GALLERY_INTERVAL_MS * 2);

    expect(shown()).toHaveAccessibleName("The artist page");
  });

  it("falls back to the placeholder when a screenshot cannot load", () => {
    const { container } = render(<HighlightVisual media={GALLERY} mediaPath={MEDIA_PATH} />);

    fireEvent.error(shown());

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
