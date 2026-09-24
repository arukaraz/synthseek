import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RENDER_WINDOW_STEP } from "@hooks/ui/constants";
import type { PlayerQueueEntry, PlayerTrack, PlayerView } from "../types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("framer-motion", () => ({
  motion: { div: ({ children, ...rest }: { children?: React.ReactNode }) => <div {...rest}>{children}</div> },
  Reorder: {
    Group: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  },
}));

vi.mock("../QueueRow", () => ({
  QueueRow: ({ entry }: { entry: PlayerQueueEntry }) => <div data-testid="queue-row">{entry.track.id}</div>,
}));

class StubIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

import { QueueBody } from "../QueueBody";

function track(id: string): PlayerTrack {
  return {
    id,
    title: `Title ${id}`,
    artist: "Artist",
    album: "Album",
    durationSeconds: 100,
    format: "mp3",
    bitrateKbps: 320,
    lossless: false,
    tone: "primary",
    artworkUrl: null,
    albumId: "album-1",
    replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null },
  };
}

function viewWith(count: number): PlayerView {
  const upNext = Array.from({ length: count }, (_, index) => ({ index: index + 1, track: track(`t${index}`) }));
  return {
    queue: { playing: { index: 0, track: track("playing") }, upNext, autoplay: [] },
    queueEditable: true,
  } as unknown as PlayerView;
}

const actions = { reorderQueue: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("IntersectionObserver", StubIntersectionObserver);
});

describe("QueueBody", () => {
  it("renders only the first window of a long queue", () => {
    render(<QueueBody view={viewWith(RENDER_WINDOW_STEP + 30)} actions={actions as never} />);

    expect(screen.getAllByTestId("queue-row")).toHaveLength(RENDER_WINDOW_STEP + 1);
  });

  it("renders a short queue whole, with no sentinel to grow it", () => {
    render(<QueueBody view={viewWith(3)} actions={actions as never} />);

    expect(screen.getAllByTestId("queue-row")).toHaveLength(4);
  });

  it("lists what the radio added under its own caption, after the listener's picks", () => {
    const view = viewWith(1);
    const radio = {
      ...view,
      queue: {
        ...view.queue,
        autoplay: [
          { index: 2, track: track("r1") },
          { index: 3, track: track("r2") },
        ],
      },
    };

    render(<QueueBody view={radio} actions={actions as never} />);

    expect(screen.getByText("queue.autoplay")).toBeInTheDocument();
    expect(screen.getAllByTestId("queue-row").map((row) => row.textContent)).toEqual(["playing", "t0", "r1", "r2"]);
  });

  it("shows no autoplay caption while the radio has added nothing", () => {
    render(<QueueBody view={viewWith(1)} actions={actions as never} />);

    expect(screen.queryByText("queue.autoplay")).not.toBeInTheDocument();
  });

  it("says the queue is empty under its caption when nothing at all follows", () => {
    render(<QueueBody view={viewWith(0)} actions={actions as never} />);

    expect(screen.getByText("queue.upNext")).toBeInTheDocument();
    expect(screen.getByText("queue.empty")).toBeInTheDocument();
  });

  it("drops the empty notice and its caption while the radio tail is all that follows", () => {
    const view = viewWith(0);
    const radio = { ...view, queue: { ...view.queue, autoplay: [{ index: 1, track: track("r1") }] } };

    render(<QueueBody view={radio} actions={actions as never} />);

    expect(screen.queryByText("queue.upNext")).not.toBeInTheDocument();
    expect(screen.queryByText("queue.empty")).not.toBeInTheDocument();
    expect(screen.getByText("queue.autoplay")).toBeInTheDocument();
  });
});
