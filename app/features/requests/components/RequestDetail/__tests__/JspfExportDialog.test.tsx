import { render, screen } from "@test/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestWithTracks } from "../../../__tests__/factories";
import { JspfExportDialog } from "../JspfExportDialog";

const { start, hookState, progressRef } = vi.hoisted(() => ({
  start: vi.fn(),
  hookState: { jobId: "job-1", isExporting: true },
  progressRef: { current: null as { processed: number; total: number } | null },
}));

vi.mock("../../../hooks/useJspfExportFull", () => ({
  useJspfExportFull: () => ({ jobId: hookState.jobId, start, isExporting: hookState.isExporting }),
}));

vi.mock("@hooks/api/subscriptions/usePortabilityProgress", () => ({
  usePortabilityProgress: () => progressRef.current,
}));

describe("JspfExportDialog", () => {
  beforeEach(() => {
    hookState.jobId = "job-1";
    hookState.isExporting = true;
    progressRef.current = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("starts the export when the dialog opens", () => {
    render(<JspfExportDialog request={makeRequestWithTracks()} open onOpenChange={vi.fn()} />);

    expect(start).toHaveBeenCalledOnce();
  });

  it("does not start the export while closed", () => {
    render(<JspfExportDialog request={makeRequestWithTracks()} open={false} onOpenChange={vi.fn()} />);

    expect(start).not.toHaveBeenCalled();
  });

  it("shows the preparing copy before any progress arrives", () => {
    render(<JspfExportDialog request={makeRequestWithTracks()} open onOpenChange={vi.fn()} />);

    expect(screen.getByText("Preparing export...")).toBeInTheDocument();
    expect(screen.getByText("Export (max compatibility)")).toBeInTheDocument();
  });

  it("shows the resolving counter once progress is reported", () => {
    progressRef.current = { processed: 3, total: 10 };
    render(<JspfExportDialog request={makeRequestWithTracks()} open onOpenChange={vi.fn()} />);

    expect(screen.getByText("Resolving 3/10")).toBeInTheDocument();
  });
});
