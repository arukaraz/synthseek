import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const spies = vi.hoisted(() => ({
  approve: vi.fn(),
  discard: vi.fn(),
  togglePlay: vi.fn(),
}));

vi.mock("@hooks/api", () => ({
  useApproveHeldImport: () => ({ mutate: spies.approve, isPending: false }),
  useDiscardHeldImport: () => ({ mutate: spies.discard, isPending: false }),
}));

import { ReviewCandidate } from "../components/ReviewCandidate";
import type { ImportReviewItem } from "../types";
import { makeReviewItem } from "./factories";

function renderCandidate(item: ImportReviewItem, options: { siblings?: number; isPlaying?: boolean } = {}) {
  return render(
    <ReviewCandidate
      item={item}
      index={0}
      siblings={options.siblings ?? 0}
      isPlaying={options.isPlaying ?? false}
      onTogglePlay={spies.togglePlay}
    />
  );
}

describe("ReviewCandidate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("compares the requested artist and title against what the fingerprint found, marking the words that differ", () => {
    renderCandidate(makeReviewItem({ evidence: { artist: "Requested Tribute", title: "Requested Song" } }));

    const table = screen.getByRole("table");
    expect(within(table).getByRole("columnheader", { name: "Requested" })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: "This file" })).toBeInTheDocument();
    const artistRow = within(table).getByRole("row", { name: /Artist/ });
    expect(within(artistRow).getByText("Tribute").tagName).toBe("MARK");
    expect(within(artistRow).getByText("Artist", { selector: "del" })).toBeInTheDocument();
    expect(within(artistRow).queryByText("Requested", { selector: "del" })).not.toBeInTheDocument();
    expect(within(artistRow).getByText("differs")).toBeInTheDocument();
    const titleRow = within(table).getByRole("row", { name: /Title/ });
    expect(within(titleRow).getByText("matches")).toBeInTheDocument();
  });

  it("shows the artist similarity as a meter with its figure", () => {
    renderCandidate(makeReviewItem());

    const meter = screen.getByRole("meter", { name: "32 / 100 artist match" });
    expect(meter).toHaveAttribute("aria-valuenow", "32");
  });

  it("states the length difference for a duration mismatch", () => {
    renderCandidate(
      makeReviewItem({
        reason: "duration_mismatch",
        evidence: { artist: null, title: null, score: null, observedDurationMs: 250_000, expectedDurationMs: 210_000 },
      })
    );

    expect(screen.getByText("3:30")).toBeInTheDocument();
    expect(screen.getByText("4:10")).toBeInTheDocument();
    expect(screen.getByText("(+0:40)")).toBeInTheDocument();
  });

  it("falls back to the evidence sentence when no comparison was recorded", () => {
    renderCandidate(makeReviewItem({ reason: "verify_failed" }));

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(
      screen.getByText("This file was rejected before the granular checks started recording evidence.")
    ).toBeInTheDocument();
  });

  it("shows the original filename, the source, the peer and the size", () => {
    renderCandidate(makeReviewItem());

    expect(screen.getByText("peer-copy.flac")).toBeInTheDocument();
    expect(screen.getByText("Slskd")).toBeInTheDocument();
    expect(screen.getByText("peer-one")).toBeInTheDocument();
    expect(screen.getByText("12.0 MB")).toBeInTheDocument();
  });

  it("omits the peer when the source has none", () => {
    renderCandidate(makeReviewItem({ source: "ytdlp", sourceUsername: "" }));

    expect(screen.getByText("YouTube")).toBeInTheDocument();
    expect(screen.queryByText("peer-one")).not.toBeInTheDocument();
  });

  it("asks the shared player to play this file", async () => {
    const user = userEvent.setup();
    renderCandidate(makeReviewItem());

    await user.click(screen.getByRole("button", { name: "Play Requested Song - Requested Artist" }));

    expect(spies.togglePlay).toHaveBeenCalledWith("held-1");
  });

  it("offers to stop when this file is the one playing", () => {
    renderCandidate(makeReviewItem(), { isPlaying: true });

    expect(screen.getByRole("button", { name: "Stop playing Requested Song - Requested Artist" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("approves without a confirmation step", async () => {
    const user = userEvent.setup();
    renderCandidate(makeReviewItem());

    await user.click(screen.getByRole("button", { name: "Approve" }));

    expect(spies.approve).toHaveBeenCalledWith({ id: "held-1" });
  });

  it("says how many other files of the track an approval discards", () => {
    renderCandidate(makeReviewItem(), { siblings: 1 });

    const approve = screen.getByRole("button", { name: /Approve this file/ });
    expect(approve).toHaveTextContent("· discards 1 other");
  });

  it("discards only after a confirmation that names the track", async () => {
    const user = userEvent.setup();
    renderCandidate(makeReviewItem());

    await user.click(screen.getByRole("button", { name: "Discard" }));
    expect(spies.discard).not.toHaveBeenCalled();
    expect(screen.getByText("Discard the file for Requested Song?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Discard file" }));

    expect(spies.discard).toHaveBeenCalledWith({ id: "held-1" });
  });

  it("tells the confirmation that other files of the track still wait", async () => {
    const user = userEvent.setup();
    renderCandidate(makeReviewItem(), { siblings: 1 });

    await user.click(screen.getByRole("button", { name: "Discard" }));

    expect(
      screen.getByText(
        "The held copy is deleted and the source stays blocked. 1 other file for this track still waits for a decision."
      )
    ).toBeInTheDocument();
  });

  it("hides play and approve for a failed file and explains why", () => {
    renderCandidate(makeReviewItem({ status: "import_failed", error: "importFailedAfterMove" }));

    expect(screen.queryByRole("button", { name: /^Play / })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Discard" })).toBeInTheDocument();
    expect(
      screen.getByText("The held copy is gone, so discarding this entry is the only action left.")
    ).toBeInTheDocument();
  });

  it("disables the actions while the file is importing", () => {
    renderCandidate(makeReviewItem({ status: "importing" }));

    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Discard" })).toBeDisabled();
  });
});
