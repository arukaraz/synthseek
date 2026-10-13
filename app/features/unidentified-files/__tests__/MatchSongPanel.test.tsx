import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";
import { createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

import type { SongCandidate, UnidentifiedFile, UnidentifiedGroup } from "../types";

const state = vi.hoisted(() => ({ assign: vi.fn(), ignore: vi.fn(), resolve: vi.fn() }));

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

import { MatchSongPanel } from "../components/MatchSongPanel";

const FILE: UnidentifiedFile = {
  id: "him",
  fileName: "19-him-pretending_(kevin_shirley_mix).flac",
  relativePath: "HIM/19-him-pretending_(kevin_shirley_mix).flac",
  title: "Pretending (Kevin Shirley Mix)",
  artist: "HIM",
  durationSeconds: 242,
  format: "flac",
  retrying: false,
};

const GROUP: UnidentifiedGroup = {
  key: "him",
  folder: "HIM",
  album: "Deep Shadows And Brilliant Highlights",
  artist: "HIM",
  discCount: 1,
  fileCount: 7,
  retrying: 0,
  ignoredAt: null,
  suggestedAlbumId: null,
  files: [FILE],
};

function song(overrides: Partial<SongCandidate>): SongCandidate {
  return {
    trackId: "t",
    title: "Pretending",
    artist: "HIM",
    albumId: "a",
    albumName: "In Joy And Sorrow / Pretending",
    durationSeconds: 222,
    image: null,
    verdict: "different_version",
    ...overrides,
  };
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("MatchSongPanel", () => {
  it("picks the same song on its own and adds it", () => {
    songsQuery = createMockQuery({ candidates: [song({ trackId: "same", verdict: "same", title: FILE.title })] });

    render(<MatchSongPanel group={GROUP} file={FILE} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Add to the library" }));

    expect(state.assign).toHaveBeenCalledWith({ pairs: [{ fileId: "him", trackId: "same" }] }, expect.anything());
  });

  it("does not pick a different version for anyone", () => {
    songsQuery = createMockQuery({ candidates: [song({})] });

    render(<MatchSongPanel group={GROUP} file={FILE} onBack={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Add to the library" })).toBeDisabled();
  });

  it("warns before filing a different version as this file", () => {
    songsQuery = createMockQuery({ candidates: [song({})] });

    render(<MatchSongPanel group={GROUP} file={FILE} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /different version/ }));

    expect(screen.getByText(/If you add it, it will show up as “Pretending”/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add anyway" })).toBeEnabled();
  });

  it("ignores the file from the same place", () => {
    songsQuery = createMockQuery({ candidates: [] });

    render(<MatchSongPanel group={GROUP} file={FILE} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Ignore" }));

    expect(screen.getByText(/We couldn’t find this song/)).toBeInTheDocument();
    expect(state.ignore).toHaveBeenCalledWith({ fileIds: ["him"] }, expect.anything());
  });
});
