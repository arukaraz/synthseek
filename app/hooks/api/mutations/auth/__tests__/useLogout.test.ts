import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useLogout } from "../useLogout";

interface LogoutOptions {
  onSuccess: () => void;
}

const setMe = vi.hoisted(() => vi.fn());
const given = vi.hoisted((): { options: LogoutOptions | null } => ({ options: null }));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({ auth: { me: { setData: setMe } } }),
    auth: {
      logout: {
        useMutation: (options: LogoutOptions) => {
          given.options = options;
          return {};
        },
      },
    },
  },
}));

beforeEach(() => {
  setMe.mockClear();
  given.options = null;
});

describe("useLogout", () => {
  it("answers every reader of who is signed in with nobody, once the server signed the session out", () => {
    renderHook(() => useLogout());
    expect(setMe).not.toHaveBeenCalled();

    given.options?.onSuccess();

    expect(setMe).toHaveBeenCalledTimes(1);
    expect(setMe).toHaveBeenCalledWith(undefined, null);
  });
});
