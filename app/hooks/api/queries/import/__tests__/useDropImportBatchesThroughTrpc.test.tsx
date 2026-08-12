import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { httpLink } from "@trpc/client";
import type { ReactNode } from "react";
import superjson from "superjson";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DropImportBatchStatus } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";

import { DROP_IMPORT_POLL_INTERVAL } from "../constants";
import { useDropImportBatches } from "../useDropImportBatches";

const server = {
  statuses: [] as string[],
  requests: 0,
};

function countingFetch(): Promise<Response> {
  server.requests += 1;
  const batches = server.statuses.map((status, index) => ({ id: `batch-${index}`, status }));
  const body = JSON.stringify({ result: { data: superjson.serialize(batches) } });
  return Promise.resolve(new Response(body, { status: 200, headers: { "content-type": "application/json" } }));
}

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const client = trpc.createClient({
    links: [httpLink({ url: "http://localhost/api/v1/trpc", transformer: superjson, fetch: countingFetch })],
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <trpc.Provider client={client} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </trpc.Provider>
    );
  };
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  server.statuses = [DropImportBatchStatus.enum.processing];
  server.requests = 0;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDropImportBatches over the real tRPC query wrapper", () => {
  it("reaches the transport again on every poll tick while a batch is in flight", async () => {
    renderHook(() => useDropImportBatches(), { wrapper: createWrapper() });
    await advance(0);
    expect(server.requests).toBe(1);

    await advance(DROP_IMPORT_POLL_INTERVAL + 50);
    expect(server.requests).toBe(2);

    await advance(DROP_IMPORT_POLL_INTERVAL + 50);
    expect(server.requests).toBe(3);
  });

  it("stops reaching the transport once the server reports every batch settled", async () => {
    server.statuses = [DropImportBatchStatus.enum.completed, DropImportBatchStatus.enum.partial];

    renderHook(() => useDropImportBatches(), { wrapper: createWrapper() });
    await advance(0);
    expect(server.requests).toBe(1);

    await advance(DROP_IMPORT_POLL_INTERVAL * 4);
    expect(server.requests).toBe(1);
  });
});
