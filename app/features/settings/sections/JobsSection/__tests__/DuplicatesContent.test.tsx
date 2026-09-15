import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enSettings from "@modules/i18n/messages/en/settings.json";

interface Copy {
  id: string;
  fileName: string;
  sizeBytes: number;
  durationSeconds: number | null;
  serving: boolean;
}

interface Group {
  requestId: string;
  artist: string;
  title: string;
  directory: string;
  ambiguous: boolean;
  reason: string | null;
  reclaimableBytes: number;
  servedFileMissing: boolean;
  copies: Copy[];
  formats: string[];
  minBytes: number;
  maxBytes: number;
  distinctLengths: number | null;
}

const api = vi.hoisted(() => ({
  groups: undefined as { groups: Group[]; safeBytes: number } | undefined,
  loading: false,
  refetch: vi.fn(),
  keepAll: vi.fn(),
  keepAllPending: false,
  keepOne: vi.fn(),
  keepOnePending: false,
  keepThis: vi.fn(),
  enabledSeen: vi.fn(),
}));

vi.mock("@hooks/api/queries/useLibraryScanStatus", () => ({
  useDuplicateGroups: (enabled: boolean) => {
    api.enabledSeen(enabled);
    return { data: api.groups, isLoading: api.loading, refetch: api.refetch };
  },
}));

vi.mock("@hooks/api/mutations/jobs/useLibraryScanControls", () => ({
  useKeepBestLibraryCopies: () => ({ mutate: api.keepAll, isPending: api.keepAllPending }),
  useKeepBestLibraryCopy: () => ({ mutate: api.keepOne, isPending: api.keepOnePending }),
  useKeepThisCopy: () => ({ mutate: api.keepThis, isPending: false }),
}));

vi.mock("../CopyRow", () => ({
  CopyRow: ({ copy, onKeep }: { copy: Copy; onKeep: () => void }) => (
    <button type="button" onClick={onKeep}>
      {copy.fileName}
    </button>
  ),
}));

import { DuplicatesContent } from "../DuplicatesContent";

function group(overrides: Partial<Group> = {}): Group {
  return {
    requestId: "req-1",
    artist: "Daft Punk",
    title: "Digital Love",
    directory: "/music/Daft Punk/Discovery",
    ambiguous: false,
    reason: null,
    reclaimableBytes: 31_457_280,
    servedFileMissing: false,
    copies: [
      { id: "file-1", fileName: "01 - Digital Love.flac", sizeBytes: 31_457_280, durationSeconds: 301, serving: true },
      { id: "file-2", fileName: "digital love.flac", sizeBytes: 31_457_280, durationSeconds: 301, serving: false },
    ],
    formats: ["flac"],
    minBytes: 31_457_280,
    maxBytes: 31_457_280,
    distinctLengths: 1,
    ...overrides,
  };
}

function renderContent(reclaiming = false) {
  render(<DuplicatesContent enabled reclaiming={reclaiming} />);
  return { user: userEvent.setup() };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.groups = { groups: [group()], safeBytes: 31_457_280 };
  api.loading = false;
  api.keepAllPending = false;
  api.keepOnePending = false;
});

describe("what the duplicates panel shows", () => {
  it("shows a spinner while the groups are still being fetched", () => {
    api.loading = true;
    api.groups = undefined;

    const { container } = render(<DuplicatesContent enabled reclaiming={false} />);

    expect(container.querySelector(".animate-spin")).not.toBeNull();
  });

  it("congratulates the listener when there are no duplicates at all", () => {
    api.groups = { groups: [], safeBytes: 0 };

    renderContent();

    expect(screen.getByText(enSettings.libraryScan.duplicates.emptyTitle)).toBeInTheDocument();
  });

  it("names the track a group is about", () => {
    renderContent();

    expect(screen.getByText("Daft Punk - Digital Love")).toBeInTheDocument();
  });

  it("warns when the copy the library serves is no longer on disk", () => {
    api.groups = { groups: [group({ servedFileMissing: true })], safeBytes: 0 };

    renderContent();

    expect(screen.getByText(enSettings.libraryScan.duplicates.servedFileMissing)).toBeInTheDocument();
  });

  it("only asks the server for the groups while the panel is open", () => {
    renderContent();

    expect(api.enabledSeen).toHaveBeenCalledWith(true);
  });
});

describe("the two tabs", () => {
  it("opens on the safe groups, which need no judgement", () => {
    api.groups = { groups: [group(), group({ requestId: "req-2", ambiguous: true })], safeBytes: 31_457_280 };

    renderContent();

    expect(screen.getAllByRole("tab")[0]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(enSettings.libraryScan.duplicates.safeNote_one)).toBeInTheDocument();
  });

  it("moves to the groups that need a look", async () => {
    api.groups = {
      groups: [group(), group({ requestId: "req-2", title: "Aerodynamic", ambiguous: true })],
      safeBytes: 31_457_280,
    };
    const { user } = renderContent();

    await user.click(screen.getAllByRole("tab")[1] ?? document.body);

    expect(screen.getByText(enSettings.libraryScan.duplicates.reviewNote)).toBeInTheDocument();
    expect(screen.getByText("Daft Punk - Aerodynamic")).toBeInTheDocument();
  });

  it("opens on the review tab when nothing is safe to tidy on its own", () => {
    api.groups = { groups: [group({ ambiguous: true })], safeBytes: 0 };

    renderContent();

    expect(screen.getByText(enSettings.libraryScan.duplicates.reviewNote)).toBeInTheDocument();
  });
});

describe("reclaiming the space", () => {
  it("tidies every safe group at once", async () => {
    const { user } = renderContent();

    await user.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.tidyAll_one }));

    expect(api.keepAll).toHaveBeenCalled();
  });

  it("says a reclaim is running rather than letting it be pressed twice", () => {
    api.keepAllPending = true;

    renderContent();

    expect(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.tidyAllRunning })).toBeDisabled();
  });

  it("waits out a reclaim started elsewhere on the page", () => {
    renderContent(true);

    expect(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.tidyAllRunning })).toBeDisabled();
  });

  it("fetches the groups again once a reclaim has finished", () => {
    const { rerender } = render(<DuplicatesContent enabled reclaiming />);

    rerender(<DuplicatesContent enabled reclaiming={false} />);

    expect(api.refetch).toHaveBeenCalled();
  });

  it("tidies one group on its own", async () => {
    const { user } = renderContent();

    await user.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.tidyOne }));

    expect(api.keepOne).toHaveBeenCalledWith({ requestId: "req-1" });
  });

  it("refuses to tidy a group it cannot judge, and says why", async () => {
    api.groups = { groups: [group({ ambiguous: true, reason: "titles_differ" })], safeBytes: 0 };

    renderContent();

    expect(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.tidyOne })).toBeDisabled();
  });
});

describe("looking inside a group", () => {
  it("keeps the copies folded away until they are asked for", () => {
    renderContent();

    expect(screen.queryByText("01 - Digital Love.flac")).not.toBeInTheDocument();
  });

  it("lists the copies and the folder they sit in", async () => {
    const { user } = renderContent();

    await user.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.showCopies }));

    expect(screen.getByText("/music/Daft Punk/Discovery")).toBeInTheDocument();
    expect(screen.getByText("01 - Digital Love.flac")).toBeInTheDocument();
    expect(screen.getByText("digital love.flac")).toBeInTheDocument();
  });

  it("folds the copies away again", async () => {
    const { user } = renderContent();
    const caret = screen.getByRole("button", { name: enSettings.libraryScan.duplicates.showCopies });

    await user.click(caret);
    await user.click(caret);

    expect(screen.queryByText("01 - Digital Love.flac")).not.toBeInTheDocument();
  });

  it("keeps the copy the listener chose", async () => {
    const { user } = renderContent();
    await user.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.showCopies }));

    await user.click(screen.getByRole("button", { name: "digital love.flac" }));

    expect(api.keepThis).toHaveBeenCalledWith({ fileId: "file-2" });
  });

  it("shows no folder line for a group whose copies sit in different places", async () => {
    api.groups = { groups: [group({ directory: "" })], safeBytes: 0 };
    const { user } = renderContent();

    await user.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.showCopies }));

    expect(screen.getByText("01 - Digital Love.flac")).toBeInTheDocument();
    expect(screen.queryByText("/music/Daft Punk/Discovery")).not.toBeInTheDocument();
  });
});
