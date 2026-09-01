import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

type Copy = {
  id: string;
  relativePath: string;
  fileName: string;
  sizeBytes: number;
  fileFormat: string;
  durationSeconds: number | null;
  serving: boolean;
};

type Group = {
  requestId: string;
  artist: string;
  title: string;
  directory: string;
  formats: string[];
  minBytes: number;
  maxBytes: number;
  totalBytes: number;
  reclaimableBytes: number;
  ambiguous: boolean;
  reason: "titles_differ" | "untitled_copy" | "lengths_differ" | "length_unknown" | null;
  distinctLengths: number | null;
  copies: Copy[];
};

type Groups = { groups: Group[]; totalBytes: number; safeBytes: number };

let groupsQuery: MockQueryResult<Groups | undefined> = createMockQuery<Groups | undefined>(undefined);
const keepAllMutate = vi.fn();
const keepOneMutate = vi.fn();
const keepThisMutate = vi.fn();

vi.mock("@hooks/api/queries/useLibraryScanStatus", () => ({
  useDuplicateGroups: () => groupsQuery,
}));

vi.mock("@hooks/api/mutations/jobs/useLibraryScanControls", () => ({
  useKeepBestLibraryCopies: () => ({ mutate: keepAllMutate, isPending: false }),
  useKeepBestLibraryCopy: () => ({ mutate: keepOneMutate, isPending: false }),
  useKeepThisCopy: () => ({ mutate: keepThisMutate, isPending: false }),
}));

import { DuplicatesDialog } from "../DuplicatesDialog";

let playCalls = 0;
let pauseCalls = 0;

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
  // jsdom no implementa la reproduccion; contamos las llamadas reales al elemento
  HTMLMediaElement.prototype.play = vi.fn(() => {
    playCalls += 1;
    return Promise.resolve();
  });
  HTMLMediaElement.prototype.pause = vi.fn(() => {
    pauseCalls += 1;
  });
});

afterEach(() => {
  cleanup();
  playCalls = 0;
  pauseCalls = 0;
  vi.clearAllMocks();
  groupsQuery = createMockQuery<Groups | undefined>(undefined);
});

function group(overrides: Partial<Group> = {}): Group {
  const id = overrides.requestId ?? "req_1";
  return {
    requestId: id,
    artist: "System of a Down",
    title: "Toxicity",
    directory: "System of a Down/Toxicity/",
    formats: ["mp3"],
    minBytes: 8_400_000,
    maxBytes: 8_900_000,
    totalBytes: 69_000_000,
    reclaimableBytes: 60_100_000,
    ambiguous: false,
    reason: null,
    distinctLengths: 1,
    copies: [
      {
        id: `${id}_a`,
        relativePath: "System of a Down/Toxicity/04 Toxicity.mp3",
        fileName: "04 Toxicity.mp3",
        sizeBytes: 8_900_000,
        fileFormat: "mp3",
        durationSeconds: 218,
        serving: true,
      },
      {
        id: `${id}_b`,
        relativePath: "System of a Down/Toxicity/04 Toxicity (1).mp3",
        fileName: "04 Toxicity (1).mp3",
        sizeBytes: 8_400_000,
        fileFormat: "mp3",
        durationSeconds: 219,
        serving: false,
      },
    ],
    ...overrides,
  };
}

function review(overrides: Partial<Group> = {}): Group {
  return group({
    requestId: "req_review",
    artist: "Anthony Hamilton",
    title: "Souls On Fire",
    ambiguous: true,
    reason: "titles_differ",
    ...overrides,
  });
}

function open(groups: Group[]) {
  groupsQuery = createMockQuery<Groups | undefined>({
    groups,
    totalBytes: groups.reduce((sum, item) => sum + item.reclaimableBytes, 0),
    safeBytes: groups.filter((item) => !item.ambiguous).reduce((sum, item) => sum + item.reclaimableBytes, 0),
  });
  render(<DuplicatesDialog isOpen onClose={vi.fn()} reclaiming={false} />);
}

function renderWith(groups: Group[]) {
  groupsQuery = createMockQuery<Groups | undefined>({
    groups,
    totalBytes: groups.reduce((sum, item) => sum + item.reclaimableBytes, 0),
    safeBytes: groups.filter((item) => !item.ambiguous).reduce((sum, item) => sum + item.reclaimableBytes, 0),
  });
  return render(<DuplicatesDialog isOpen onClose={vi.fn()} reclaiming={false} />);
}

function switchToReview() {
  fireEvent.click(screen.getByRole("tab", { name: new RegExp(enSettings.libraryScan.duplicates.tabReview) }));
}

describe("DuplicatesDialog", () => {
  it("opens on the review tab when nothing is safe, instead of landing the reader on an empty list", () => {
    open([review(), review({ requestId: "req_review_2", title: "Another" })]);

    expect(screen.getByRole("tab", { name: /Needs review/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Anthony Hamilton - Souls On Fire")).toBeInTheDocument();
  });

  it("still opens on the safe tab whenever there is anything there to resolve", () => {
    open([group(), review()]);

    expect(screen.getByRole("tab", { name: /Safe to resolve/ })).toHaveAttribute("aria-selected", "true");
  });

  it("moves off a tab that just emptied under the reader rather than showing them nothing", () => {
    const { rerender } = renderWith([group(), review()]);
    expect(screen.getByRole("tab", { name: /Safe to resolve/ })).toHaveAttribute("aria-selected", "true");

    groupsQuery = createMockQuery<Groups | undefined>({ groups: [review()], totalBytes: 0, safeBytes: 0 });
    rerender(<DuplicatesDialog isOpen onClose={vi.fn()} reclaiming={false} />);

    expect(screen.getByRole("tab", { name: /Needs review/ })).toHaveAttribute("aria-selected", "true");
  });

  it("splits the safe tracks from the ones a human has to judge", () => {
    open([group(), review()]);

    expect(screen.getByRole("tab", { name: /Safe to resolve/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("System of a Down - Toxicity")).toBeInTheDocument();
    expect(screen.queryByText("Anthony Hamilton - Souls On Fire")).not.toBeInTheDocument();

    switchToReview();
    expect(screen.getByText("Anthony Hamilton - Souls On Fire")).toBeInTheDocument();
    expect(screen.queryByText("System of a Down - Toxicity")).not.toBeInTheDocument();
  });

  it("leads with what the SAFE tracks would give back, not the whole pile", () => {
    open([group(), review({ reclaimableBytes: 999_000_000 })]);

    expect(screen.getByText(/57\.3 MB reclaimable/)).toBeInTheDocument();
  });

  it("summarises each track without making the reader open it", () => {
    open([group()]);

    expect(screen.getByText(/2 copies · MP3 ·/)).toBeInTheDocument();
    expect(screen.queryByText("04 Toxicity.mp3")).not.toBeInTheDocument();
  });

  it("says on the closed row how many recordings the copies look like, which is why it is in review", () => {
    open([review({ reason: "lengths_differ", distinctLengths: 2 })]);
    switchToReview();

    expect(screen.getByText(/2 clearly different lengths/)).toBeInTheDocument();
  });

  it("keeps that count readable when a track has piled up far more than two copies", () => {
    open([review({ reason: "lengths_differ", distinctLengths: 22 })]);
    switchToReview();

    expect(screen.getByText(/22 clearly different lengths/)).toBeInTheDocument();
  });

  it("drops the size range once the lengths are the thing being judged", () => {
    open([review({ reason: "lengths_differ", distinctLengths: 2 })]);
    switchToReview();

    expect(screen.queryByText(/8\.0 MB to 8\.5 MB/)).not.toBeInTheDocument();
  });

  it("keeps the size range on a safe row, where space is the only thing left to decide", () => {
    open([group()]);

    expect(screen.queryByText(/clearly different lengths/)).not.toBeInTheDocument();
    expect(screen.getByText(/8\.0 MB to 8\.5 MB/)).toBeInTheDocument();
  });

  it("shows the shared folder once and the file names under it when opened", () => {
    open([group()]);

    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.showCopies }));

    expect(screen.getByText("System of a Down/Toxicity/")).toBeInTheDocument();
    expect(screen.getByText("04 Toxicity.mp3")).toBeInTheDocument();
    expect(screen.getByText("04 Toxicity (1).mp3")).toBeInTheDocument();
  });

  it("shows each copy's length, which is the evidence the reader is being asked to weigh", () => {
    open([
      review({
        reason: "lengths_differ",
        copies: [
          { ...group().copies[0], durationSeconds: 227 },
          { ...group().copies[1], durationSeconds: 402 },
        ],
      }),
    ]);
    switchToReview();
    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.showCopies }));

    expect(screen.getByText("3:47")).toBeInTheDocument();
    expect(screen.getByText("6:42")).toBeInTheDocument();
  });

  it("says nothing about the length of a copy nobody has measured, rather than printing a zero", () => {
    open([
      review({
        reason: "length_unknown",
        copies: [{ ...group().copies[0], durationSeconds: null }, group().copies[1]],
      }),
    ]);
    switchToReview();
    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.showCopies }));

    expect(screen.queryByText("0:00")).not.toBeInTheDocument();
    expect(screen.getByText("3:39")).toBeInTheDocument();
  });

  it("marks the copy the library plays, and still offers to keep it", () => {
    open([group()]);
    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.showCopies }));

    expect(screen.getByText(enSettings.libraryScan.duplicates.inLibrary)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: enSettings.libraryScan.duplicates.keepThis })).toHaveLength(2);
  });

  it("keeps the copy the reader picked, whichever one it is", () => {
    open([group()]);
    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.showCopies }));

    const [, second] = screen.getAllByRole("button", { name: enSettings.libraryScan.duplicates.keepThis });
    fireEvent.click(second);

    expect(keepThisMutate).toHaveBeenCalledWith({ fileId: "req_1_b" });
  });

  it("offers each copy on its own player", () => {
    open([group()]);
    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.showCopies }));

    expect(screen.getAllByRole("button", { name: enSettings.libraryScan.duplicates.play })).toHaveLength(2);
  });

  it("shows the play button as loading until the audio actually starts", () => {
    open([group()]);
    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.showCopies }));

    fireEvent.click(screen.getAllByRole("button", { name: enSettings.libraryScan.duplicates.play })[0]);

    const loading = screen.getByRole("button", { name: enSettings.libraryScan.duplicates.loading });
    expect(loading).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("button", { name: enSettings.libraryScan.duplicates.pause })).not.toBeInTheDocument();

    fireEvent.playing(document.querySelectorAll("audio")[0]);

    expect(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.pause })).toHaveAttribute(
      "aria-busy",
      "false"
    );
  });

  it("goes back to loading when playback stalls mid-track", () => {
    open([group()]);
    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.showCopies }));
    fireEvent.click(screen.getAllByRole("button", { name: enSettings.libraryScan.duplicates.play })[0]);
    fireEvent.playing(document.querySelectorAll("audio")[0]);

    fireEvent.waiting(document.querySelectorAll("audio")[0]);

    expect(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.loading })).toBeInTheDocument();
  });

  it("stops pretending to play when the copy cannot be fetched", () => {
    open([group()]);
    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.showCopies }));
    fireEvent.click(screen.getAllByRole("button", { name: enSettings.libraryScan.duplicates.play })[0]);

    fireEvent.error(document.querySelectorAll("audio")[0]);

    expect(screen.getAllByRole("button", { name: enSettings.libraryScan.duplicates.play })).toHaveLength(2);
    expect(screen.queryByRole("button", { name: enSettings.libraryScan.duplicates.loading })).not.toBeInTheDocument();
  });

  it("keeps playing when ANOTHER track is expanded, instead of restarting into loading", () => {
    open([group(), group({ requestId: "req_2", artist: "Pearl Jam", title: "Once" })]);
    const [firstToggle, secondToggle] = screen.getAllByRole("button", {
      name: enSettings.libraryScan.duplicates.showCopies,
    });

    fireEvent.click(firstToggle);
    fireEvent.click(screen.getAllByRole("button", { name: enSettings.libraryScan.duplicates.play })[0]);
    fireEvent.playing(document.querySelectorAll("audio")[0]);
    expect(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.pause })).toBeInTheDocument();

    const playsBefore = playCalls;
    fireEvent.click(secondToggle);

    expect(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.pause })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: enSettings.libraryScan.duplicates.loading })).not.toBeInTheDocument();
    expect(playCalls).toBe(playsBefore);
  });

  it("keeps playing when the reader collapses an unrelated track too", () => {
    open([group(), group({ requestId: "req_2", artist: "Pearl Jam", title: "Once" })]);
    const toggles = screen.getAllByRole("button", { name: enSettings.libraryScan.duplicates.showCopies });

    fireEvent.click(toggles[0]);
    fireEvent.click(toggles[1]);
    fireEvent.click(screen.getAllByRole("button", { name: enSettings.libraryScan.duplicates.play })[0]);
    fireEvent.playing(document.querySelectorAll("audio")[0]);

    const playsBefore = playCalls;
    fireEvent.click(toggles[1]);

    expect(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.pause })).toBeInTheDocument();
    expect(playCalls).toBe(playsBefore);
  });

  it("STOPS the copy that was playing when another one starts, so two never overlap", () => {
    open([group()]);
    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.showCopies }));

    const [first, second] = screen.getAllByRole("button", { name: enSettings.libraryScan.duplicates.play });
    fireEvent.click(first);
    fireEvent.playing(document.querySelectorAll("audio")[0]);
    expect(screen.getAllByRole("button", { name: enSettings.libraryScan.duplicates.pause })).toHaveLength(1);

    fireEvent.click(second);
    fireEvent.playing(document.querySelectorAll("audio")[1]);

    const paused = screen.getAllByRole("button", { name: enSettings.libraryScan.duplicates.pause });
    expect(paused).toHaveLength(1);
    expect(playCalls).toBe(2);
    expect(pauseCalls).toBeGreaterThan(0);
  });

  it("stops playback when the same button is pressed again", () => {
    open([group()]);
    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.showCopies }));

    const [first] = screen.getAllByRole("button", { name: enSettings.libraryScan.duplicates.play });
    fireEvent.click(first);
    fireEvent.playing(document.querySelectorAll("audio")[0]);
    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.pause }));

    expect(screen.queryByRole("button", { name: enSettings.libraryScan.duplicates.pause })).not.toBeInTheDocument();
  });

  it("settles one track on its own", () => {
    open([group()]);

    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.tidyOne }));

    expect(keepOneMutate).toHaveBeenCalledWith({ requestId: "req_1" });
    expect(keepAllMutate).not.toHaveBeenCalled();
  });

  it("settles every safe track from the banner", () => {
    open([group(), review()]);

    fireEvent.click(screen.getByRole("button", { name: /Resolve the one safe track/ }));

    expect(keepAllMutate).toHaveBeenCalled();
  });

  it("REFUSES to settle a track whose copies do not match", () => {
    open([review()]);
    switchToReview();

    expect(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.tidyOne })).toBeDisabled();
  });

  it("explains why on hover, from a wrapper the pointer can actually reach", async () => {
    open([review()]);
    switchToReview();

    const trigger = screen
      .getByRole("button", { name: enSettings.libraryScan.duplicates.tidyOne })
      .closest("span[tabindex]");
    expect(trigger).not.toBeNull();
    fireEvent.focus(trigger as Element);

    expect(await screen.findAllByText(enSettings.libraryScan.duplicates.reason.titles_differ)).not.toHaveLength(0);
  });

  it("carries a DIFFERENT explanation when a copy has no title to vouch for it", async () => {
    open([review({ reason: "untitled_copy" })]);
    switchToReview();

    const trigger = screen
      .getByRole("button", { name: enSettings.libraryScan.duplicates.tidyOne })
      .closest("span[tabindex]");
    fireEvent.focus(trigger as Element);

    expect(await screen.findAllByText(enSettings.libraryScan.duplicates.reason.untitled_copy)).not.toHaveLength(0);
  });

  it("still lets a mismatched track be settled by hand, by picking the copy that stays", () => {
    open([review()]);
    switchToReview();
    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.showCopies }));

    const [, second] = screen.getAllByRole("button", { name: enSettings.libraryScan.duplicates.keepThis });
    fireEvent.click(second);

    expect(keepThisMutate).toHaveBeenCalledWith({ fileId: "req_review_b" });
  });

  it("hands paging to the shared control instead of a second implementation of it", () => {
    open(Array.from({ length: 25 }, (_, index) => group({ requestId: `req_${index}`, title: `Track ${index}` })));

    expect(screen.getByRole("button", { name: /next page/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previous page/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^page 1$/i })).toHaveAttribute("aria-current", "page");
  });

  it("moves a page at a time and shows the tracks of the page it landed on", () => {
    open(Array.from({ length: 25 }, (_, index) => group({ requestId: `req_${index}`, title: `Track ${index}` })));

    expect(screen.getByText("System of a Down - Track 0")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /next page/i }));

    expect(screen.queryByText("System of a Down - Track 0")).not.toBeInTheDocument();
    expect(screen.getByText("System of a Down - Track 10")).toBeInTheDocument();
  });

  it("does not paginate a short list", () => {
    open([group(), group({ requestId: "req_2", title: "Second" })]);

    expect(screen.queryByRole("button", { name: /next page/i })).not.toBeInTheDocument();
  });

  it("returns to the first page when the tab changes, so the view cannot land past the end", () => {
    open([
      ...Array.from({ length: 25 }, (_, index) => group({ requestId: `req_${index}`, title: `Track ${index}` })),
      review(),
    ]);

    fireEvent.click(screen.getByRole("button", { name: /next page/i }));
    switchToReview();
    fireEvent.click(screen.getByRole("tab", { name: new RegExp(enSettings.libraryScan.duplicates.tabSafe) }));

    expect(screen.getByText("System of a Down - Track 0")).toBeInTheDocument();
  });

  it("refetches the list once the bulk pass finishes, since the mutation returns before the work does", () => {
    const refetch = vi.fn();
    groupsQuery = {
      ...createMockQuery<Groups | undefined>({ groups: [group()], totalBytes: 1, safeBytes: 1 }),
      refetch,
    };
    const { rerender } = render(<DuplicatesDialog isOpen onClose={vi.fn()} reclaiming />);

    expect(refetch).not.toHaveBeenCalled();

    rerender(<DuplicatesDialog isOpen onClose={vi.fn()} reclaiming={false} />);

    expect(refetch).toHaveBeenCalled();
  });

  it("closes itself once the last duplicate is gone, instead of showing a stale list", () => {
    const onClose = vi.fn();
    groupsQuery = createMockQuery<Groups | undefined>({ groups: [], totalBytes: 0, safeBytes: 0 });

    render(<DuplicatesDialog isOpen onClose={onClose} reclaiming={false} />);

    expect(onClose).toHaveBeenCalled();
  });

  it("stays open while tracks remain", () => {
    const onClose = vi.fn();
    groupsQuery = createMockQuery<Groups | undefined>({ groups: [group()], totalBytes: 1, safeBytes: 1 });

    render(<DuplicatesDialog isOpen onClose={onClose} reclaiming={false} />);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("says the library is clean when nothing is duplicated", () => {
    open([]);

    expect(screen.getByText(enSettings.libraryScan.duplicates.emptyTitle)).toBeInTheDocument();
  });

  it("locks both actions while a bulk pass is already running", () => {
    groupsQuery = createMockQuery<Groups | undefined>({
      groups: [group()],
      totalBytes: 60_100_000,
      safeBytes: 60_100_000,
    });
    render(<DuplicatesDialog isOpen onClose={vi.fn()} reclaiming />);

    expect(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.tidyOne })).toBeDisabled();
    expect(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.tidyAllRunning })).toBeDisabled();
  });
});
