import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CLIENT_PAGINATION } from "../constants";
import { useClientPagination } from "../useClientPagination";

function items(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index + 1);
}

describe("useClientPagination", () => {
  it("shows everything and hides the controls below the threshold", () => {
    const { result } = renderHook(() => useClientPagination(items(CLIENT_PAGINATION.THRESHOLD - 1)));

    expect(result.current.paginated).toBe(false);
    expect(result.current.visible).toHaveLength(CLIENT_PAGINATION.THRESHOLD - 1);
  });

  it("starts paginating exactly AT the threshold, not one past it", () => {
    const { result } = renderHook(() => useClientPagination(items(CLIENT_PAGINATION.THRESHOLD)));

    expect(result.current.paginated).toBe(true);
    expect(result.current.visible).toHaveLength(CLIENT_PAGINATION.PAGE_SIZE);
    expect(result.current.totalItems).toBe(CLIENT_PAGINATION.THRESHOLD);
  });

  it("hands out the right slice per page and keeps the last page short", () => {
    const { result } = renderHook(() => useClientPagination(items(25)));

    expect(result.current.visible[0]).toBe(1);
    act(() => result.current.onPageChange(3));
    expect(result.current.visible).toEqual([21, 22, 23, 24, 25]);
  });

  it("clamps a page beyond the end instead of rendering nothing", () => {
    const { result } = renderHook(() => useClientPagination(items(25)));

    act(() => result.current.onPageChange(99));

    expect(result.current.page).toBe(3);
    expect(result.current.visible.length).toBeGreaterThan(0);
  });

  it("returns to the first page when the page size changes, so the view cannot land past the end", () => {
    const { result } = renderHook(() => useClientPagination(items(60)));

    act(() => result.current.onPageChange(6));
    act(() => result.current.onPageSizeChange(50));

    expect(result.current.page).toBe(1);
    expect(result.current.visible).toHaveLength(50);
  });

  it("survives an undefined list, which is what a query hands over while it loads", () => {
    const { result } = renderHook(() => useClientPagination<number>(undefined));

    expect(result.current.visible).toEqual([]);
    expect(result.current.paginated).toBe(false);
    expect(result.current.pageCount).toBe(1);
  });

  it("clamps back into range when the list shrinks under the reader", () => {
    const { result, rerender } = renderHook(({ list }) => useClientPagination(list), {
      initialProps: { list: items(60) },
    });

    act(() => result.current.onPageChange(6));
    rerender({ list: items(15) });

    expect(result.current.page).toBe(2);
    expect(result.current.visible.length).toBeGreaterThan(0);
  });
});
