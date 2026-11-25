import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";
import { createPlayerActions, createPlayerView } from "@test/factories";
import enPlayer from "@modules/i18n/messages/en/player.json";

import { LYRIC_RESUME_DELAY_MS } from "../constants";
import { PlayerLyrics } from "../PlayerLyrics";
import type { PlayerView } from "../types";

const LINE_HEIGHT_PX = 100;
const scrollTops = new WeakMap<HTMLElement, number>();
const lyrics: PlayerView["lyrics"] = {
  synced: true,
  lines: [0, 5, 10, 15, 20, 25].map((second) => ({ start: second * 1000, value: `Line at ${second}` })),
};

function stubLayout(): void {
  Object.defineProperty(HTMLElement.prototype, "offsetTop", {
    configurable: true,
    get(this: HTMLElement) {
      const parent = this.parentElement;
      return parent === null ? 0 : Array.prototype.indexOf.call(parent.children, this) * LINE_HEIGHT_PX;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "scrollTop", {
    configurable: true,
    get(this: HTMLElement) {
      return scrollTops.get(this) ?? 0;
    },
    set(this: HTMLElement, value: number) {
      scrollTops.set(this, value);
    },
  });
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

function scroller(): HTMLElement {
  const line = screen.getByRole("button", { name: "Line at 0" });
  const container = line.parentElement?.parentElement;
  if (!(container instanceof HTMLElement)) throw new Error("no lyric scroller");
  return container;
}

function renderAt(positionSeconds: number, autoScroll: boolean) {
  const actions = createPlayerActions();
  const result = render(
    <PlayerLyrics
      view={createPlayerView({ lyrics, lyricsOpen: true, positionSeconds })}
      actions={actions}
      column={{ autoScroll }}
    />
  );
  const moveTo = (seconds: number, follow = autoScroll) =>
    result.rerender(
      <PlayerLyrics
        view={createPlayerView({ lyrics, lyricsOpen: true, positionSeconds: seconds })}
        actions={actions}
        column={{ autoScroll: follow }}
      />
    );
  return { ...result, moveTo };
}

beforeEach(stubLayout);

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, "offsetTop");
  Reflect.deleteProperty(HTMLElement.prototype, "scrollTop");
});

describe("lyric auto-scroll on the desktop stage", () => {
  it("follows the song from line to line while auto-scroll is on", () => {
    const { moveTo } = renderAt(1, true);
    const before = scroller().scrollTop;

    moveTo(21);

    expect(scroller().scrollTop).toBe(before + 4 * LINE_HEIGHT_PX);
  });

  it("places the lyrics on the current line once and then stays put while auto-scroll is off", () => {
    const { moveTo } = renderAt(11, false);
    const placed = scroller().scrollTop;

    moveTo(26);

    expect(placed).toBe(renderedTarget(2));
    expect(scroller().scrollTop).toBe(placed);
  });

  it("goes back to the current line when auto-scroll is turned back on", () => {
    const { moveTo } = renderAt(11, false);
    moveTo(26);
    fireEvent.wheel(scroller());
    const stayed = scroller().scrollTop;

    moveTo(26, true);

    expect(stayed).toBe(renderedTarget(2));
    expect(scroller().scrollTop).toBe(renderedTarget(5));
  });

  it("yields to a reader who scrolls and holds still while the song moves on", () => {
    const { moveTo } = renderAt(1, true);
    fireEvent.wheel(scroller());
    const held = scroller().scrollTop;

    moveTo(21);

    expect(scroller().scrollTop).toBe(held);
    expect(screen.getByRole("button", { name: enPlayer.lyrics.backToLine })).toBeInTheDocument();
  });

  it("yields to a reader when the lyrics arrived after the column opened", () => {
    const actions = createPlayerActions();
    const at = (positionSeconds: number, loaded: boolean) => (
      <PlayerLyrics
        view={createPlayerView({
          lyrics: loaded ? lyrics : null,
          lyricsLoading: !loaded,
          lyricsOpen: true,
          positionSeconds,
        })}
        actions={actions}
        column={{ autoScroll: true }}
      />
    );
    const { rerender } = render(at(1, false));
    rerender(at(1, true));
    fireEvent.wheel(scroller());
    const held = scroller().scrollTop;

    rerender(at(21, true));

    expect(scroller().scrollTop).toBe(held);
    expect(screen.getByRole("button", { name: enPlayer.lyrics.backToLine })).toBeInTheDocument();
  });

  it("offers the back button only once the reader has scrolled the current line out of view", () => {
    const frame = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 100, 100));
    try {
      renderAt(1, true);
      fireEvent.wheel(scroller());
      expect(screen.queryByRole("button", { name: enPlayer.lyrics.backToLine })).not.toBeInTheDocument();

      frame.mockImplementation(function (this: HTMLElement) {
        return this.tagName === "BUTTON" ? new DOMRect(0, 500, 100, 100) : new DOMRect(0, 0, 100, 100);
      });
      fireEvent.scroll(scroller());

      expect(screen.getByRole("button", { name: enPlayer.lyrics.backToLine })).toBeInTheDocument();
    } finally {
      vi.restoreAllMocks();
    }
  });

  it("goes back to the current line from the back button and hides it", () => {
    const { moveTo } = renderAt(1, true);
    fireEvent.wheel(scroller());
    moveTo(21);

    fireEvent.click(screen.getByRole("button", { name: enPlayer.lyrics.backToLine }));

    expect(scroller().scrollTop).toBe(renderedTarget(4));
    expect(screen.queryByRole("button", { name: enPlayer.lyrics.backToLine })).not.toBeInTheDocument();
  });

  it("holds through the resume delay, then picks the song back up once the reader settles with the line in view", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 100, 100));
    try {
      const { moveTo } = renderAt(1, true);
      fireEvent.wheel(scroller());
      moveTo(11);
      const held = scroller().scrollTop;
      vi.setSystemTime(Date.now() + LYRIC_RESUME_DELAY_MS + 1);

      moveTo(21);

      expect(held).toBe(renderedTarget(0));
      expect(scroller().scrollTop).toBe(renderedTarget(4));
      expect(screen.queryByRole("button", { name: enPlayer.lyrics.backToLine })).not.toBeInTheDocument();
    } finally {
      vi.restoreAllMocks();
      vi.useRealTimers();
    }
  });

  it("offers no auto-scroll switch of its own, the stage header carries it", () => {
    renderAt(1, false);

    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("marks the line being sung for assistive technology", () => {
    renderAt(6, true);

    expect(screen.getByRole("button", { name: "Line at 5" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "Line at 0" })).not.toHaveAttribute("aria-current");
  });
});

function renderedTarget(lineIndex: number): number {
  return lineIndex * LINE_HEIGHT_PX;
}
