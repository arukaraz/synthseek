import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ImportReviewList } from "../types";

const spies = vi.hoisted(() => ({
  review: { data: undefined as ImportReviewList | undefined, isLoading: false, isError: false },
}));

vi.mock("@hooks/api", () => ({
  useImportReview: () => spies.review,
}));

vi.mock("../components/ReviewItemRow", () => ({
  ReviewItemRow: ({ item }: { item: { id: string } }) => <li>{`row ${item.id}`}</li>,
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

describe("ImportReviewModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.review.data = makeList();
    spies.review.isLoading = false;
    spies.review.isError = false;
  });

  it("renders nothing while closed", () => {
    render(<ImportReviewModal open={false} onOpenChange={vi.fn()} />);

    expect(screen.queryByText("Import review")).not.toBeInTheDocument();
  });

  it("shows the empty state when nothing is waiting", () => {
    render(<ImportReviewModal open onOpenChange={vi.fn()} />);

    expect(screen.getByText("Nothing waiting for review")).toBeInTheDocument();
  });

  it("shows an error message when the queue fails to load", () => {
    spies.review.data = undefined;
    spies.review.isError = true;
    render(<ImportReviewModal open onOpenChange={vi.fn()} />);

    expect(screen.getByText("Failed to load the review queue")).toBeInTheDocument();
  });

  it("renders one row per held item and feeds the footer the totals", () => {
    spies.review.data = makeList({
      items: [makeReviewItem({ id: "held-1" }), makeReviewItem({ id: "held-2" })],
      totalCount: 2,
      pendingCount: 2,
      totalBytes: 4096,
    });
    render(<ImportReviewModal open onOpenChange={vi.fn()} />);

    expect(screen.getByText("row held-1")).toBeInTheDocument();
    expect(screen.getByText("row held-2")).toBeInTheDocument();
    expect(screen.getByText("footer 2 4096")).toBeInTheDocument();
  });
});
