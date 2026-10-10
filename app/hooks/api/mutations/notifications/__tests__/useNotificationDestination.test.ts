import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MutationOptions {
  onSuccess?: (data: unknown) => void;
  onSettled?: () => void;
  onError?: (error: unknown) => void;
}

const spies = vi.hoisted(() => ({
  options: new Map<string, MutationOptions>(),
  setList: vi.fn(),
  invalidateList: vi.fn(),
  setAdminSettings: vi.fn(),
  invalidateCatalog: vi.fn(),
  errorToast: vi.fn(),
}));

function capture(name: string) {
  return (options: MutationOptions) => {
    spies.options.set(name, options);
    return { mutate: vi.fn(), isPending: false };
  };
}

vi.mock("@modules/errors", () => ({ errorToast: spies.errorToast }));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      notifications: {
        list: { setData: spies.setList, invalidate: spies.invalidateList },
        adminSettings: { setData: spies.setAdminSettings },
        catalog: { invalidate: spies.invalidateCatalog },
      },
    }),
    notifications: {
      save: { useMutation: capture("save") },
      remove: { useMutation: capture("remove") },
      test: { useMutation: capture("test") },
      updateAdminSettings: { useMutation: capture("updateAdminSettings") },
    },
  },
}));

import {
  useRemoveNotificationDestination,
  useSaveNotificationDestination,
  useTestNotificationDestination,
  useUpdateNotificationAdminSettings,
} from "..";

function optionsOf(name: string): MutationOptions {
  const options = spies.options.get(name);
  if (options === undefined) throw new Error(`${name} was never registered`);
  return options;
}

beforeEach(() => {
  spies.options.clear();
  vi.clearAllMocks();
});

describe("notification mutations", () => {
  it.each([
    ["save", useSaveNotificationDestination, "notifications.saveFailed"],
    ["remove", useRemoveNotificationDestination, "notifications.removeFailed"],
  ] satisfies ReadonlyArray<readonly [string, () => unknown, string]>)(
    "%s writes the returned destinations into the list",
    (name, hook, fallback) => {
      renderHook(() => hook());
      const destinations = [{ channel: "ntfy" }];

      optionsOf(name).onSuccess?.(destinations);
      const error = new Error("boom");
      optionsOf(name).onError?.(error);

      expect(spies.setList).toHaveBeenCalledWith(undefined, destinations);
      expect(spies.errorToast).toHaveBeenCalledWith(error, fallback);
    }
  );

  it("refreshes the list after a test, whatever its outcome, so the status line moves", () => {
    renderHook(() => useTestNotificationDestination());

    optionsOf("test").onSettled?.();
    const error = new Error("boom");
    optionsOf("test").onError?.(error);

    expect(spies.invalidateList).toHaveBeenCalledOnce();
    expect(spies.errorToast).toHaveBeenCalledWith(error, "notifications.testFailed");
  });

  it("stores the admin settings and refreshes the catalog that lists the members' servers", () => {
    renderHook(() => useUpdateNotificationAdminSettings());
    const settings = { memberNtfyServer: "https://push.example.org" };

    optionsOf("updateAdminSettings").onSuccess?.(settings);
    const error = new Error("boom");
    optionsOf("updateAdminSettings").onError?.(error);

    expect(spies.setAdminSettings).toHaveBeenCalledWith(undefined, settings);
    expect(spies.invalidateCatalog).toHaveBeenCalledOnce();
    expect(spies.errorToast).toHaveBeenCalledWith(error, "notifications.settingsFailed");
  });
});
