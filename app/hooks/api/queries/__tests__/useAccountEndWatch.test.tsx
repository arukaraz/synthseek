import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { getQueryKey } from "@trpc/react-query";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { trpc } from "@utils/trpc";

import { useAccountEndWatch } from "../useAccountEndWatch";

const ME_KEY = getQueryKey(trpc.auth.me, undefined, "query");
const DETAIL_KEY = getQueryKey(trpc.contentDetail.albumDetail, { catalogAlbumId: "a1" }, "query");
const STATE_KEY = getQueryKey(trpc.theme.state, undefined, "query");
const ON_SCREEN_KEY = ["on-screen"];

interface Visitor {
  account: string | null;
  settled: boolean;
}

function setup(first: Visitor, seed: (queryClient: QueryClient) => void = () => undefined) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  seed(queryClient);
  const asked = vi.fn(async () => "asked again");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const view = renderHook(
    ({ account, settled }: Visitor) => {
      const onScreen = useQuery({ queryKey: ON_SCREEN_KEY, queryFn: asked });
      useAccountEndWatch(account, settled);
      return onScreen;
    },
    { wrapper, initialProps: first }
  );
  return { queryClient, asked, view };
}

function seedAccount(queryClient: QueryClient) {
  queryClient.setQueryData(ME_KEY, { id: "u1" });
  queryClient.setQueryData(DETAIL_KEY, { title: "kept for u1" });
  queryClient.setQueryData(STATE_KEY, { theme: "custom" });
  queryClient.setQueryData(ON_SCREEN_KEY, "u1 on screen");
}

describe("useAccountEndWatch", () => {
  it("empties every answer but who is signed in once the account signs out, and asks again for what is on screen", async () => {
    const { queryClient, asked, view } = setup({ account: "u1", settled: true }, seedAccount);
    expect(view.result.current.data).toBe("u1 on screen");
    expect(asked).not.toHaveBeenCalled();

    queryClient.setQueryData(ME_KEY, null);
    view.rerender({ account: null, settled: true });

    await waitFor(() => expect(view.result.current.data).toBe("asked again"));
    expect(queryClient.getQueryData(DETAIL_KEY)).toBeUndefined();
    expect(queryClient.getQueryData(STATE_KEY)).toBeUndefined();
    expect(queryClient.getQueryData(ME_KEY)).toBeNull();
    expect(asked).toHaveBeenCalledTimes(1);
  });

  it("empties them when another account takes its place", async () => {
    const { queryClient, view } = setup({ account: "u1", settled: true }, seedAccount);

    queryClient.setQueryData(ME_KEY, { id: "u2" });
    view.rerender({ account: "u2", settled: true });

    await waitFor(() => expect(view.result.current.data).toBe("asked again"));
    expect(queryClient.getQueryData(DETAIL_KEY)).toBeUndefined();
    expect(queryClient.getQueryData(ME_KEY)).toEqual({ id: "u2" });
  });

  it("keeps them while the same account stays and while who is signed in is not settled", async () => {
    const { queryClient, asked, view } = setup({ account: "u1", settled: true }, seedAccount);

    view.rerender({ account: "u1", settled: true });
    view.rerender({ account: null, settled: false });
    await act(async () => undefined);

    expect(queryClient.getQueryData(DETAIL_KEY)).toEqual({ title: "kept for u1" });
    expect(view.result.current.data).toBe("u1 on screen");
    expect(asked).not.toHaveBeenCalled();
  });

  it("empties what the browser kept from an earlier visit when the visitor arrives signed out, and leaves what is on screen", async () => {
    const { queryClient, asked, view } = setup({ account: null, settled: true }, (client) => {
      client.setQueryData(DETAIL_KEY, { title: "kept for whoever was here" });
      client.setQueryData(ON_SCREEN_KEY, "public on screen");
    });
    await act(async () => undefined);

    expect(queryClient.getQueryData(DETAIL_KEY)).toBeUndefined();
    expect(view.result.current.data).toBe("public on screen");
    expect(asked).not.toHaveBeenCalled();
  });

  it("keeps what was fetched since when the visitor then signs in", async () => {
    const { queryClient, asked, view } = setup({ account: null, settled: true });
    await waitFor(() => expect(view.result.current.data).toBe("asked again"));
    queryClient.setQueryData(DETAIL_KEY, { title: "fetched at sign in" });

    queryClient.setQueryData(ME_KEY, { id: "u1" });
    view.rerender({ account: "u1", settled: true });
    await act(async () => undefined);

    expect(queryClient.getQueryData(DETAIL_KEY)).toEqual({ title: "fetched at sign in" });
    expect(asked).toHaveBeenCalledTimes(1);
  });

  it("takes the first account it sees as the owner of what the browser kept", async () => {
    const { queryClient, asked, view } = setup({ account: "u1", settled: true }, seedAccount);
    await act(async () => undefined);

    expect(queryClient.getQueryData(DETAIL_KEY)).toEqual({ title: "kept for u1" });
    expect(view.result.current.data).toBe("u1 on screen");
    expect(asked).not.toHaveBeenCalled();
  });
});
