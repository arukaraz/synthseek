import { DropImportBatchStatus } from "@api/__generated__/types";
import { renderHookWithProviders } from "@test/test-utils";
import { act } from "@testing-library/react";
import type { UseQueryOptions } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DROP_IMPORT_POLL_INTERVAL } from "../constants";
import { useDropImportBatches } from "../useDropImportBatches";

interface BatchRow {
  id: string;
  status: string;
}

type BatchesQueryOptions = Omit<UseQueryOptions<BatchRow[]>, "queryKey" | "queryFn">;

const server = vi.hoisted(() => ({
  statuses: ["processing"],
  fetchCount: 0,
}));

vi.mock("@utils/trpc", async () => {
  const { useQuery } = await import("@tanstack/react-query");

  return {
    trpc: {
      import: {
        listBatches: {
          useQuery: (_input: undefined, options: BatchesQueryOptions) =>
            useQuery<BatchRow[]>({
              queryKey: ["import.listBatches"],
              queryFn: () => {
                server.fetchCount += 1;
                return server.statuses.map((status, index) => ({ id: `batch-${index}`, status }));
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
  server.statuses = [DropImportBatchStatus.enum.completed, DropImportBatchStatus.enum.processing];
  server.fetchCount = 0;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDropImportBatches", () => {
  it("polls while any listed batch is in flight and stops once they all settle", async () => {
    renderHookWithProviders(() => useDropImportBatches());
    await advance(0);
    expect(server.fetchCount).toBe(1);

    await advance(DROP_IMPORT_POLL_INTERVAL + 50);
    expect(server.fetchCount).toBe(2);

    server.statuses = [DropImportBatchStatus.enum.completed, DropImportBatchStatus.enum.partial];
    await advance(DROP_IMPORT_POLL_INTERVAL + 50);
    expect(server.fetchCount).toBe(3);

    await advance(DROP_IMPORT_POLL_INTERVAL * 4);
    expect(server.fetchCount).toBe(3);
  });

  it("never polls a list where every batch is already terminal", async () => {
    server.statuses = [DropImportBatchStatus.enum.completed, DropImportBatchStatus.enum.failed];

    renderHookWithProviders(() => useDropImportBatches());
    await advance(0);
    expect(server.fetchCount).toBe(1);

    await advance(DROP_IMPORT_POLL_INTERVAL * 4);
    expect(server.fetchCount).toBe(1);
  });

  it("keeps polling a status this build does not know, rather than freezing on it", async () => {
    server.statuses = [DropImportBatchStatus.enum.completed, "archived"];

    renderHookWithProviders(() => useDropImportBatches());
    await advance(0);
    expect(server.fetchCount).toBe(1);

    await advance(DROP_IMPORT_POLL_INTERVAL + 50);
    expect(server.fetchCount).toBe(2);
  });

  it("never polls an empty list", async () => {
    server.statuses = [];

    renderHookWithProviders(() => useDropImportBatches());
    await advance(0);
    expect(server.fetchCount).toBe(1);

    await advance(DROP_IMPORT_POLL_INTERVAL * 4);
    expect(server.fetchCount).toBe(1);
  });

  it("never polls while disabled", async () => {
    renderHookWithProviders(() => useDropImportBatches({ enabled: false }));
    await advance(DROP_IMPORT_POLL_INTERVAL * 4);
    expect(server.fetchCount).toBe(0);
  });
});
