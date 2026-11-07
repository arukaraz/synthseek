import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enSettings from "@modules/i18n/messages/en/settings.json";
import { formatBytes } from "@utils/formatters";

import type { DuplicateComparatorProps, DuplicateCopy, DuplicateGroup } from "../types";

interface MutateOptions {
  onSuccess?: () => void;
}

const api = vi.hoisted(() => ({
  groups: undefined as { groups: DuplicateGroup[]; comparing: number } | undefined,
  loading: false,
  refetch: vi.fn(),
  keepThis: vi.fn(),
  reject: vi.fn(),
  rejectPending: false,
  enabledSeen: vi.fn(),
}));

vi.mock("@hooks/api/queries/useLibraryScanStatus", () => ({
  useDuplicateGroups: (enabled: boolean) => {
    api.enabledSeen(enabled);
    return { data: api.groups, isLoading: api.loading, refetch: api.refetch };
  },
}));

vi.mock("@hooks/api/mutations/jobs/useLibraryScanControls", () => ({
  useKeepThisCopy: () => ({ mutate: api.keepThis, isPending: false }),
  useRejectCopies: () => ({ mutate: api.reject, isPending: api.rejectPending }),
}));

vi.mock("../DuplicateComparator", () => ({
  DuplicateComparator: ({ group, busy, onKeep, onNoneFits }: DuplicateComparatorProps) => (
    <div data-testid={`comparator-${group.requestId}`} data-busy={busy}>
      {group.copies.map((copy) => (
        <button key={copy.id} type="button" onClick={() => onKeep(copy)}>
          keep {copy.fileName}
        </button>
      ))}
      <button type="button" onClick={onNoneFits}>
        none fits
      </button>
    </div>
  ),
}));

import { DuplicatesContent } from "../DuplicatesContent";

const copies = enSettings.libraryScan.duplicates;

function copy(overrides: Partial<DuplicateCopy> = {}): DuplicateCopy {
  return {
    id: "file-1",
    libraryPath: "Music",
    relativePath: "Daft Punk/Discovery/03 - Digital Love.flac",
    fileName: "03 - Digital Love.flac",
    sizeBytes: 31_457_280,
    fileFormat: "flac",
    durationSeconds: 301,
    loudnessLufs: -9,
    serving: true,
    offsetSeconds: 0,
    peaks: [10, 20, 30],
    differences: [],
    ...overrides,
  };
}

function group(overrides: Partial<DuplicateGroup> = {}): DuplicateGroup {
  return {
    requestId: "req-1",
    artist: "Daft Punk",
    title: "Digital Love",
    reclaimableBytes: 8_388_608,
    copies: [
      copy(),
      copy({
        id: "file-2",
        fileName: "digital love (clean).mp3",
        fileFormat: "mp3",
        sizeBytes: 8_388_608,
        serving: false,
        differences: [{ from: 60, to: 62 }],
      }),
    ],
    ...overrides,
  };
}

function renderContent(reclaiming = false) {
  const view = render(<DuplicatesContent enabled reclaiming={reclaiming} />);
  return { user: userEvent.setup(), view };
}

function succeed(options: MutateOptions | undefined) {
  options?.onSuccess?.();
}

beforeEach(() => {
  vi.resetAllMocks();
  api.groups = { groups: [group()], comparing: 0 };
  api.loading = false;
  api.rejectPending = false;
});

describe("what the duplicates panel lists", () => {
  it("shows a spinner while the groups are still being fetched", () => {
    api.loading = true;
    api.groups = undefined;
    renderContent();
    expect(screen.queryByText("Daft Punk - Digital Love")).not.toBeInTheDocument();
    expect(screen.queryByText(copies.emptyTitle)).not.toBeInTheDocument();
  });

  it("says there is nothing to listen to when no song has copies that sound different", () => {
    api.groups = { groups: [], comparing: 0 };
    renderContent();
    expect(screen.getByText(copies.emptyTitle)).toBeInTheDocument();
    expect(screen.getByText(copies.emptyBody)).toBeInTheDocument();
  });

  it("counts the songs whose audio is still being compared", () => {
    api.groups = { groups: [], comparing: 3 };
    renderContent();
    expect(screen.getByText("Comparing the audio of 3 songs")).toBeInTheDocument();
  });

  it("says nothing about a comparison when none is running", () => {
    renderContent();
    expect(screen.queryByText(/Comparing the audio/)).not.toBeInTheDocument();
  });

  it("names the song, its copies and their formats, and what keeping one frees", () => {
    renderContent();
    expect(screen.getByText("Daft Punk - Digital Love")).toBeInTheDocument();
    expect(screen.getByText("2 copies · FLAC, MP3")).toBeInTheDocument();
    expect(screen.getByText(formatBytes(8_388_608))).toBeInTheDocument();
    expect(screen.getByText(copies.listen)).toBeInTheDocument();
  });

  it("only asks the server for the groups while the panel is open", () => {
    render(<DuplicatesContent enabled={false} reclaiming={false} />);
    expect(api.enabledSeen).toHaveBeenLastCalledWith(false);
  });

  it("fetches the groups again once a reclaim has finished", () => {
    const { view } = renderContent(true);
    expect(api.refetch).not.toHaveBeenCalled();
    view.rerender(<DuplicatesContent enabled reclaiming={false} />);
    expect(api.refetch).toHaveBeenCalledTimes(1);
  });
});

describe("listening to one song at a time", () => {
  beforeEach(() => {
    api.groups = {
      groups: [group(), group({ requestId: "req-2", artist: "Air", title: "La Femme d'Argent" })],
      comparing: 0,
    };
  });

  it("keeps every comparator folded away until a song is opened", () => {
    renderContent();
    expect(screen.queryByTestId("comparator-req-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("comparator-req-2")).not.toBeInTheDocument();
  });

  it("opens the song that was asked for, and closes the one before", async () => {
    const { user } = renderContent();
    await user.click(screen.getByRole("button", { name: /Daft Punk - Digital Love/ }));
    expect(screen.getByTestId("comparator-req-1")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Air - La Femme/ }));
    expect(screen.queryByTestId("comparator-req-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("comparator-req-2")).toBeInTheDocument();
  });

  it("folds the open song away again", async () => {
    const { user } = renderContent();
    const head = screen.getByRole("button", { name: /Daft Punk - Digital Love/ });
    await user.click(head);
    expect(head).toHaveAttribute("aria-expanded", "true");
    await user.click(head);
    expect(head).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByTestId("comparator-req-1")).not.toBeInTheDocument();
  });

  it("keeps the copy the listener chose, then opens the next song", async () => {
    api.keepThis.mockImplementation((_input: unknown, options?: MutateOptions) => succeed(options));
    const { user } = renderContent();
    await user.click(screen.getByRole("button", { name: /Daft Punk - Digital Love/ }));
    await user.click(screen.getByRole("button", { name: "keep digital love (clean).mp3" }));
    expect(api.keepThis).toHaveBeenCalledWith({ fileId: "file-2" }, expect.anything());
    expect(screen.getByTestId("comparator-req-2")).toBeInTheDocument();
  });

  it("leaves the song open when keeping a copy fails", async () => {
    const { user } = renderContent();
    await user.click(screen.getByRole("button", { name: /Daft Punk - Digital Love/ }));
    await user.click(screen.getByRole("button", { name: "keep 03 - Digital Love.flac" }));
    expect(screen.getByTestId("comparator-req-1")).toBeInTheDocument();
    expect(screen.queryByTestId("comparator-req-2")).not.toBeInTheDocument();
  });

  it("holds the comparator while a reclaim is running", async () => {
    const { user } = renderContent(true);
    await user.click(screen.getByRole("button", { name: /Daft Punk - Digital Love/ }));
    expect(screen.getByTestId("comparator-req-1")).toHaveAttribute("data-busy", "true");
  });
});

describe("rejecting every copy", () => {
  async function openDialog() {
    const result = renderContent();
    await result.user.click(screen.getByRole("button", { name: /Daft Punk - Digital Love/ }));
    await result.user.click(screen.getByRole("button", { name: "none fits" }));
    return result;
  }

  it("asks how to reject, naming the song and what each choice does", async () => {
    await openDialog();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Reject the 2 copies of “Digital Love”")).toBeInTheDocument();
    expect(screen.getByText(copies.reject.remembers_other)).toBeInTheDocument();
    expect(screen.getByText(copies.reject.searches_other)).toBeInTheDocument();
  });

  it("rejects without searching again", async () => {
    const { user } = await openDialog();
    await user.click(screen.getByRole("button", { name: copies.reject.rejectAction }));
    expect(api.reject).toHaveBeenCalledWith({ requestId: "req-1", searchAgain: false }, expect.anything());
  });

  it("rejects and searches again", async () => {
    const { user } = await openDialog();
    await user.click(screen.getByRole("button", { name: copies.reject.searchAction }));
    expect(api.reject).toHaveBeenCalledWith({ requestId: "req-1", searchAgain: true }, expect.anything());
  });

  it("closes the question once the copies are rejected", async () => {
    api.reject.mockImplementation((_input: unknown, options?: MutateOptions) => succeed(options));
    const { user } = await openDialog();
    await user.click(screen.getByRole("button", { name: copies.reject.rejectAction }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("rejects nothing when the listener cancels", async () => {
    const { user } = await openDialog();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(api.reject).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
