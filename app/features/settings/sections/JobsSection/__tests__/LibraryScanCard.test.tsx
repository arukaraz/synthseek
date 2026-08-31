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
const cancelMutate = vi.fn();

vi.mock("@hooks/api/queries/useLibraryScanStatus", () => ({
  useLibraryScanStatus: () => statusQuery,
  useUnlinkedLibraryFiles: () => unlinkedQuery,
}));

vi.mock("@hooks/api/mutations/jobs/useLibraryScanControls", () => ({
  useCancelLibraryScan: () => ({ mutate: cancelMutate, isPending: false }),
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

  it("names the files it could not read, when there were any", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus({ lastRun: makeRun({ filesFailed: 7 }) }));

    render(<LibraryScanCard />);

    expect(screen.getByText(/7 unreadable/)).toBeInTheDocument();
  });

  it("says nothing about unreadable files when there were none", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());

    render(<LibraryScanCard />);

    expect(screen.queryByText(/unreadable/)).not.toBeInTheDocument();
  });

  it("shows why a run ended when it carries a terminal code", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(
      makeStatus({ lastRun: makeRun({ state: "failed", terminalCode: "SCAN_ERROR" }) })
    );

    render(<LibraryScanCard />);

    expect(screen.getByText(/SCAN_ERROR/)).toBeInTheDocument();
  });

  it("previews the files nothing has claimed yet", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());
    unlinkedQuery = createMockQuery<UnlinkedFiles | undefined>({
      total: 2883,
      items: [
        { id: "f1", relativePath: "HIM/solo.flac", title: "Join Me", artistName: "HIM", albumTitle: "Razorblade" },
        { id: "f2", relativePath: "loose/track.mp3", title: null, artistName: null, albumTitle: null },
      ],
    });

    render(<LibraryScanCard />);

    expect(screen.getByText("HIM - Join Me (Razorblade)")).toBeInTheDocument();
    expect(screen.getByText("loose/track.mp3")).toBeInTheDocument();
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

  it("leaves starting a scan to the jobs list, so there is only one way to do it", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());

    render(<LibraryScanCard />);

    expect(screen.queryByRole("button", { name: /scan now/i })).not.toBeInTheDocument();
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
