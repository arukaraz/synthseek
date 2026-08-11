import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const spies = vi.hoisted(() => ({
  isAdmin: true,
  pendingCount: 3,
  totalCount: 3,
  useImportReview: vi.fn(),
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: spies.isAdmin, currentUser: null, isLoading: false }),
}));

vi.mock("@hooks/api", () => ({
  useImportReview: (options?: { enabled?: boolean }) => {
    spies.useImportReview(options);
    return {
      data: { items: [], totalCount: spies.totalCount, pendingCount: spies.pendingCount, totalBytes: 0 },
    };
  },
}));

vi.mock("@features/import-review", () => ({
  ImportReviewModal: ({ open }: { open: boolean }) => (open ? <div>review modal</div> : null),
}));

import { ReviewQueueButton } from "../ReviewQueueButton";

describe("ReviewQueueButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.isAdmin = true;
    spies.pendingCount = 3;
    spies.totalCount = 3;
  });

  it("shows the badge with the pending count", () => {
    render(<ReviewQueueButton />);

    const trigger = screen.getByRole("button", { name: "Import review, 3 files waiting for a decision" });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("3");
  });

  it("uses the singular label for a single pending file", () => {
    spies.pendingCount = 1;
    spies.totalCount = 1;
    render(<ReviewQueueButton />);

    expect(screen.getByRole("button", { name: "Import review, 1 file waiting for a decision" })).toBeInTheDocument();
  });

  it("still offers the queue when every held row is terminal, without an alarming count", () => {
    spies.pendingCount = 0;
    spies.totalCount = 2;
    render(<ReviewQueueButton />);

    const trigger = screen.getByRole("button", { name: "Import review, 2 held files need attention" });
    expect(trigger).toBeInTheDocument();
    expect(trigger).not.toHaveTextContent("0");
  });

  it("stays reachable on an empty queue, so the feature is discoverable before it ever fires", () => {
    spies.pendingCount = 0;
    spies.totalCount = 0;
    render(<ReviewQueueButton />);

    const trigger = screen.getByRole("button", { name: "Import review" });
    expect(trigger).toBeInTheDocument();
    expect(trigger).not.toHaveTextContent("0");
  });

  it("opens itself when the page is reached at the review hash", () => {
    window.location.hash = "#review";
    render(<ReviewQueueButton />);

    expect(screen.getByText("review modal")).toBeInTheDocument();
    window.location.hash = "";
  });

  it("ignores an unrelated hash", () => {
    window.location.hash = "#ban-threshold";
    render(<ReviewQueueButton />);

    expect(screen.queryByText("review modal")).not.toBeInTheDocument();
    window.location.hash = "";
  });

  it("does not open from the hash for a member", () => {
    spies.isAdmin = false;
    window.location.hash = "#review";
    render(<ReviewQueueButton />);

    expect(screen.queryByText("review modal")).not.toBeInTheDocument();
    window.location.hash = "";
  });

  it("renders nothing for a member", () => {
    spies.isAdmin = false;
    render(<ReviewQueueButton />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("never fires the admin-only review query for a member", () => {
    spies.isAdmin = false;
    render(<ReviewQueueButton />);

    expect(spies.useImportReview).toHaveBeenCalledWith({ enabled: false });
  });

  it("enables the review query for an admin", () => {
    render(<ReviewQueueButton />);

    expect(spies.useImportReview).toHaveBeenCalledWith({ enabled: true });
  });

  it("opens the review modal", async () => {
    const user = userEvent.setup();
    render(<ReviewQueueButton />);

    expect(screen.queryByText("review modal")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Import review, 3 files waiting for a decision" }));

    expect(screen.getByText("review modal")).toBeInTheDocument();
  });

  it("keeps the open modal mounted after the last held row is decided", async () => {
    const user = userEvent.setup();
    spies.pendingCount = 1;
    spies.totalCount = 1;
    const { rerender } = render(<ReviewQueueButton />);

    await user.click(screen.getByRole("button", { name: "Import review, 1 file waiting for a decision" }));
    expect(screen.getByText("review modal")).toBeInTheDocument();

    spies.pendingCount = 0;
    spies.totalCount = 0;
    rerender(<ReviewQueueButton />);

    expect(screen.getByText("review modal")).toBeInTheDocument();
  });
});
