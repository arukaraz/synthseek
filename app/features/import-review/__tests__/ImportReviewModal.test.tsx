import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ImportReviewList } from "../types";

const spies = vi.hoisted(() => ({
  review: { data: undefined as ImportReviewList | undefined, isLoading: false, isError: false },
  glow: vi.fn(),
  clearGlow: vi.fn(),
}));

vi.mock("@hooks/api", () => ({
  useImportReview: () => spies.review,
}));

vi.mock("@utils/hash-target-glow", () => ({
  triggerHashTargetGlow: spies.glow,
  clearHashTargetGlow: spies.clearGlow,
}));

vi.mock("../components/ReviewCandidate", () => ({
  ReviewCandidate: ({
    item,
    siblings,
    onTogglePlay,
  }: {
    item: { id: string };
    siblings: number;
    onTogglePlay: (id: string) => void;
  }) => (
    <button type="button" onClick={() => onTogglePlay(item.id)}>{`candidate ${item.id} siblings ${siblings}`}</button>
  ),
}));

vi.mock("../components/ReviewFooter", () => ({
  ReviewFooter: ({ totalCount, totalBytes }: { totalCount: number; totalBytes: number }) => (
    <div>{`footer ${totalCount} ${totalBytes}`}</div>
  ),
}));

import { ImportReviewModal } from "../ImportReviewModal";
import { makeReviewItem } from "./factories";

function makeList(overrides: Partial<ImportReviewList> = {}): ImportReviewList {
  return { items: [], totalCount: 0, pendingCount: 0, totalBytes: 0, ...overrides };
}

function twoRequests(): ImportReviewList {
  return makeList({
    items: [
      makeReviewItem({ id: "held-1", track: { id: "track-1", title: "Beautiful" } }),
      makeReviewItem({ id: "held-2", reason: "duration_mismatch", track: { id: "track-1", title: "Beautiful" } }),
      makeReviewItem({
        id: "held-3",
        track: { id: "track-2", title: "Gasolina" },
        request: { id: "playlist-1", contentType: "playlist", name: "Reggaeton", artist: null },
      }),
    ],
    totalCount: 3,
    pendingCount: 3,
    totalBytes: 4096,
  });
}

describe("ImportReviewModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.review.data = makeList();
    spies.review.isLoading = false;
    spies.review.isError = false;
  });

  it("renders nothing while closed", () => {
    render(<ImportReviewModal open={false} onOpenChange={vi.fn()} focusTrackId={null} />);

    expect(screen.queryByText("Import review")).not.toBeInTheDocument();
  });

  it("shows the empty state when nothing is waiting", () => {
    render(<ImportReviewModal open onOpenChange={vi.fn()} focusTrackId={null} />);

    expect(screen.getByText("Nothing waiting for review")).toBeInTheDocument();
  });

  it("shows an error message when the queue fails to load", () => {
    spies.review.data = undefined;
    spies.review.isError = true;
    render(<ImportReviewModal open onOpenChange={vi.fn()} focusTrackId={null} />);

    expect(screen.getByText("Failed to load the review queue")).toBeInTheDocument();
  });

  it("groups the held files by request and then by track, and feeds the footer the totals", () => {
    spies.review.data = twoRequests();
    render(<ImportReviewModal open onOpenChange={vi.fn()} focusTrackId={null} />);

    expect(screen.getByText("Requested Album")).toBeInTheDocument();
    expect(screen.getByText("Album · Requested Artist · 1 track")).toBeInTheDocument();
    expect(screen.getByText("Reggaeton")).toBeInTheDocument();
    expect(screen.getByText("Playlist · 1 track")).toBeInTheDocument();

    const beautiful = screen.getByRole("article", { name: "Beautiful - Requested Artist" });
    expect(within(beautiful).getByText("2 files, pick one")).toBeInTheDocument();
    expect(within(beautiful).getByText("candidate held-1 siblings 1")).toBeInTheDocument();
    expect(within(beautiful).getByText("candidate held-2 siblings 1")).toBeInTheDocument();
    expect(beautiful).toHaveAttribute("data-anchor-target", "review-track-track-1");
    expect(screen.getByText("footer 3 4096")).toBeInTheDocument();
  });

  it("filters by reason without hiding how many siblings a track has", async () => {
    const user = userEvent.setup();
    spies.review.data = twoRequests();
    render(<ImportReviewModal open onOpenChange={vi.fn()} focusTrackId={null} />);

    await user.click(screen.getByRole("button", { name: /Duration mismatch/ }));

    expect(screen.queryByText("candidate held-1 siblings 1")).not.toBeInTheDocument();
    expect(screen.getByText("candidate held-2 siblings 1")).toBeInTheDocument();
    expect(screen.queryByText("Reggaeton")).not.toBeInTheDocument();
  });

  it("plays one file at a time in a shared player bar", async () => {
    const user = userEvent.setup();
    spies.review.data = twoRequests();
    const { baseElement } = render(<ImportReviewModal open onOpenChange={vi.fn()} focusTrackId={null} />);

    expect(baseElement.querySelector("audio")).toBeNull();
    await user.click(screen.getByText("candidate held-3 siblings 0"));
    expect(baseElement.querySelectorAll("audio")).toHaveLength(1);
    expect(baseElement.querySelector("audio")).toHaveAttribute("src", "/api/v1/review/held-3/audio");

    await user.click(screen.getByText("candidate held-1 siblings 1"));
    expect(baseElement.querySelectorAll("audio")).toHaveLength(1);
    expect(baseElement.querySelector("audio")).toHaveAttribute("src", "/api/v1/review/held-1/audio");

    await user.click(screen.getByText("candidate held-1 siblings 1"));
    expect(baseElement.querySelector("audio")).toBeNull();
  });

  it("shows the retry schedule once per track", () => {
    const nextRetryAt = new Date(Date.now() + 3.5 * 24 * 60 * 60 * 1000);
    spies.review.data = makeList({
      items: [
        makeReviewItem({ id: "held-1", track: { retryCount: 3, nextRetryAt } }),
        makeReviewItem({ id: "held-2", track: { retryCount: 3, nextRetryAt } }),
      ],
    });
    render(<ImportReviewModal open onOpenChange={vi.fn()} focusTrackId={null} />);

    expect(screen.getAllByText(/3 attempts/)).toHaveLength(1);
  });

  it("jumps to the track it was opened for", () => {
    spies.review.data = twoRequests();
    render(<ImportReviewModal open onOpenChange={vi.fn()} focusTrackId="track-2" />);

    expect(spies.glow).toHaveBeenCalledWith("review-track-track-2");
  });

  it("does not jump anywhere when opened from the queue button", () => {
    spies.review.data = twoRequests();
    render(<ImportReviewModal open onOpenChange={vi.fn()} focusTrackId={null} />);

    expect(spies.glow).not.toHaveBeenCalled();
  });
});
