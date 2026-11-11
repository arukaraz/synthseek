import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";
import { FakeAudio } from "@test/mocks/audio.mock";
import { createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

import type { SongCandidate, UnidentifiedFile, UnidentifiedGroup } from "../types";

const state = vi.hoisted(() => ({ assign: vi.fn(), ignore: vi.fn(), resolve: vi.fn(), pausedAtAssign: false }));

let songsQuery: MockQueryResult<{ candidates: SongCandidate[] } | undefined>;

vi.mock("@hooks/api/queries/useUnidentifiedFiles", () => ({
  useUnidentifiedSongCandidates: () => songsQuery,
}));
vi.mock("@hooks/api/mutations/library/useUnidentifiedActions", () => ({
  useAssignUnidentified: () => ({ mutate: state.assign, isPending: false }),
  useIgnoreUnidentified: () => ({ mutate: state.ignore, isPending: false }),
  useResolveUnidentifiedLink: () => ({ mutate: state.resolve, isPending: false }),
}));
vi.mock("@components/ui/Dialog", () => ({
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));
vi.mock("@hooks/ui/player", () => ({
  playerActions: { pauseHere: vi.fn(), resumeHere: vi.fn() },
  playerSnapshot: () => ({ playing: false, volume: 1, muted: false }),
  subscribePlayer: () => () => undefined,
}));

import { resetTrackPreview } from "@hooks/ui/trackPreview/store";

import { MatchSongPanel } from "../components/MatchSongPanel";

const FILE: UnidentifiedFile = {
  id: "him",
  fileName: "19-him-pretending.flac",
  relativePath: "HIM/19-him-pretending.flac",
  title: "Pretending",
  artist: "HIM",
  durationSeconds: 242,
  format: "flac",
  retrying: false,
};

const GROUP: UnidentifiedGroup = {
  key: "him",
  libraryPath: "Music",
  folder: "HIM",
  album: "Deep Shadows And Brilliant Highlights",
  artist: "HIM",
  discCount: 1,
  fileCount: 1,
  retrying: 0,
  ignoredAt: null,
  files: [FILE],
};

function song(overrides: Partial<SongCandidate>): SongCandidate {
  return {
    trackId: "same",
    title: "Pretending",
    artist: "HIM",
    albumId: "a",
    albumName: "Deep Shadows And Brilliant Highlights",
    durationSeconds: 242,
    image: null,
    hasPreview: true,
    verdict: "same",
    ...overrides,
  };
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

beforeEach(() => {
  FakeAudio.reset();
  vi.stubGlobal("Audio", FakeAudio);
  state.pausedAtAssign = false;
});

afterEach(() => {
  cleanup();
  resetTrackPreview();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("listening while matching a song", () => {
  it("previews a candidate without picking it", () => {
    songsQuery = createMockQuery({ candidates: [song({ trackId: "other", verdict: "different_version" })] });
    render(<MatchSongPanel group={GROUP} file={FILE} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Play the 30 second preview of Pretending" }));

    expect(FakeAudio.only().src).toBe("/api/v1/catalog/tracks/other/preview");
    expect(screen.getByRole("button", { name: "Add to the library" })).toBeDisabled();
  });

  it("locks the preview of a candidate the catalog has none for", () => {
    songsQuery = createMockQuery({ candidates: [song({ hasPreview: false })] });
    render(<MatchSongPanel group={GROUP} file={FILE} onBack={vi.fn()} />);

    expect(screen.getByRole("button", { name: "No preview available for Pretending" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it("plays the file under review from its own audio and lets the listener move through it", () => {
    songsQuery = createMockQuery({ candidates: [] });
    render(<MatchSongPanel group={GROUP} file={FILE} onBack={vi.fn()} />);
    const seek = screen.getByRole("slider", { name: "Position in the file Pretending" });
    expect(seek).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Play the file Pretending" }));
    act(() => FakeAudio.only().emit("playing"));

    expect(FakeAudio.only().src).toBe("/api/v1/library-copies/him/audio");
    expect(screen.getByText("0:00 / 4:02")).toBeInTheDocument();

    fireEvent.change(seek, { target: { value: "120" } });

    expect(FakeAudio.only().currentTime).toBe(120);
    expect(screen.getByText("2:00 / 4:02")).toBeInTheDocument();
  });

  it("takes turns: the candidate's preview replaces the file, on the one audio element", () => {
    songsQuery = createMockQuery({ candidates: [song({})] });
    render(<MatchSongPanel group={GROUP} file={FILE} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Play the file Pretending" }));
    fireEvent.click(screen.getByRole("button", { name: "Play the 30 second preview of Pretending" }));

    expect(FakeAudio.made).toHaveLength(1);
    expect(FakeAudio.only().src).toBe("/api/v1/catalog/tracks/same/preview");
    expect(screen.getByRole("button", { name: "Play the file Pretending" })).toBeInTheDocument();
  });

  it("lets go of the file's audio before the file is added to the library", () => {
    songsQuery = createMockQuery({ candidates: [song({})] });
    state.assign.mockImplementation(() => {
      state.pausedAtAssign = FakeAudio.only().paused && FakeAudio.only().src === "";
    });
    render(<MatchSongPanel group={GROUP} file={FILE} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Play the file Pretending" }));
    fireEvent.click(screen.getByRole("button", { name: "Add to the library" }));

    expect(state.assign).toHaveBeenCalledTimes(1);
    expect(state.pausedAtAssign).toBe(true);
  });
});
