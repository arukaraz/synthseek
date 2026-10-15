import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const cache = vi.hoisted(() => ({ invalidate: vi.fn(async () => undefined) }));

vi.mock("@utils/trpc", () => ({
  trpc: { useUtils: () => ({ auth: { me: { invalidate: cache.invalidate } } }) },
}));

import { useRefreshCurrentUser } from "../useRefreshCurrentUser";

describe("useRefreshCurrentUser", () => {
  it("re-reads the signed-in account, so settings changed elsewhere reach this page", () => {
    const { result } = renderHook(() => useRefreshCurrentUser());

    result.current();

    expect(cache.invalidate).toHaveBeenCalledTimes(1);
  });
});
