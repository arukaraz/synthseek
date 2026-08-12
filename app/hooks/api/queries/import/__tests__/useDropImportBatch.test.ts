import { DropImportBatchStatus } from "@api/__generated__/types";
import { renderHookWithProviders } from "@test/test-utils";
import { act } from "@testing-library/react";
import type { UseQueryOptions } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DROP_IMPORT_POLL_INTERVAL } from "../constants";
import { useDropImportBatch } from "../useDropImportBatch";

interface BatchPayload {
  id: string;
  status: string;
}

type BatchQueryOptions = Omit<UseQueryOptions<BatchPayload>, "queryKey" | "queryFn">;

const server = vi.hoisted(() => ({
  status: "processing",
  fetchCount: 0,
}));

vi.mock("@utils/trpc", async () => {
  const { useQuery } = await import("@tanstack/react-query");

  return {
    trpc: {
      import: {
        getBatch: {
          useQuery: (input: { batchId: string }, options: BatchQueryOptions) =>
            useQuery<BatchPayload>({
              queryKey: ["import.getBatch", input.batchId],
              queryFn: () => {
                server.fetchCount += 1;
                return { id: input.batchId, status: server.status };
              },
              ...options,
            }),
        },
      },
    },
  };
});

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  server.status = DropImportBatchStatus.enum.processing;
  server.fetchCount = 0;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDropImportBatch", () => {
  it("keeps polling while the batch is in flight and stops once it settles", async () => {
    const view = renderHookWithProviders(() => useDropImportBatch("batch-1"));
    await advance(0);
    expect(server.fetchCount).toBe(1);

    await advance(DROP_IMPORT_POLL_INTERVAL + 50);
    expect(server.fetchCount).toBe(2);

    await advance(DROP_IMPORT_POLL_INTERVAL + 50);
    expect(server.fetchCount).toBe(3);

    server.status = DropImportBatchStatus.enum.partial;
    await advance(DROP_IMPORT_POLL_INTERVAL + 50);
    expect(server.fetchCount).toBe(4);
    expect(view.result.current.data?.status).toBe(DropImportBatchStatus.enum.partial);

    await advance(DROP_IMPORT_POLL_INTERVAL * 4);
    expect(server.fetchCount).toBe(4);
  });

  it("recovers a view frozen on stale in-flight data when every push event was missed", async () => {
    const view = renderHookWithProviders(() => useDropImportBatch("batch-1"));
    await advance(0);
    expect(view.result.current.data?.status).toBe(DropImportBatchStatus.enum.processing);

    server.status = DropImportBatchStatus.enum.partial;

    await advance(DROP_IMPORT_POLL_INTERVAL + 50);
    expect(view.result.current.data?.status).toBe(DropImportBatchStatus.enum.partial);
  });

  it("keeps polling a status this build does not know, rather than freezing on it", async () => {
    server.status = "archived";

    renderHookWithProviders(() => useDropImportBatch("batch-1"));
    await advance(0);
    expect(server.fetchCount).toBe(1);

    await advance(DROP_IMPORT_POLL_INTERVAL + 50);
    expect(server.fetchCount).toBe(2);
  });

  it("never polls a batch that is already terminal on first load", async () => {
    server.status = DropImportBatchStatus.enum.completed;

    renderHookWithProviders(() => useDropImportBatch("batch-1"));
    await advance(0);
    expect(server.fetchCount).toBe(1);

    await advance(DROP_IMPORT_POLL_INTERVAL * 4);
    expect(server.fetchCount).toBe(1);
  });

  it("never polls while no batch is selected", async () => {
    renderHookWithProviders(() => useDropImportBatch(null));
    await advance(DROP_IMPORT_POLL_INTERVAL * 4);
    expect(server.fetchCount).toBe(0);
  });
});
