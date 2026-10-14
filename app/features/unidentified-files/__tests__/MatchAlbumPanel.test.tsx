import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";
import { createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

import type { AlbumCandidate, AlbumProposal, UnidentifiedGroup } from "../types";

const state = vi.hoisted(() => ({
  assign: vi.fn(),
  ignore: vi.fn(),
  resolve: vi.fn(),
  lastProposalInput: null as unknown,
}));

let candidatesQuery: MockQueryResult<{ candidates: AlbumCandidate[] } | undefined>;
let proposalQuery: MockQueryResult<AlbumProposal | undefined>;

vi.mock("@hooks/api/queries/useUnidentifiedFiles", () => ({
  useUnidentifiedAlbumCandidates: () => candidatesQuery,
  useUnidentifiedAlbumProposal: (input: unknown) => {
    state.lastProposalInput = input;
    return proposalQuery;
  },
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

import { MatchAlbumPanel } from "../components/MatchAlbumPanel";

const GROUP: UnidentifiedGroup = {
  key: "tove",
  folder: "Tove Lo",
  album: "Estrus",
  artist: "Tove Lo",
  discCount: 1,
  fileCount: 2,
  retrying: 0,
  ignoredAt: null,
  files: [],
};

const ESTRUS: AlbumCandidate = {
  id: "975330931",
  name: "ESTRUS",
  artist: "Tove Lo",
  year: "2026",
  label: "Tove Lo",
  trackCount: 13,
  image: null,
  matched: 2,
  total: 2,
  suggested: false,
};

function proposalFile(id: string, fileName: string, title: string, proposedTrackId: string | null) {
  return {
    id,
    fileName,
    relativePath: `Tove Lo/${fileName}`,
    title,
    artist: "Tove Lo",
    durationSeconds: 138,
    format: "flac",
    retrying: false,
    proposedTrackId,
    verdicts: { t7: proposedTrackId === "t7" ? ("same" as const) : ("different_song" as const) },
  };
}

function proposalWith(files: AlbumProposal["files"]): AlbumProposal {
  return {
    album: {
      id: ESTRUS.id,
      name: "ESTRUS",
      artist: "Tove Lo",
      year: "2026",
      label: "Tove Lo",
      trackCount: 13,
      image: null,
    },
    tracks: [{ id: "t7", number: 7, disc: 1, title: "I’m the cake", durationSeconds: 138 }],
    files,
  };
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("MatchAlbumPanel", () => {
  it("adds every file the album pairs, in one step", () => {
    candidatesQuery = createMockQuery({ candidates: [ESTRUS] });
    proposalQuery = createMockQuery(proposalWith([proposalFile("f7", "07-im_the_cake.flac", "I'm The Cake", "t7")]));

    render(<MatchAlbumPanel group={GROUP} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Add 1 file to the library" }));

    expect(state.assign).toHaveBeenCalledWith(
      { pairs: [{ fileId: "f7", trackId: "t7" }], ignoreFileIds: [] },
      expect.anything()
    );
  });

  it("offers to ignore leftovers only when some file did not match", () => {
    candidatesQuery = createMockQuery({ candidates: [ESTRUS] });
    proposalQuery = createMockQuery(proposalWith([proposalFile("f7", "07-im_the_cake.flac", "I'm The Cake", "t7")]));

    render(<MatchAlbumPanel group={GROUP} onBack={vi.fn()} />);

    expect(screen.queryByText(/didn’t match/)).not.toBeInTheDocument();
  });

  it("leaves a file for later when someone takes its song away", () => {
    candidatesQuery = createMockQuery({ candidates: [ESTRUS] });
    proposalQuery = createMockQuery(proposalWith([proposalFile("f7", "07-im_the_cake.flac", "I'm The Cake", "t7")]));

    render(<MatchAlbumPanel group={GROUP} onBack={vi.fn()} />);
    fireEvent.change(screen.getByRole("combobox", { name: /Song for/ }), { target: { value: "" } });

    expect(screen.getByRole("button", { name: "Ignore 1 file" })).toBeDisabled();
    expect(screen.getByText("Ignore the 1 file that didn’t match")).toBeInTheDocument();
  });

  it("explains that a file holding another song's number comes from another edition", () => {
    candidatesQuery = createMockQuery({ candidates: [{ ...ESTRUS, matched: 0 }] });
    proposalQuery = createMockQuery(proposalWith([proposalFile("f", "7-panic_room.flac", "Panic Room", null)]));

    render(<MatchAlbumPanel group={GROUP} onBack={vi.fn()} />);

    expect(screen.getByText(/Your files seem to come from a different edition/)).toBeInTheDocument();
  });

  it("offers to ignore the whole release when no album is found", () => {
    candidatesQuery = createMockQuery({ candidates: [] });
    proposalQuery = createMockQuery<AlbumProposal | undefined>(undefined);

    render(<MatchAlbumPanel group={GROUP} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Ignore 2 files" }));

    expect(screen.getByText(/We couldn’t find/)).toBeInTheDocument();
    expect(state.ignore).toHaveBeenCalled();
  });

  it("marks the album other files from the folder are on", () => {
    candidatesQuery = createMockQuery({ candidates: [{ ...ESTRUS, suggested: true }] });
    proposalQuery = createMockQuery(proposalWith([]));

    render(<MatchAlbumPanel group={GROUP} onBack={vi.fn()} />);

    expect(screen.getByText("Other files from this folder are on this album")).toBeInTheDocument();
  });

  it("opens on the first album offered, the one the files fit best", () => {
    const single = { ...ESTRUS, id: "cat-single", name: "des fleurs x stromae", matched: 0, suggested: true };
    candidatesQuery = createMockQuery({ candidates: [ESTRUS, single] });
    proposalQuery = createMockQuery(proposalWith([]));

    render(<MatchAlbumPanel group={GROUP} onBack={vi.fn()} />);

    expect(state.lastProposalInput).toEqual(expect.objectContaining({ albumId: ESTRUS.id }));
  });
});
