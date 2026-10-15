import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ isAdmin: true }));
const paths = vi.hoisted(() => ({ data: undefined as { id: string }[] | undefined, enabledWith: [] as boolean[] }));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: auth.isAdmin }),
}));

vi.mock("@hooks/api/queries/useLibraryPaths", () => ({
  useLibraryPaths: (enabled: boolean) => {
    paths.enabledWith.push(enabled);
    return { data: paths.data };
  },
}));

import { useLibraryFileRequest } from "../useLibraryFileRequest";

describe("useLibraryFileRequest", () => {
  beforeEach(() => {
    auth.isAdmin = true;
    paths.data = undefined;
    paths.enabledWith = [];
  });

  it("allows moving once the library has another path to move to", () => {
    paths.data = [{ id: "primary" }, { id: "archive" }];

    expect(renderHook(() => useLibraryFileRequest()).result.current.actions.canMove).toBe(true);
  });

  it("does not offer moving with a single path, or before the paths are known", () => {
    expect(renderHook(() => useLibraryFileRequest()).result.current.actions.canMove).toBe(false);

    paths.data = [{ id: "primary" }];
    expect(renderHook(() => useLibraryFileRequest()).result.current.actions.canMove).toBe(false);
  });

  it("never asks a member's session for the admin-only path list", () => {
    auth.isAdmin = false;
    renderHook(() => useLibraryFileRequest());

    expect(paths.enabledWith.every((enabled) => enabled === false)).toBe(true);
  });
});
