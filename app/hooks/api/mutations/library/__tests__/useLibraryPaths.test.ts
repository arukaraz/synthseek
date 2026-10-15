import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MutationOptions {
  onMutate?: (input: unknown) => Promise<unknown>;
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown, input: unknown, context: unknown) => void;
  onSettled?: () => void;
}

interface PathRow {
  id: string;
  enabled: boolean;
}

const spies = vi.hoisted(() => {
  const captured: Record<string, MutationOptions | undefined> = {};
  const cache: { paths: PathRow[] | undefined } = { paths: undefined };
  return {
    captured,
    cache,
    invalidatePaths: vi.fn(),
    invalidateRules: vi.fn(),
    invalidatePreview: vi.fn(),
    cancelPaths: vi.fn(async () => undefined),
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
        paths: {
          list: {
            invalidate: spies.invalidatePaths,
            cancel: spies.cancelPaths,
            getData: () => spies.cache.paths,
            setData: (
              _input: undefined,
              next: PathRow[] | ((rows: PathRow[] | undefined) => PathRow[] | undefined)
            ) => {
              spies.cache.paths = typeof next === "function" ? next(spies.cache.paths) : next;
            },
          },
        },
        rules: { list: { invalidate: spies.invalidateRules } },
        naming: { preview: { invalidate: spies.invalidatePreview } },
      },
    }),
    library: {
      paths: {
        create: procedure("create"),
        update: procedure("update"),
        setEnabled: procedure("setEnabled"),
        remove: procedure("remove"),
      },
    },
  },
}));

import {
  useCreateLibraryPath,
  useRemoveLibraryPath,
  useSetLibraryPathEnabled,
  useUpdateLibraryPath,
} from "../useLibraryPaths";

beforeEach(() => {
  vi.clearAllMocks();
  spies.cache.paths = [
    { id: "primary", enabled: true },
    { id: "archive", enabled: true },
  ];
});

describe("useSetLibraryPathEnabled", () => {
  it("flips the switch before the server answers", async () => {
    renderHook(() => useSetLibraryPathEnabled());

    await spies.captured.setEnabled?.onMutate?.({ id: "archive", enabled: false });

    expect(spies.cache.paths).toEqual([
      { id: "primary", enabled: true },
      { id: "archive", enabled: false },
    ]);
  });

  it("puts the switch back when the request fails", async () => {
    renderHook(() => useSetLibraryPathEnabled());
    const context = await spies.captured.setEnabled?.onMutate?.({ id: "archive", enabled: false });

    spies.captured.setEnabled?.onError?.(new Error("offline"), { id: "archive", enabled: false }, context);

    expect(spies.cache.paths).toEqual([
      { id: "primary", enabled: true },
      { id: "archive", enabled: true },
    ]);
    expect(spies.errorToast).toHaveBeenCalledOnce();
  });

  it("explains a refusal to turn off the default path and reads the list again", () => {
    renderHook(() => useSetLibraryPathEnabled());

    spies.captured.setEnabled?.onSuccess?.({ outcome: "default_path" });
    spies.captured.setEnabled?.onSettled?.();

    expect(spies.toastWarning).toHaveBeenCalledWith(expect.stringContaining("default path cannot be turned off"));
    expect(spies.invalidatePaths).toHaveBeenCalled();
  });
});

describe("useUpdateLibraryPath", () => {
  it("refreshes the paths, the rules and the naming counts once saved", () => {
    renderHook(() => useUpdateLibraryPath());

    spies.captured.update?.onSuccess?.({ outcome: "saved", id: "archive" });

    expect(spies.invalidatePaths).toHaveBeenCalled();
    expect(spies.invalidateRules).toHaveBeenCalled();
    expect(spies.invalidatePreview).toHaveBeenCalled();
    expect(spies.toastSuccess).toHaveBeenCalledOnce();
  });

  it("leaves a refusal to the form, with no toast, but rereads the rules a refusal may be about", () => {
    renderHook(() => useUpdateLibraryPath());

    spies.captured.update?.onSuccess?.({ outcome: "rule_taken", ruleId: "rule-ost" });

    expect(spies.toastSuccess).not.toHaveBeenCalled();
    expect(spies.toastWarning).not.toHaveBeenCalled();
    expect(spies.invalidateRules).toHaveBeenCalled();
    expect(spies.invalidatePaths).not.toHaveBeenCalled();
  });

  it("says so when the path was removed under the form", () => {
    renderHook(() => useUpdateLibraryPath());

    spies.captured.update?.onSuccess?.({ outcome: "not_found" });

    expect(spies.toastWarning).toHaveBeenCalledOnce();
    expect(spies.invalidatePaths).toHaveBeenCalled();
  });
});

describe("useCreateLibraryPath", () => {
  it("adds the new path to the list", () => {
    renderHook(() => useCreateLibraryPath());

    spies.captured.create?.onSuccess?.({ outcome: "saved", id: "new" });

    expect(spies.invalidatePaths).toHaveBeenCalled();
    expect(spies.toastSuccess).toHaveBeenCalledOnce();
  });
});

describe("useRemoveLibraryPath", () => {
  it("does nothing on its own when the removal is blocked, the form lists why", () => {
    renderHook(() => useRemoveLibraryPath());

    spies.captured.remove?.onSuccess?.({ outcome: "blocked", blockers: [{ reason: "default_path" }] });

    expect(spies.invalidatePaths).not.toHaveBeenCalled();
    expect(spies.toastSuccess).not.toHaveBeenCalled();
  });

  it("refreshes the paths and the rules once removed", () => {
    renderHook(() => useRemoveLibraryPath());

    spies.captured.remove?.onSuccess?.({ outcome: "removed" });

    expect(spies.invalidatePaths).toHaveBeenCalled();
    expect(spies.invalidateRules).toHaveBeenCalled();
    expect(spies.toastSuccess).toHaveBeenCalledOnce();
  });
});
