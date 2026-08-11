import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const spies = vi.hoisted(() => ({
  approve: vi.fn(),
  discard: vi.fn(),
}));

vi.mock("@hooks/api", () => ({
  useApproveHeldImport: () => ({ mutate: spies.approve, isPending: false }),
  useDiscardHeldImport: () => ({ mutate: spies.discard, isPending: false }),
}));

import { ReviewItemRow } from "../components/ReviewItemRow";
import { makeReviewItem } from "./factories";

describe("ReviewItemRow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the expected track, the reason badge and the fingerprint evidence sentence", () => {
    render(<ReviewItemRow item={makeReviewItem()} />);

    expect(screen.getByText("Requested Song - Requested Artist")).toBeInTheDocument();
    expect(screen.getByText("Fingerprint mismatch")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The audio fingerprints as Artist X - Song Y, which scores 32 out of 100 for similarity against the track you requested."
      )
    ).toBeInTheDocument();
  });

  it("renders the tag-confidence sentence for a tag mismatch", () => {
    render(
      <ReviewItemRow
        item={makeReviewItem({
          reason: "tag_mismatch",
          evidence: { artist: null, title: null, score: null, observedConfidence: 41, expectedConfidence: 60 },
        })}
      />
    );

    expect(
      screen.getByText("The file tags scored 41 out of 100 for confidence, below the 60 this check requires.")
    ).toBeInTheDocument();
  });

  it("renders the runtime comparison for a duration mismatch", () => {
    render(
      <ReviewItemRow
        item={makeReviewItem({
          reason: "duration_mismatch",
          evidence: {
            artist: null,
            title: null,
            score: null,
            observedDurationMs: 250_000,
            expectedDurationMs: 210_000,
          },
        })}
      />
    );

    expect(screen.getByText("The audio runs 4:10 while the requested track runs 3:30.")).toBeInTheDocument();
  });

  it("shows the original filename, the source, the peer and the size", () => {
    render(<ReviewItemRow item={makeReviewItem()} />);

    expect(screen.getByText("peer-copy.flac")).toBeInTheDocument();
    expect(screen.getByText("Soulseek")).toBeInTheDocument();
    expect(screen.getByText("peer-one")).toBeInTheDocument();
    expect(screen.getByText("12.0 MB")).toBeInTheDocument();
  });

  it("omits the peer when the source has none", () => {
    render(<ReviewItemRow item={makeReviewItem({ source: "ytdlp", sourceUsername: "" })} />);

    expect(screen.getByText("YouTube")).toBeInTheDocument();
    expect(screen.queryByText("peer-one")).not.toBeInTheDocument();
  });

  it("shows the next scheduled attempt and the attempt count when the track has them", () => {
    const nextRetryAt = new Date(Date.now() + 3.5 * 24 * 60 * 60 * 1000);
    render(<ReviewItemRow item={makeReviewItem({ track: { retryCount: 3, nextRetryAt } })} />);

    expect(screen.getByRole("button", { name: /watching this track/i })).toBeInTheDocument();
    expect(screen.getByText(/3 attempts/)).toBeInTheDocument();
  });

  it("offers no retry alongside the schedule, the held copy is decided first", () => {
    const nextRetryAt = new Date(Date.now() + 3.5 * 24 * 60 * 60 * 1000);
    render(<ReviewItemRow item={makeReviewItem({ track: { retryCount: 3, nextRetryAt } })} />);

    expect(screen.queryByRole("button", { name: "Retry now" })).not.toBeInTheDocument();
  });

  it("reveals an audio element pointed at the review endpoint when play is pressed", async () => {
    const user = userEvent.setup();
    const { container } = render(<ReviewItemRow item={makeReviewItem()} />);

    expect(container.querySelector("audio")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Play Requested Song - Requested Artist" }));

    expect(container.querySelector("audio")).toHaveAttribute("src", "/api/v1/review/held-1/audio");
    expect(screen.getByRole("button", { name: "Stop playing Requested Song - Requested Artist" })).toBeInTheDocument();
  });

  it("approves without a confirmation step", async () => {
    const user = userEvent.setup();
    render(<ReviewItemRow item={makeReviewItem()} />);

    await user.click(screen.getByRole("button", { name: "Approve" }));

    expect(spies.approve).toHaveBeenCalledWith({ id: "held-1" });
  });

  it("discards only after the confirmation is accepted", async () => {
    const user = userEvent.setup();
    render(<ReviewItemRow item={makeReviewItem()} />);

    await user.click(screen.getByRole("button", { name: "Discard" }));
    expect(spies.discard).not.toHaveBeenCalled();
    expect(screen.getByText("Discard this file?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Discard file" }));

    expect(spies.discard).toHaveBeenCalledWith({ id: "held-1" });
  });

  it("hides play and approve for a failed row and explains why", () => {
    render(<ReviewItemRow item={makeReviewItem({ status: "import_failed", error: "importFailedAfterMove" })} />);

    expect(screen.queryByRole("button", { name: /^Play / })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Discard" })).toBeInTheDocument();
    expect(
      screen.getByText("The held copy is gone, so discarding this entry is the only action left.")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "The import failed after the file was moved into the library, so the held copy no longer exists."
      )
    ).toBeInTheDocument();
  });

  it("disables the actions while the row is importing", () => {
    render(<ReviewItemRow item={makeReviewItem({ status: "importing" })} />);

    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Discard" })).toBeDisabled();
  });
});
