import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

type Settle = (value: unknown) => void;

const pending = vi.hoisted((): { reads: Record<string, Settle[]>; writes: Settle[]; refusals: Settle[] } => ({
  reads: {},
  writes: [],
  refusals: [],
}));
const errorToast = vi.hoisted(() => vi.fn());

vi.mock("@modules/errors", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@modules/errors")>()),
  errorToast,
}));
vi.mock("@utils/trpc", async () => {
  const { useMutation, useQuery, useQueryClient } = await import("@tanstack/react-query");
  const keyOf = (name: string) => ["theme", name];
  const read = (name: string) => ({
    useQuery: (_input: unknown, options: object) =>
      useQuery({
        queryKey: keyOf(name),
        queryFn: () =>
          new Promise<unknown>((resolve) => {
            pending.reads[name] = [...(pending.reads[name] ?? []), resolve];
          }),
        ...options,
      }),
  });
  const write = {
    useMutation: (options: object) =>
      useMutation({
        mutationFn: () =>
          new Promise<unknown>((resolve, reject) => {
            pending.writes.push(resolve);
            pending.refusals.push(reject);
          }),
        ...options,
      }),
  };
  return {
    trpc: {
      useUtils: () => {
        const client = useQueryClient();
        const cache = (name: string) => ({
          cancel: () => client.cancelQueries({ queryKey: keyOf(name) }),
          setData: (_input: unknown, data: unknown) => client.setQueryData(keyOf(name), data),
          invalidate: () => client.invalidateQueries({ queryKey: keyOf(name) }),
        });
        return {
          theme: { state: cache("state"), files: cache("files"), history: cache("history"), fonts: cache("fonts") },
        };
      },
      theme: {
        state: read("state"),
        fonts: read("fonts"),
        select: write,
        save: write,
        removeFont: write,
        check: write,
        checkImport: write,
      },
    },
  };
});

import { useThemeFonts, useThemeState } from "@hooks/api/queries/theme";

import { useRemoveThemeFont, useSaveTheme, useSelectTheme } from "../useThemeMutations";

const CUSTOM = { theme: "custom", custom: { name: "Mine", fingerprint: "aaaa" } };
const DARK = { theme: "dark", custom: { name: "Mine", fingerprint: "aaaa" } };
const SAVED = { theme: "custom", custom: { name: "Mine", fingerprint: "bbbb" } };
const TWO_FONTS = { fonts: [{ file: "a.woff2" }, { file: "b.woff2" }], usedBytes: 2, maxBytes: 9 };
const ONE_FONT = { fonts: [{ file: "a.woff2" }], usedBytes: 1, maxBytes: 9 };

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const NOTIFY_TURNS = 3;

async function flush() {
  for (let turn = 0; turn < NOTIFY_TURNS; turn += 1) {
    await act(async () => {
      await new Promise((done) => setTimeout(done, 0));
    });
  }
}

async function settle(waiting: Settle[] | undefined, value: unknown) {
  await flush();
  const resolve = waiting?.[0];
  if (resolve === undefined) throw new Error("nothing is waiting to be settled");
  act(() => resolve(value));
  await flush();
}

beforeEach(() => {
  vi.clearAllMocks();
  pending.reads = {};
  pending.writes.length = 0;
  pending.refusals.length = 0;
});

describe("theme mutations against a read still in flight", () => {
  it("keeps the theme a selection answered when a state read from before it lands afterwards", async () => {
    const { result } = renderHook(() => ({ state: useThemeState(true), select: useSelectTheme() }), { wrapper });
    expect(pending.reads.state).toHaveLength(1);

    act(() => result.current.select.mutate({ theme: "dark" }));
    await settle(pending.writes, DARK);
    expect(result.current.state.data).toEqual(DARK);

    await settle(pending.reads.state, CUSTOM);

    expect(result.current.state.data).toEqual(DARK);
  });

  it("keeps what a save answered when a state read from before it lands afterwards", async () => {
    const { result } = renderHook(() => ({ state: useThemeState(true), save: useSaveTheme() }), { wrapper });

    act(() =>
      result.current.save.mutate({
        base: "r1",
        files: [],
        remove: [],
        meta: { name: "Mine", scheme: "dark", startedFrom: "dark", follows: [] },
      })
    );
    await settle(pending.writes, SAVED);
    expect(result.current.state.data).toEqual(SAVED);

    await settle(pending.reads.state, CUSTOM);

    expect(result.current.state.data).toEqual(SAVED);
  });

  it("keeps the font list a removal answered when a list read from before it lands afterwards", async () => {
    const { result } = renderHook(() => ({ fonts: useThemeFonts(true), remove: useRemoveThemeFont() }), { wrapper });

    act(() => result.current.remove.mutate({ file: "b.woff2" }));
    await settle(pending.writes, ONE_FONT);
    expect(result.current.fonts.data).toEqual(ONE_FONT);

    await settle(pending.reads.fonts, TWO_FONTS);

    expect(result.current.fonts.data).toEqual(ONE_FONT);
  });

  it("still takes a state read that lands when no mutation answered in between", async () => {
    const { result } = renderHook(() => ({ state: useThemeState(true), select: useSelectTheme() }), { wrapper });

    await settle(pending.reads.state, CUSTOM);

    expect(result.current.state.data).toEqual(CUSTOM);
  });
});

describe("a save the server refused", () => {
  const INPUT = {
    base: "r1",
    files: [],
    remove: [],
    meta: { name: "Mine", scheme: "dark" as const, startedFrom: "dark" as const, follows: [] },
  };

  it("says the save failed", async () => {
    const refusal = { data: { appCode: "THEME_TOO_LARGE" } };
    const { result } = renderHook(() => useSaveTheme(), { wrapper });

    act(() => result.current.mutate(INPUT));
    await settle(pending.refusals, refusal);

    expect(errorToast).toHaveBeenCalledTimes(1);
    expect(errorToast).toHaveBeenCalledWith(refusal, "theme.saveFailed");
  });

  it("says nothing when the theme changed elsewhere, which the editor answers by merging", async () => {
    const { result } = renderHook(() => useSaveTheme(), { wrapper });

    act(() => result.current.mutate(INPUT));
    await settle(pending.refusals, { data: { appCode: "THEME_CHANGED_ELSEWHERE" } });

    expect(result.current.isError).toBe(true);
    expect(errorToast).not.toHaveBeenCalled();
  });
});
