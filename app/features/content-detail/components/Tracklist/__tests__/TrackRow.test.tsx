import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";
import type { TracklistTrack } from "../types";

import { TrackRow } from "../TrackRow";

function createTrack(overrides?: Partial<TracklistTrack>): TracklistTrack {
  return {
    externalId: "t1",
    title: "Get Lucky",
    artist: "Daft Punk",
    artistExternalId: "27",
    durationMs: 369000,
    trackNumber: 8,
    plays: null,
    album: null,
    inLibrary: false,
    requestId: null,
    slskd_request_id: null,
    status: null,
    failureReason: null,
    ...overrides,
  };
}

const noop = () => {};

describe("TrackRow selection", () => {
  it("renders no checkbox when not selectable", () => {
    renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "complete" })}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
      />
    );

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("renders a checkbox for a complete row when selectable", () => {
    renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "complete" })}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
        selectable
        isSelected={false}
        onSelectTrack={noop}
      />
    );

    expect(screen.getByRole("checkbox", { name: /Select Get Lucky/i })).toBeInTheDocument();
  });

  it("renders a checkbox for a failed row when selectable", () => {
    renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "failed" })}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
        selectable
        isSelected={false}
        onSelectTrack={noop}
      />
    );

    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("renders no checkbox for an in-flight row even when selectable", () => {
    renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "downloading" })}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
        selectable
        isSelected={false}
        onSelectTrack={noop}
      />
    );

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("reports a plain click as a non-extending selection", async () => {
    const onSelectTrack = vi.fn();
    const { user } = renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "complete" })}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
        selectable
        isSelected={false}
        onSelectTrack={onSelectTrack}
      />
    );

    await user.click(screen.getByRole("checkbox"));

    expect(onSelectTrack).toHaveBeenCalledTimes(1);
    expect(onSelectTrack).toHaveBeenCalledWith(false);
  });

  it("reports a shift click as an extending selection", async () => {
    const onSelectTrack = vi.fn();
    const { user } = renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "complete" })}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
        selectable
        isSelected={false}
        onSelectTrack={onSelectTrack}
      />
    );

    await user.keyboard("{Shift>}");
    await user.click(screen.getByRole("checkbox"));
    await user.keyboard("{/Shift}");

    expect(onSelectTrack).toHaveBeenCalledWith(true);
  });

  it("marks the row and the checkbox with the pending range tone", () => {
    const { container } = renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "complete" })}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
        selectable
        isSelected={false}
        onSelectTrack={noop}
        previewTone="clear"
      />
    );

    expect(container.querySelector("li")).toHaveAttribute("data-range-preview", "clear");
    expect(screen.getByRole("checkbox").className).toContain("ring-fg/40");
  });
});

describe("TrackRow status", () => {
  it("keeps a cancelled track's status in view beside Retry, and names the status on hover", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "cancelled" })}
        showArtist
        onRequest={noop}
        onRetry={onRetry}
        isRetrying={false}
      />
    );

    await user.click(screen.getByRole("button", { name: "Retry Get Lucky" }));
    expect(onRetry).toHaveBeenCalledTimes(1);

    const trigger = screen.getByText("Cancelled").closest("[data-state]");
    if (!(trigger instanceof HTMLElement)) throw new Error("expected the status to be a tooltip trigger");
    await user.hover(trigger);

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Cancelled");
  });
});

describe("TrackRow artist", () => {
  it("opens the artist from the name under the title when the list can navigate", async () => {
    const onArtistNavigate = vi.fn();
    const { user } = renderWithProviders(
      <TrackRow
        track={createTrack()}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
        onArtistNavigate={onArtistNavigate}
      />
    );

    await user.click(screen.getByRole("button", { name: "View artist Daft Punk" }));

    expect(onArtistNavigate).toHaveBeenCalledTimes(1);
  });

  it("keeps the name as plain text when there is nowhere to go", () => {
    renderWithProviders(
      <TrackRow track={createTrack()} showArtist onRequest={noop} onRetry={noop} isRetrying={false} />
    );

    expect(screen.queryByRole("button", { name: "View artist Daft Punk" })).not.toBeInTheDocument();
    expect(screen.getByText("Daft Punk")).toBeInTheDocument();
  });
});

describe("TrackRow queue actions", () => {
  function renderPlayable(queuePresence: "absent" | "upcoming" | "playing") {
    return renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "complete" })}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
        onPlayNow={async () => {}}
        onEnqueue={async () => true}
        onRemoveFromQueue={noop}
        queuePresence={queuePresence}
      />
    );
  }

  const queueControls = () =>
    screen.queryAllByRole("button").filter((button) => /queue/i.test(button.getAttribute("aria-label") ?? ""));

  it("has one queue control, which adds a track that is not queued", () => {
    renderPlayable("absent");

    expect(queueControls().map((button) => button.getAttribute("aria-label"))).toEqual(["Add Get Lucky to the queue"]);
  });

  it("turns that one control into removing the track once it is waiting in the queue", () => {
    renderPlayable("upcoming");

    expect(queueControls().map((button) => button.getAttribute("aria-label"))).toEqual([
      "Remove Get Lucky from the queue",
    ]);
  });

  it("shows the track that is playing instead of a queue control", () => {
    renderPlayable("playing");

    expect(queueControls()).toEqual([]);
    expect(screen.getByRole("img", { name: "Get Lucky is playing" })).toBeInTheDocument();
  });
});
