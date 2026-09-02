import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, createLoadingQuery, createErrorQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

type ScanRun = {
  state: string;
  walkClean: boolean;
  walkFailures: number;
  terminalCode: string | null;
  startedAt: Date;
  finishedAt: Date | null;
};

type ScanStatus = {
  identifyRunning: boolean;
  reclaimRunning: boolean;
  activeRun: ScanRun | null;
  lastRun: ScanRun | null;
  inventory: {
    indexedFiles: number;
    linkedFiles: number;
    unlinkedFiles: number;
    missingFiles: number;
  };
};

let statusQuery: MockQueryResult<ScanStatus | undefined> = createMockQuery<ScanStatus | undefined>(undefined);
const cancelMutate = vi.fn();
const triggerMutate = vi.fn();

vi.mock("@hooks/api/mutations/jobs/useTriggerJob", () => ({
  useTriggerJob: () => ({ mutate: triggerMutate, isPending: false }),
}));

vi.mock("@hooks/api/queries/useLibraryScanStatus", () => ({
  useLibraryScanStatus: () => statusQuery,
  useDuplicateGroups: () => createMockQuery({ groups: [], totalBytes: 0 }),
}));

vi.mock("@hooks/api/mutations/jobs/useLibraryScanControls", () => ({
  useCancelLibraryScan: () => ({ mutate: cancelMutate, isPending: false }),
  useKeepThisCopy: () => ({ mutate: vi.fn(), isPending: false }),
  useKeepBestLibraryCopies: () => ({ mutate: vi.fn(), isPending: false }),
  useKeepBestLibraryCopy: () => ({ mutate: vi.fn(), isPending: false }),
}));

import { LibraryScanCard } from "../LibraryScanCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  statusQuery = createMockQuery<ScanStatus | undefined>(undefined);
});

function makeRun(overrides: Partial<ScanRun> = {}): ScanRun {
  return {
    state: "completed",
    walkClean: true,
    walkFailures: 0,
    terminalCode: null,
    startedAt: new Date(Date.now() - 10 * 60 * 1000),
    finishedAt: new Date(Date.now() - 9 * 60 * 1000),
    ...overrides,
  };
}

function makeStatus(overrides: Partial<ScanStatus> = {}): ScanStatus {
  return {
    identifyRunning: false,
    reclaimRunning: false,
    activeRun: null,
    lastRun: makeRun(),
    inventory: {
      indexedFiles: 8334,
      linkedFiles: 5451,
      unlinkedFiles: 2883,
      missingFiles: 0,
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

  it("no longer offers duplicates here, since Maintenance owns them and counts tracks not copies", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());

    render(<LibraryScanCard />);

    expect(screen.queryByRole("button", { name: "325" })).not.toBeInTheDocument();
    expect(screen.queryByText(/3\.1 GB/)).not.toBeInTheDocument();
  });

  it("says in the header how long ago the last scan finished", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());

    render(<LibraryScanCard />);

    expect(screen.getByText(/ran /i)).toBeInTheDocument();
  });

  it("says so when the library has never been scanned", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus({ lastRun: null }));

    render(<LibraryScanCard />);

    expect(screen.getByText(enSettings.libraryScan.header.never)).toBeInTheDocument();
  });

  it("no longer prints the indexed size, the format tally or the orphan count", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());

    render(<LibraryScanCard />);

    expect(screen.queryByText(/indexed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/MP3/)).not.toBeInTheDocument();
    expect(screen.queryByText(/no file on disk/i)).not.toBeInTheDocument();
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

  it("starts a scan from the card itself", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());

    render(<LibraryScanCard />);

    fireEvent.click(screen.getByRole("button", { name: /run .*library scan/i }));

    expect(triggerMutate).toHaveBeenCalledWith({ id: "library-scan" }, expect.anything());
  });

  it("shows the run button as busy while a scan is in flight, not merely while the click resolves", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus({ activeRun: makeRun({ state: "scanning" }) }));

    render(<LibraryScanCard />);

    const button = screen.getByRole("button", { name: /running library scan/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText(enSettings.libraryScan.header.running)).toBeInTheDocument();
  });

  it("shows the button busy while identification is working, even with no disk walk in flight", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus({ identifyRunning: true, activeRun: null }));

    render(<LibraryScanCard />);

    const button = screen.getByRole("button", { name: /running library scan/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText(enSettings.libraryScan.header.identifying)).toBeInTheDocument();
  });

  it("says it is scanning, not identifying, while the disk walk is the part that is running", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(
      makeStatus({ activeRun: makeRun({ state: "scanning" }), identifyRunning: true })
    );

    render(<LibraryScanCard />);

    expect(screen.getByText(enSettings.libraryScan.header.running)).toBeInTheDocument();
    expect(screen.queryByText(enSettings.libraryScan.header.identifying)).not.toBeInTheDocument();
  });

  it("shows the button busy while duplicates are being settled, since a scan would refuse to start", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus({ reclaimRunning: true }));

    render(<LibraryScanCard />);

    expect(screen.getByRole("button", { name: /running library scan/i })).toBeDisabled();
  });

  it("offers cancelling only while a scan is running", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());
    const { unmount } = render(<LibraryScanCard />);
    expect(screen.queryByRole("button", { name: enSettings.libraryScan.actions.cancel })).not.toBeInTheDocument();
    unmount();

    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus({ activeRun: makeRun({ state: "scanning" }) }));
    render(<LibraryScanCard />);

    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.actions.cancel }));
    expect(cancelMutate).toHaveBeenCalled();
  });

  it("reports a load failure instead of rendering an empty card", () => {
    statusQuery = createErrorQuery<ScanStatus | undefined>(new Error("boom"));

    render(<LibraryScanCard />);

    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });

  it("shows a loading note while the status is still coming", () => {
    statusQuery = createLoadingQuery<ScanStatus | undefined>();

    render(<LibraryScanCard />);

    expect(screen.getByText(enSettings.jobs.card.loading)).toBeInTheDocument();
  });
});
