import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { usePrimaryNav } from "../usePrimaryNav";

const pathnameMock = vi.fn<() => string>(() => "/");

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("usePrimaryNav", () => {
  beforeEach(() => {
    pathnameMock.mockReturnValue("/");
  });

  it("exposes the three primary destinations in order", () => {
    const { result } = renderHook(() => usePrimaryNav());

    expect(result.current.map((item) => item.href)).toEqual(["/", "/requests", "/library"]);
    expect(result.current.map((item) => item.label)).toEqual(["header.discover", "header.requests", "header.library"]);
  });

  it("marks discover active on the root path only", () => {
    const { result } = renderHook(() => usePrimaryNav());

    expect(result.current[0].isActive).toBe(true);
    expect(result.current[1].isActive).toBe(false);
    expect(result.current[2].isActive).toBe(false);
  });

  it("marks requests active on any requests sub-path", () => {
    pathnameMock.mockReturnValue("/requests/abc");
    const { result } = renderHook(() => usePrimaryNav());

    expect(result.current[0].isActive).toBe(false);
    expect(result.current[1].isActive).toBe(true);
  });

  it("marks library active on any library sub-path", () => {
    pathnameMock.mockReturnValue("/library/albums");
    const { result } = renderHook(() => usePrimaryNav());

    expect(result.current[2].isActive).toBe(true);
  });
});
