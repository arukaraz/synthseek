import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CollectionCoverage, ImportPreviewResult, TrackCoverage } from "../../types";

interface CommitReport {
  imported: number;
  failed: number;
}

const api = vi.hoisted(() => ({
  previewData: undefined as ImportPreviewResult | undefined,
  previewPending: false,
  previewError: null as Error | null,
  previewMutate: vi.fn(),
  previewReset: vi.fn(),
  commitPending: false,
  commitMutate: vi.fn(),
  commitReset: vi.fn(),
  commitReport: { imported: 2, failed: 0 } as CommitReport,
  commitFails: false,
}));

vi.mock("@hooks/api/mutations/portability/useImportPreview", () => ({
  useImportPreview: () => ({
    data: api.previewData,
    isPending: api.previewPending,
    error: api.previewError,
    mutate: api.previewMutate,
    reset: api.previewReset,
  }),
}));

vi.mock("@hooks/api/mutations/portability/useImportCommit", () => ({
  useImportCommit: () => ({
    isPending: api.commitPending,
    reset: api.commitReset,
    mutate: (input: unknown, options?: { onSuccess?: (report: CommitReport) => void; onError?: () => void }) => {
      api.commitMutate(input);
      if (api.commitFails) options?.onError?.();
      else options?.onSuccess?.(api.commitReport);
    },
  }),
}));

const dock = vi.hoisted(() => ({ seed: vi.fn(), setStatus: vi.fn() }));

vi.mock("@hooks/api/subscriptions", async () => {
  const dockModule = await vi.importActual<typeof import("@hooks/api/subscriptions/shared/progressDock")>(
    "@hooks/api/subscriptions/shared/progressDock"
  );
  return {
    buildDockItems: dockModule.buildDockItems,
    deriveTerminalStatus: dockModule.deriveTerminalStatus,
    seedDockJob: dock.seed,
    setDockJobStatus: dock.setStatus,
  };
});

import { useJspfImportFlow } from "../useJspfImportFlow";

function coverage(overrides: Partial<TrackCoverage> = {}): TrackCoverage {
  return {
    title: "Digital Love",
    artist: "Daft Punk",
    image: null,
    durationMs: 301_000,
    matched: true,
    method: "isrc",
    alreadyInLibrary: false,
    ...overrides,
  };
}

function collection(name: string, tracks: TrackCoverage[]): CollectionCoverage {
  return {
    name,
    type: "playlist",
    total: tracks.length,
    matched: tracks.filter((track) => track.matched).length,
    unmatched: tracks.filter((track) => !track.matched).length,
    alreadyInLibrary: tracks.filter((track) => track.alreadyInLibrary).length,
    tracks,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.previewData = undefined;
  api.previewPending = false;
  api.previewError = null;
  api.commitPending = false;
  api.commitFails = false;
  api.commitReport = { imported: 2, failed: 0 };
});

describe("the import flow", () => {
  it("starts on the source step with nothing chosen", () => {
    const { result } = renderHook(() => useJspfImportFlow(vi.fn()));

    expect(result.current.step).toBe("source");
    expect(result.current.preview).toBeUndefined();
    expect(result.current.selected.size).toBe(0);
  });

  it("moves to the preview and asks the server to read the file", () => {
    const { result } = renderHook(() => useJspfImportFlow(vi.fn()));

    act(() => {
      result.current.loadPayload("{}", "jspf", "mix.jspf");
    });

    expect(result.current.step).toBe("preview");
    expect(api.previewMutate).toHaveBeenCalledWith(
      expect.objectContaining({ content: "{}", format: "jspf", filename: "mix.jspf" })
    );
    expect(result.current.jobId).not.toBe("");
  });

  it("ticks every track the server matched, and leaves the rest alone", () => {
    api.previewData = {
      collections: [collection("Mix", [coverage(), coverage({ matched: false, method: "unmatched" })])],
    };

    const { result } = renderHook(() => useJspfImportFlow(vi.fn()));

    expect([...result.current.selected]).toEqual(["0:0"]);
  });

  it("lets the listener untick a track and tick it again", () => {
    api.previewData = { collections: [collection("Mix", [coverage()])] };
    const { result } = renderHook(() => useJspfImportFlow(vi.fn()));

    act(() => {
      result.current.toggleTrack(0, 0);
    });
    expect(result.current.selected.size).toBe(0);

    act(() => {
      result.current.toggleTrack(0, 0);
    });
    expect([...result.current.selected]).toEqual(["0:0"]);
  });

  it("reports the preview that is still running, and the reason one failed", () => {
    api.previewPending = true;
    api.previewError = new Error("That file is not a playlist");

    const { result } = renderHook(() => useJspfImportFlow(vi.fn()));

    expect(result.current.isPreviewing).toBe(true);
    expect(result.current.errorMessage).toBe("That file is not a playlist");
  });
});

describe("confirming the import", () => {
  beforeEach(() => {
    api.previewData = { collections: [collection("Mix", [coverage(), coverage({ title: "Aerodynamic" })])] };
  });

  it("does nothing before a file has been loaded", () => {
    const { result } = renderHook(() => useJspfImportFlow(vi.fn()));

    act(() => {
      result.current.confirm();
    });

    expect(api.commitMutate).not.toHaveBeenCalled();
  });

  it("sends only the tracks the listener left ticked", () => {
    const { result } = renderHook(() => useJspfImportFlow(vi.fn()));
    act(() => {
      result.current.loadPayload("{}", "jspf", "mix.jspf");
    });
    act(() => {
      result.current.toggleTrack(0, 1);
    });

    act(() => {
      result.current.confirm();
    });

    expect(api.commitMutate).toHaveBeenCalledWith(expect.objectContaining({ selection: [[0]] }));
  });

  it("puts the import on the progress dock before closing the modal", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useJspfImportFlow(onOpenChange));
    act(() => {
      result.current.loadPayload("{}", "jspf", "mix.jspf");
    });

    act(() => {
      result.current.confirm();
    });

    expect(dock.seed).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "file-import",
        status: "running",
        items: [{ key: "0", name: "Mix", state: "pending" }],
      })
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes the dock entry out as partial when some of the import landed and some did not", () => {
    api.commitReport = { imported: 1, failed: 1 };
    const { result } = renderHook(() => useJspfImportFlow(vi.fn()));
    act(() => {
      result.current.loadPayload("{}", "jspf", "mix.jspf");
    });

    act(() => {
      result.current.confirm();
    });

    expect(dock.setStatus).toHaveBeenCalledWith(result.current.jobId, "partial");
  });

  it("closes the dock entry out as complete when the whole import landed", () => {
    api.commitReport = { imported: 2, failed: 0 };
    const { result } = renderHook(() => useJspfImportFlow(vi.fn()));
    act(() => {
      result.current.loadPayload("{}", "jspf", "mix.jspf");
    });

    act(() => {
      result.current.confirm();
    });

    expect(dock.setStatus).toHaveBeenCalledWith(result.current.jobId, "complete");
  });

  it("closes the dock entry out as failed when nothing at all landed", () => {
    api.commitReport = { imported: 0, failed: 2 };
    const { result } = renderHook(() => useJspfImportFlow(vi.fn()));
    act(() => {
      result.current.loadPayload("{}", "jspf", "mix.jspf");
    });

    act(() => {
      result.current.confirm();
    });

    expect(dock.setStatus).toHaveBeenCalledWith(result.current.jobId, "failed");
  });

  it("marks the dock entry failed when the import never reached the server", () => {
    api.commitFails = true;
    const { result } = renderHook(() => useJspfImportFlow(vi.fn()));
    act(() => {
      result.current.loadPayload("{}", "jspf", "mix.jspf");
    });

    act(() => {
      result.current.confirm();
    });

    expect(dock.setStatus).toHaveBeenCalledWith(result.current.jobId, "failed");
  });

  it("reports the commit that is still running", () => {
    api.commitPending = true;

    const { result } = renderHook(() => useJspfImportFlow(vi.fn()));

    expect(result.current.isCommitting).toBe(true);
  });
});

describe("stepping back and starting over", () => {
  it("throws the preview away when the listener steps back to the source", () => {
    api.previewData = { collections: [collection("Mix", [coverage()])] };
    const { result } = renderHook(() => useJspfImportFlow(vi.fn()));
    act(() => {
      result.current.loadPayload("{}", "jspf", "mix.jspf");
    });

    act(() => {
      result.current.back();
    });

    expect(result.current.step).toBe("source");
    expect(api.previewReset).toHaveBeenCalled();
  });

  it("clears everything when the modal is opened again", () => {
    api.previewData = { collections: [collection("Mix", [coverage()])] };
    const { result } = renderHook(() => useJspfImportFlow(vi.fn()));
    act(() => {
      result.current.loadPayload("{}", "jspf", "mix.jspf");
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.step).toBe("source");
    expect(result.current.jobId).toBe("");
    expect(api.previewReset).toHaveBeenCalled();
    expect(api.commitReset).toHaveBeenCalled();
  });
});
