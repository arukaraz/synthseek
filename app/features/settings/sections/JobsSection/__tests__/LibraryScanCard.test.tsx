import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, createLoadingQuery, createErrorQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

type ScanStatus = {
  activeRun: ScanRun | null;
  lastRun: ScanRun | null;
  inventory: {
    indexedFiles: number;
    linkedFiles: number;
    unlinkedFiles: number;
    missingFiles: number;
    totalBytes: number;
    formats: { format: string; count: number }[];
    completeRequestsWithoutFile: number;
  };
};

type ScanRun = {
  state: string;
  walkClean: boolean;
  walkFailures: number;
  filesSeen: number;
  filesNew: number;
  filesUpdated: number;
  filesUnchanged: number;
  filesFailed: number;
  filesMissing: number;
  filesLinked: number;
  terminalCode: string | null;
};

type AlternateCopies = {
  total: number;
  totalBytes: number;
  items: {
    id: string;
    relativePath: string;
    sizeBytes: number;
    fileFormat: string;
    artist: string;
    title: string;
    servingPath: string;
  }[];
};

type UnlinkedFiles = {
  total: number;
  items: {
    id: string;
    relativePath: string;
    title: string | null;
    artistName: string | null;
    albumTitle: string | null;
  }[];
};

let statusQuery: MockQueryResult<ScanStatus | undefined> = createMockQuery<ScanStatus | undefined>(undefined);
let unlinkedQuery: MockQueryResult<UnlinkedFiles | undefined> = createMockQuery<UnlinkedFiles | undefined>(undefined);
let alternatesQuery: MockQueryResult<AlternateCopies | undefined> = createMockQuery<AlternateCopies | undefined>(
  undefined
);
const discardMutate = vi.fn();
const cancelMutate = vi.fn();

vi.mock("@hooks/api/queries/useLibraryScanStatus", () => ({
  useLibraryScanStatus: () => statusQuery,
  useAlternateLibraryCopies: () => alternatesQuery,
}));

const triggerMutate = vi.fn();
vi.mock("@hooks/api/mutations/jobs/useTriggerJob", () => ({
  useTriggerJob: () => ({ mutate: triggerMutate, isPending: false }),
}));

vi.mock("@hooks/api/mutations/jobs/useLibraryScanControls", () => ({
  useCancelLibraryScan: () => ({ mutate: cancelMutate, isPending: false }),
  useDiscardLibraryCopy: () => ({ mutate: discardMutate, isPending: false }),
}));

import { LibraryScanCard } from "../LibraryScanCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  statusQuery = createMockQuery<ScanStatus | undefined>(undefined);
  unlinkedQuery = createMockQuery<UnlinkedFiles | undefined>(undefined);
  alternatesQuery = createMockQuery<AlternateCopies | undefined>(undefined);
});

function makeRun(overrides: Partial<ScanRun> = {}): ScanRun {
  return {
    state: "completed",
    walkClean: true,
    walkFailures: 0,
    filesSeen: 8334,
    filesNew: 2883,
    filesUpdated: 0,
    filesUnchanged: 5451,
    filesFailed: 0,
    filesMissing: 0,
    filesLinked: 5451,
    terminalCode: null,
    ...overrides,
  };
}

function makeStatus(overrides: Partial<ScanStatus> = {}): ScanStatus {
  return {
    activeRun: null,
    lastRun: makeRun(),
    inventory: {
      indexedFiles: 8334,
      linkedFiles: 5451,
      unlinkedFiles: 2883,
      missingFiles: 0,
      totalBytes: 170_000_000_000,
      formats: [
        { format: "mp3", count: 5514 },
        { format: "flac", count: 2820 },
      ],
      completeRequestsWithoutFile: 243,
    },
    ...overrides,
  };
}

describe("LibraryScanCard", () => {
  it("shows how much of the disk the library actually covers", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());

    render(<LibraryScanCard />);

    expect(screen.getByText("8,334")).toBeInTheDocument();
    expect(screen.getByText("5,451")).toBeInTheDocument();
    expect(screen.getByText("2,883")).toBeInTheDocument();
  });

  it("names the finished requests whose file is not on disk", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());

    render(<LibraryScanCard />);

    expect(screen.getByText(/243 finished requests have no file on disk/)).toBeInTheDocument();
  });

  it("hides that line when every finished request has its file", () => {
    const status = makeStatus();
    status.inventory.completeRequestsWithoutFile = 0;
    statusQuery = createMockQuery<ScanStatus | undefined>(status);

    render(<LibraryScanCard />);

    expect(screen.queryByText(/has no file on disk/)).not.toBeInTheDocument();
  });

  it("warns that nothing was marked gone when the walk could not read everything", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(
      makeStatus({ lastRun: makeRun({ walkClean: false, walkFailures: 3 }) })
    );

    render(<LibraryScanCard />);

    expect(screen.getByText(enSettings.libraryScan.warning.dirtyWalk.title)).toBeInTheDocument();
    expect(screen.getByText(/3 paths could not be read/)).toBeInTheDocument();
  });

  it("does not warn after a walk that read everything", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());

    render(<LibraryScanCard />);

    expect(screen.queryByText(enSettings.libraryScan.warning.dirtyWalk.title)).not.toBeInTheDocument();
  });

  it("reports where the run stands without reciting what it counted", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(
      makeStatus({
        lastRun: makeRun({ filesSeen: 9111, filesNew: 12, filesLinked: 7222, filesFailed: 7, filesMissing: 3 }),
      })
    );

    render(<LibraryScanCard />);

    expect(screen.getByText(/Last scan finished/)).toBeInTheDocument();
    for (const recited of [/9,?111/, /7,?222/, /unreadable/, /seen/, /matched/, /unchanged/]) {
      expect(screen.queryByText(recited)).not.toBeInTheDocument();
    }
  });

  it("shows why a run ended when it carries a terminal code", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(
      makeStatus({ lastRun: makeRun({ state: "failed", terminalCode: "SCAN_ERROR" }) })
    );

    render(<LibraryScanCard />);

    expect(screen.getByText(/SCAN_ERROR/)).toBeInTheDocument();
  });

  it("no longer recites which files are unidentified", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());
    unlinkedQuery = createMockQuery<UnlinkedFiles | undefined>({
      total: 2883,
      items: [
        { id: "f1", relativePath: "HIM/solo.flac", title: "Join Me", artistName: "HIM", albumTitle: "Razorblade" },
      ],
    });

    render(<LibraryScanCard />);

    expect(screen.queryByText("HIM - Join Me (Razorblade)")).not.toBeInTheDocument();
    expect(screen.queryByText(/not identified yet/i)).not.toBeInTheDocument();
  });

  it("offers cancelling only while a scan is running", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());
    const { unmount } = render(<LibraryScanCard />);
    expect(screen.queryByRole("button", { name: enSettings.libraryScan.actions.cancel })).not.toBeInTheDocument();
    unmount();

    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus({ activeRun: makeRun({ state: "scanning" }) }));
    render(<LibraryScanCard />);

    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.actions.cancel }));
    expect(cancelMutate).toHaveBeenCalledTimes(1);
  });

  it("starts a scan from the card itself", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());

    render(<LibraryScanCard />);

    fireEvent.click(screen.getByRole("button", { name: /run .*library scan/i }));

    expect(triggerMutate).toHaveBeenCalledWith({ id: "library-scan" }, expect.anything());
  });

  it("shows the run button as busy while a scan is actually in flight, not merely while the click resolves", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus({ activeRun: makeRun({ state: "scanning" }) }));

    render(<LibraryScanCard />);

    const button = screen.getByRole("button", { name: /running library scan/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("offers the run button again once the scan reaches a terminal state", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus({ activeRun: null }));

    render(<LibraryScanCard />);

    const button = screen.getByRole("button", { name: /run .*library scan/i });
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "false");
  });

  it("lists the duplicate copies with what discarding them would free", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());
    alternatesQuery = createMockQuery<AlternateCopies | undefined>({
      total: 66,
      totalBytes: 2_000_000_000,
      items: [
        {
          id: "copy_1",
          relativePath: "Scene/01.flac",
          sizeBytes: 40_000_000,
          fileFormat: "flac",
          artist: "HIM",
          title: "Join Me",
          servingPath: "HIM/served.flac",
        },
      ],
    });

    render(<LibraryScanCard />);

    expect(screen.getByText(/66 files are other copies/)).toBeInTheDocument();
    expect(screen.getByText(/HIM - Join Me/)).toBeInTheDocument();
  });

  it("asks before discarding, and never discards on the click alone", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());
    alternatesQuery = createMockQuery<AlternateCopies | undefined>({
      total: 1,
      totalBytes: 40_000_000,
      items: [
        {
          id: "copy_1",
          relativePath: "Scene/01.flac",
          sizeBytes: 40_000_000,
          fileFormat: "flac",
          artist: "HIM",
          title: "Join Me",
          servingPath: "HIM/the-one-that-stays.flac",
        },
      ],
    });

    render(<LibraryScanCard />);
    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.alternates.discard }));

    expect(discardMutate).not.toHaveBeenCalled();
    expect(screen.getByText(enSettings.libraryScan.alternates.confirmTitle)).toBeInTheDocument();
  });

  it("names BOTH files before discarding, so a different mix is not mistaken for a duplicate", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());
    alternatesQuery = createMockQuery<AlternateCopies | undefined>({
      total: 1,
      totalBytes: 40_000_000,
      items: [
        {
          id: "copy_1",
          relativePath: "Avicii/vocal-mix.flac",
          sizeBytes: 40_000_000,
          fileFormat: "flac",
          artist: "Avicii",
          title: "I Could Be The One",
          servingPath: "Avicii/dub-mix.flac",
        },
      ],
    });

    render(<LibraryScanCard />);
    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.alternates.discard }));

    expect(screen.getByText(/Avicii\/vocal-mix\.flac/)).toBeInTheDocument();
    expect(screen.getByText(/Avicii\/dub-mix\.flac/)).toBeInTheDocument();
  });

  it("says so when the library has never been scanned", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus({ lastRun: null }));

    render(<LibraryScanCard />);

    expect(screen.getByText(enSettings.libraryScan.run.never)).toBeInTheDocument();
  });

  it("reports a loading and an error state instead of an empty card", () => {
    statusQuery = createLoadingQuery<ScanStatus | undefined>();
    const { unmount } = render(<LibraryScanCard />);
    expect(screen.getByText(enSettings.jobs.card.loading)).toBeInTheDocument();
    unmount();

    statusQuery = createErrorQuery<ScanStatus | undefined>(new Error("boom"));
    render(<LibraryScanCard />);
    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });
});
