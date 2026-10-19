import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useBoardDevice } from "../useBoardDevice";

const media = vi.hoisted(() => ({ matches: true, query: vi.fn() }));

vi.mock("@hooks/ui/useMediaQuery", () => ({
  useMediaQuery: (query: string, fallback: boolean) => {
    media.query(query, fallback);
    return media.matches;
  },
}));

describe("useBoardDevice", () => {
  it("is wide from 64rem and narrow below it", () => {
    media.matches = true;
    expect(renderHook(() => useBoardDevice()).result.current).toBe("wide");
    expect(media.query).toHaveBeenCalledWith("(min-width: 64rem)", true);

    media.matches = false;
    expect(renderHook(() => useBoardDevice()).result.current).toBe("narrow");
  });
});
