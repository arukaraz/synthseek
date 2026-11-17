import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery } from "@test/mocks/trpc.mock";

const IDLE_COUNT = {
  counting: false,
  ready: false,
  checked: 0,
  total: 0,
  missing: 0,
  anotherAlbum: 0,
  withoutCatalogArt: 0,
  unwritable: 0,
  unreadable: 0,
  finishedAt: null,
};

const IDLE_FILL = { running: false, total: 0, processed: 0, embedded: 0, kept: 0, failed: 0, finishedAt: null };

const state = vi.hoisted(() => ({
  count: undefined as unknown,
  fill: undefined as unknown,
  startCount: vi.fn(),
  startFill: vi.fn(),
}));

vi.mock("@hooks/api/queries/useCoverArt", () => ({
  useCoverArtCount: () => state.count,
  useCoverArtFillStatus: () => state.fill,
}));

vi.mock("@hooks/api/mutations/settings/useCoverArt", () => ({
  useStartCoverArtCount: () => ({ mutate: state.startCount, isPending: false }),
  useFillCoverArt: () => ({ mutate: state.startFill, isPending: false }),
}));

import { CoverArtCard } from "../CoverArtCard";

const copy = enSettings.coverArt;

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

beforeEach(() => {
  state.count = createMockQuery(IDLE_COUNT);
  state.fill = createMockQuery(IDLE_FILL);
  state.startCount = vi.fn();
  state.startFill = vi.fn();
});

afterEach(() => {
  cleanup();
});

describe("CoverArtCard", () => {
  it("offers only the check until the library has been read, since nothing is written before a count", async () => {
    const user = userEvent.setup();
    render(<CoverArtCard />);

    expect(screen.queryByRole("button", { name: copy.fill.action })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: copy.check.action }));

    expect(state.startCount).toHaveBeenCalledTimes(1);
  });

  it("says how far the reading is while it reads", () => {
    state.count = createMockQuery({ ...IDLE_COUNT, counting: true, checked: 120, total: 9586 });
    render(<CoverArtCard />);

    expect(screen.getByText("Reading your library... 120 of 9,586")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: copy.check.action })).not.toBeInTheDocument();
  });

  it("shows what it would write and what it leaves alone, and writes only after a yes", async () => {
    const user = userEvent.setup();
    state.count = createMockQuery({
      ...IDLE_COUNT,
      ready: true,
      checked: 9586,
      total: 9586,
      missing: 1420,
      anotherAlbum: 58,
      withoutCatalogArt: 3,
      unwritable: 37,
      finishedAt: "2026-11-17T07:00:00.000Z",
    });
    render(<CoverArtCard />);

    expect(screen.getByText("1,420")).toBeInTheDocument();
    expect(screen.getByText(copy.status.anotherAlbum.label)).toBeInTheDocument();
    expect(screen.getByText("58")).toBeInTheDocument();
    expect(screen.getByText(copy.status.unwritable.label)).toBeInTheDocument();
    expect(screen.getByText("37")).toBeInTheDocument();
    expect(screen.queryByText(copy.status.unreadable.label)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: copy.fill.action }));

    expect(state.startFill).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        "This writes the album cover inside 1,420 of your music files. A file that already carries a cover is not touched. A written cover cannot be taken back from the recycle bin."
      )
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: copy.fill.confirm }));

    expect(state.startFill.mock.calls).toEqual([[{ countedAt: "2026-11-17T07:00:00.000Z" }]]);
  });

  it("says the library could not be read when the check ended without a count", () => {
    state.count = createMockQuery({ ...IDLE_COUNT, finishedAt: "2026-11-17T07:00:00.000Z" });
    render(<CoverArtCard />);

    expect(screen.getByText(copy.status.loadError)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.check.action })).toBeInTheDocument();
  });

  it("has nothing to offer when no song is missing a cover it could give", () => {
    state.count = createMockQuery({ ...IDLE_COUNT, ready: true, checked: 10, total: 10, unwritable: 2 });
    render(<CoverArtCard />);

    expect(screen.getByText(copy.status.none)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: copy.fill.action })).not.toBeInTheDocument();
  });

  it("shows the writing as it goes, and takes the buttons away meanwhile", () => {
    state.fill = createMockQuery({ ...IDLE_FILL, running: true, total: 1420, processed: 12 });
    render(<CoverArtCard />);

    expect(screen.getByText("Writing covers... 12 of 1,420")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: copy.check.action })).not.toBeInTheDocument();
  });

  it("reports what the last run did once it is over", () => {
    state.fill = createMockQuery({
      ...IDLE_FILL,
      total: 1420,
      processed: 1420,
      embedded: 1400,
      kept: 15,
      failed: 5,
      finishedAt: "2026-11-16T20:00:00.000Z",
    });
    render(<CoverArtCard />);

    expect(
      screen.getByText("Last run: 1,400 covers written, 15 files left as they were, 5 could not be written.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.check.action })).toBeInTheDocument();
  });
});
