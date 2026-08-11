import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DropImportBatch } from "../types";

const spies = vi.hoisted(() => ({
  listQuery: { data: undefined as unknown, isLoading: false, isError: false },
  deleteMutate: vi.fn(),
}));

vi.mock("@hooks/api", () => ({
  useDropImportBatches: () => spies.listQuery,
  useDeleteDropImportBatch: () => ({ mutate: spies.deleteMutate, isPending: false }),
}));

import { BatchList } from "../components/BatchList";

function makeBatch(overrides: Partial<DropImportBatch> = {}): DropImportBatch {
  return {
    id: "batch-1",
    user_id: "user-1",
    status: "completed",
    total_files: 4,
    imported_files: 4,
    already_in_library_files: 0,
    pending_files: 0,
    failed_files: 0,
    discarded_files: 0,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

describe("BatchList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.listQuery.data = [makeBatch()];
    spies.listQuery.isLoading = false;
    spies.listQuery.isError = false;
  });

  it("renders an empty label when there are no batches", () => {
    spies.listQuery.data = [];
    render(<BatchList onOpenBatch={vi.fn()} />);

    expect(screen.getByText("No uploads yet.")).toBeInTheDocument();
  });

  it("opens a batch from its row", async () => {
    const user = userEvent.setup();
    const onOpenBatch = vi.fn();
    render(<BatchList onOpenBatch={onOpenBatch} />);

    await user.click(screen.getByRole("button", { name: "Open batch of 4 files" }));

    expect(onOpenBatch).toHaveBeenCalledWith("batch-1");
  });

  it("deletes a batch after confirmation", async () => {
    const user = userEvent.setup();
    render(<BatchList onOpenBatch={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Delete batch" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(spies.deleteMutate).toHaveBeenCalledWith({ batchId: "batch-1" });
  });

  it("disables delete while the batch is processing", () => {
    spies.listQuery.data = [makeBatch({ status: "processing", imported_files: 1 })];
    render(<BatchList onOpenBatch={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Delete batch" })).toBeDisabled();
  });
});
