import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

type Copy = { id: string; relativePath: string; sizeBytes: number; fileFormat: string; serving: boolean };
type Group = {
  requestId: string;
  artist: string;
  title: string;
  totalBytes: number;
  reclaimableBytes: number;
  ambiguous: boolean;
  copies: Copy[];
};
type Groups = { groups: Group[]; totalBytes: number };

let groupsQuery: MockQueryResult<Groups | undefined> = createMockQuery<Groups | undefined>(undefined);
const keepAllMutate = vi.fn();
const keepOneMutate = vi.fn();
const discardMutate = vi.fn();

vi.mock("@hooks/api/queries/useLibraryScanStatus", () => ({
  useDuplicateGroups: () => groupsQuery,
}));

vi.mock("@hooks/api/mutations/jobs/useLibraryScanControls", () => ({
  useKeepBestLibraryCopies: () => ({ mutate: keepAllMutate, isPending: false }),
  useKeepBestLibraryCopy: () => ({ mutate: keepOneMutate, isPending: false }),
  useDiscardLibraryCopy: () => ({ mutate: discardMutate, isPending: false }),
}));

import { DuplicatesDialog } from "../DuplicatesDialog";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  groupsQuery = createMockQuery<Groups | undefined>(undefined);
});

function group(overrides: Partial<Group> = {}): Group {
  const id = overrides.requestId ?? "req_1";
  return {
    requestId: id,
    artist: "HIM",
    title: "Join Me",
    totalBytes: 60_000_000,
    reclaimableBytes: 20_000_000,
    ambiguous: false,
    copies: [
      {
        id: `${id}_a`,
        relativePath: "HIM/Razorblade/02.flac",
        sizeBytes: 40_000_000,
        fileFormat: "flac",
        serving: true,
      },
      { id: `${id}_b`, relativePath: "Scene/02.mp3", sizeBytes: 20_000_000, fileFormat: "mp3", serving: false },
    ],
    ...overrides,
  };
}

function open(groups: Group[]) {
  groupsQuery = createMockQuery<Groups | undefined>({
    groups,
    totalBytes: groups.reduce((sum, item) => sum + item.reclaimableBytes, 0),
  });
  render(<DuplicatesDialog isOpen onClose={vi.fn()} reclaiming={false} />);
}

describe("DuplicatesDialog", () => {
  it("lists a duplicated track with its copies and what settling it would free", () => {
    open([group()]);

    expect(screen.getByText("HIM - Join Me")).toBeInTheDocument();
    expect(screen.getByText(/Scene\/02\.mp3/)).toBeInTheDocument();
  });

  it("settles one track on its own", () => {
    open([group()]);

    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.tidyOne }));

    expect(keepOneMutate).toHaveBeenCalledWith({ requestId: "req_1" });
    expect(keepAllMutate).not.toHaveBeenCalled();
  });

  it("settles every track from the button above the list", () => {
    open([group()]);

    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.tidyAll }));

    expect(keepAllMutate).toHaveBeenCalled();
  });

  it("REFUSES to settle a track whose copies do not match, and says why", () => {
    open([group({ ambiguous: true })]);

    const button = screen.getByRole("button", { name: enSettings.libraryScan.duplicates.tidyOne });
    expect(button).toBeDisabled();
    expect(screen.getByText(new RegExp(enSettings.libraryScan.duplicates.ambiguous))).toBeInTheDocument();
  });

  it("still lets a mismatched group be resolved by hand, one copy at a time", () => {
    open([group({ ambiguous: true })]);

    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.discard }));

    expect(screen.getAllByText(enSettings.libraryScan.duplicates.confirmTitle).length).toBeGreaterThan(0);
  });

  it("never offers to discard the copy the library serves", () => {
    open([group({ ambiguous: true })]);

    expect(screen.getAllByRole("button", { name: enSettings.libraryScan.duplicates.discard })).toHaveLength(1);
  });

  it("paginates once there are at least fifteen tracks, and not before", () => {
    const fourteen = Array.from({ length: 14 }, (_, index) => group({ requestId: `req_${index}` }));
    open(fourteen);
    expect(screen.queryByRole("button", { name: /page 2/i })).not.toBeInTheDocument();
    cleanup();

    const fifteen = Array.from({ length: 15 }, (_, index) => group({ requestId: `req_${index}` }));
    open(fifteen);
    expect(screen.getByRole("button", { name: /page 2/i })).toBeInTheDocument();
  });

  it("says the library is clean when nothing is duplicated", () => {
    open([]);

    expect(screen.getByText(enSettings.libraryScan.duplicates.emptyTitle)).toBeInTheDocument();
  });

  it("locks both actions while a bulk pass is already running", () => {
    groupsQuery = createMockQuery<Groups | undefined>({ groups: [group()], totalBytes: 20_000_000 });
    render(<DuplicatesDialog isOpen onClose={vi.fn()} reclaiming />);

    expect(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.tidyOne })).toBeDisabled();
    expect(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.tidyAllRunning })).toBeDisabled();
  });
});
