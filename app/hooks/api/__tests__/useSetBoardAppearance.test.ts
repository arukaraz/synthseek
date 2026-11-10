import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderHook } from "@test/test-utils";

import type { BoardAppearance } from "../queries/board/types";

interface CapturedOptions {
  onError: (error: unknown) => void;
}

const errors = vi.hoisted(() => ({ errorToast: vi.fn() }));
const cache = vi.hoisted(() => ({
  cancel: vi.fn(),
  setData: vi.fn(),
  invalidate: vi.fn(),
  mutate: vi.fn<(appearance: BoardAppearance) => Promise<unknown>>(),
}));
const captured = vi.hoisted((): { options: CapturedOptions | null } => ({ options: null }));

vi.mock("@modules/errors", () => errors);
vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      discovery: {
        board: { appearance: { cancel: cache.cancel, setData: cache.setData, invalidate: cache.invalidate } },
      },
    }),
    discovery: {
      board: {
        setAppearance: {
          useMutation: (options: CapturedOptions) => {
            captured.options = options;
            return { mutateAsync: cache.mutate };
          },
        },
      },
    },
  },
}));

import { useSetBoardAppearance } from "../mutations/board/useSetBoardAppearance";

const COMPACT: BoardAppearance = { density: "compact", text: "default" };

function capturedOptions(): CapturedOptions {
  if (captured.options === null) throw new Error("the mutation registered no options");
  return captured.options;
}

beforeEach(() => {
  vi.clearAllMocks();
  captured.options = null;
});

describe("saving the board's look", () => {
  it("shows the new look at once by default and says whether the server kept it", async () => {
    cache.mutate.mockResolvedValueOnce(COMPACT);
    const { result } = renderHook(() => useSetBoardAppearance());

    const saving = result.current(COMPACT);
    expect(cache.setData).toHaveBeenCalledWith(undefined, COMPACT);

    await expect(saving).resolves.toBe(true);
    cache.mutate.mockRejectedValueOnce(new Error("refused"));
    await expect(result.current(COMPACT)).resolves.toBe(false);
  });

  it("leaves the cache alone until the server answers a confirmed save, and untouched when it refuses", async () => {
    cache.mutate.mockResolvedValueOnce(COMPACT);
    const { result } = renderHook(() => useSetBoardAppearance());

    const saving = result.current(COMPACT, "confirmed");
    expect(cache.setData).not.toHaveBeenCalled();
    await expect(saving).resolves.toBe(true);
    expect(cache.setData.mock.calls).toEqual([[undefined, COMPACT]]);

    cache.setData.mockClear();
    cache.mutate.mockRejectedValueOnce(new Error("refused"));
    await expect(result.current(COMPACT, "confirmed")).resolves.toBe(false);
    expect(cache.setData).not.toHaveBeenCalled();
  });

  it("refetches the server's look and reports the failure when a save fails", () => {
    renderHook(() => useSetBoardAppearance());
    const failure = new Error("boom");

    capturedOptions().onError(failure);

    expect(cache.invalidate).toHaveBeenCalledTimes(1);
    expect(errors.errorToast).toHaveBeenCalledWith(failure, "discovery.appearanceSaveFailed");
  });
});
