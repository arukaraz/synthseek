import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderHook } from "@test/test-utils";

import type { BoardLayout } from "../queries/board/types";

interface CapturedOptions {
  scope: { id: string };
  onError: (error: unknown) => void;
}

const errors = vi.hoisted(() => ({ errorToast: vi.fn() }));
const cache = vi.hoisted(() => ({ cancel: vi.fn(), setData: vi.fn(), invalidate: vi.fn(), mutate: vi.fn() }));
const captured = vi.hoisted((): { options: CapturedOptions | null } => ({ options: null }));

vi.mock("@modules/errors", () => errors);
vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      discovery: { board: { get: { cancel: cache.cancel, setData: cache.setData, invalidate: cache.invalidate } } },
    }),
    discovery: {
      board: {
        save: {
          useMutation: (options: CapturedOptions) => {
            captured.options = options;
            return { mutate: cache.mutate };
          },
        },
      },
    },
  },
}));

import { BOARD_SAVE_SCOPE } from "../mutations/board/constants";
import { useSaveBoardLayout } from "../mutations/board/useSaveBoardLayout";

const LAYOUT: BoardLayout = { schemaVersion: 2, items: [{ id: "a", widget: "mixes", size: "L" }] };

function capturedOptions(): CapturedOptions {
  if (captured.options === null) throw new Error("the mutation registered no options");
  return captured.options;
}

beforeEach(() => {
  vi.clearAllMocks();
  captured.options = null;
});

describe("saving the board layout", () => {
  it("shows the new layout at once and sends the whole layout to the server", () => {
    const { result } = renderHook(() => useSaveBoardLayout());

    result.current(LAYOUT);

    expect(cache.cancel).toHaveBeenCalledTimes(1);
    expect(cache.setData).toHaveBeenCalledWith(undefined, LAYOUT);
    expect(cache.mutate).toHaveBeenCalledWith(LAYOUT);
    expect(cache.setData.mock.invocationCallOrder[0]).toBeLessThan(cache.mutate.mock.invocationCallOrder[0] ?? 0);
  });

  it("runs every save in one scope so they reach the server in order", () => {
    renderHook(() => useSaveBoardLayout());

    expect(capturedOptions().scope).toEqual({ id: BOARD_SAVE_SCOPE });
  });

  it("refetches the server's layout and reports the failure when a save fails", () => {
    renderHook(() => useSaveBoardLayout());
    const failure = new Error("boom");

    capturedOptions().onError(failure);

    expect(cache.invalidate).toHaveBeenCalledTimes(1);
    expect(errors.errorToast).toHaveBeenCalledWith(failure, "discovery.boardSaveFailed");
  });
});
