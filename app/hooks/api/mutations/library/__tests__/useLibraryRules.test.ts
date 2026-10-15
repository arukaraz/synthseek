import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MutationOptions {
  onMutate?: (input: unknown) => Promise<unknown>;
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown, input: unknown, context: unknown) => void;
  onSettled?: () => void;
}

interface RuleRow {
  id: string;
  position: number;
}

const spies = vi.hoisted(() => {
  const captured: Record<string, MutationOptions | undefined> = {};
  const cache: { rules: RuleRow[] | undefined } = { rules: undefined };
  return {
    captured,
    cache,
    invalidateRules: vi.fn(),
    invalidatePaths: vi.fn(),
    cancelRules: vi.fn(async () => undefined),
    errorToast: vi.fn(),
    toastSuccess: vi.fn(),
    toastWarning: vi.fn(),
  };
});

vi.mock("sonner", () => ({ toast: { success: spies.toastSuccess, warning: spies.toastWarning } }));

vi.mock("@modules/errors", () => ({ errorToast: spies.errorToast }));

function procedure(name: string) {
  return {
    useMutation: (options: MutationOptions) => {
      spies.captured[name] = options;
      return { mutate: vi.fn(), isPending: false };
    },
  };
}

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      library: {
        rules: {
          list: {
            invalidate: spies.invalidateRules,
            cancel: spies.cancelRules,
            getData: () => spies.cache.rules,
            setData: (
              _input: undefined,
              next: RuleRow[] | ((rows: RuleRow[] | undefined) => RuleRow[] | undefined)
            ) => {
              spies.cache.rules = typeof next === "function" ? next(spies.cache.rules) : next;
            },
          },
        },
        paths: { list: { invalidate: spies.invalidatePaths } },
      },
    }),
    library: {
      rules: {
        create: procedure("create"),
        update: procedure("update"),
        remove: procedure("remove"),
        reorder: procedure("reorder"),
      },
    },
  },
}));

import {
  useCreateLibraryRule,
  useRemoveLibraryRule,
  useReorderLibraryRules,
  useUpdateLibraryRule,
} from "../useLibraryRules";

beforeEach(() => {
  vi.clearAllMocks();
  spies.cache.rules = [
    { id: "a", position: 0 },
    { id: "b", position: 1 },
    { id: "c", position: 2 },
  ];
});

describe("useReorderLibraryRules", () => {
  it("shows the new order and the new priorities before the server answers", async () => {
    renderHook(() => useReorderLibraryRules());

    await spies.captured.reorder?.onMutate?.({ ids: ["b", "a", "c"] });

    expect(spies.cache.rules).toEqual([
      { id: "b", position: 0 },
      { id: "a", position: 1 },
      { id: "c", position: 2 },
    ]);
  });

  it("goes back to the order it had when the request fails", async () => {
    renderHook(() => useReorderLibraryRules());
    const context = await spies.captured.reorder?.onMutate?.({ ids: ["b", "a", "c"] });

    spies.captured.reorder?.onError?.(new Error("offline"), { ids: ["b", "a", "c"] }, context);

    expect(spies.cache.rules).toEqual([
      { id: "a", position: 0 },
      { id: "b", position: 1 },
      { id: "c", position: 2 },
    ]);
    expect(spies.errorToast).toHaveBeenCalledOnce();
  });

  it("says the list moved under the reader when the server sees a different set", () => {
    renderHook(() => useReorderLibraryRules());

    spies.captured.reorder?.onSuccess?.({ outcome: "mismatch" });
    spies.captured.reorder?.onSettled?.();

    expect(spies.toastWarning).toHaveBeenCalledOnce();
    expect(spies.invalidateRules).toHaveBeenCalled();
  });

  it("says nothing when the order was saved", () => {
    renderHook(() => useReorderLibraryRules());

    spies.captured.reorder?.onSuccess?.({ outcome: "saved" });

    expect(spies.toastWarning).not.toHaveBeenCalled();
  });
});

describe("useCreateLibraryRule", () => {
  it("leaves a refusal to the form", () => {
    renderHook(() => useCreateLibraryRule());

    spies.captured.create?.onSuccess?.({ outcome: "name_taken" });

    expect(spies.toastSuccess).not.toHaveBeenCalled();
    expect(spies.invalidateRules).not.toHaveBeenCalled();
  });

  it("adds the rule to the list once saved", () => {
    renderHook(() => useCreateLibraryRule());

    spies.captured.create?.onSuccess?.({ outcome: "saved", id: "d" });

    expect(spies.invalidateRules).toHaveBeenCalled();
    expect(spies.toastSuccess).toHaveBeenCalledOnce();
  });
});

describe("useUpdateLibraryRule", () => {
  it("says so when the rule was deleted under the form", () => {
    renderHook(() => useUpdateLibraryRule());

    spies.captured.update?.onSuccess?.({ outcome: "not_found" });

    expect(spies.toastWarning).toHaveBeenCalledOnce();
    expect(spies.invalidateRules).toHaveBeenCalled();
  });
});

describe("useRemoveLibraryRule", () => {
  it("refreshes the paths too, whose rule counts just changed", () => {
    renderHook(() => useRemoveLibraryRule());

    spies.captured.remove?.onSuccess?.({ outcome: "removed" });

    expect(spies.invalidateRules).toHaveBeenCalled();
    expect(spies.invalidatePaths).toHaveBeenCalled();
    expect(spies.toastSuccess).toHaveBeenCalledOnce();
  });
});
