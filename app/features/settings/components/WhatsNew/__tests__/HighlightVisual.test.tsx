import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const reducedMotion = vi.hoisted(() => ({ value: false }));

vi.mock("@hooks/ui/useMediaQuery", () => ({ useMediaQuery: () => reducedMotion.value }));

import { HighlightVisual } from "../HighlightVisual";
import type { WhatsNewMedia } from "../types";

const MEDIA_PATH = "/api/v1/whats-new/media/3.0.0";
const VIDEO: WhatsNewMedia = { type: "video", file: "stage.mp4", alt: "The Stage player", poster: "stage.webp" };

function videoElement(container: HTMLElement): HTMLVideoElement {
  const video = container.querySelector("video");
  if (!video) throw new Error("no video rendered");
  return video;
}

afterEach(() => {
  cleanup();
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
    expect(video.controls).toBe(false);
    expect(video).toHaveAttribute("preload", "metadata");
  });

  it("holds a video on its poster with a play control under reduced motion", () => {
    reducedMotion.value = true;
    const { container } = render(<HighlightVisual media={VIDEO} mediaPath={MEDIA_PATH} />);
    const video = videoElement(container);

    expect(video.autoplay).toBe(false);
    expect(video.controls).toBe(true);
  });

  it("falls back to the placeholder when the media cannot load", () => {
    const { container } = render(<HighlightVisual media={VIDEO} mediaPath={MEDIA_PATH} />);

    fireEvent.error(videoElement(container));

    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
