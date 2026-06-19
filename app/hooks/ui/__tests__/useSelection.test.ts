import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useSelection } from "../useSelection";

interface Row {
  id: string;
  removable: boolean;
}

function makeRow(id: string, removable: boolean): Row {
  return { id, removable };
}

describe("useSelection", () => {
  it("toggles a single id on and off", () => {
    const { result } = renderHook(() => useSelection<Row>());

    act(() => result.current.toggle("a"));
    expect(result.current.isSelected("a")).toBe(true);
    expect(result.current.selectedCount).toBe(1);

    act(() => result.current.toggle("a"));
    expect(result.current.isSelected("a")).toBe(false);
    expect(result.current.selectedCount).toBe(0);
  });

  it("sets and unsets many ids at once", () => {
    const { result } = renderHook(() => useSelection<Row>());

    act(() => result.current.setMany(["a", "b", "c"], true));
    expect(result.current.selectedCount).toBe(3);

    act(() => result.current.setMany(["a", "b"], false));
    expect(result.current.selectedCount).toBe(1);
    expect(result.current.isSelected("c")).toBe(true);
  });

  it("clears the whole selection", () => {
    const { result } = renderHook(() => useSelection<Row>());

    act(() => result.current.setMany(["a", "b"], true));
    act(() => result.current.clear());
    expect(result.current.selectedCount).toBe(0);
  });

  it("filters the selected ids by a predicate", () => {
    const items = [makeRow("a", true), makeRow("b", false), makeRow("c", true)];
    const { result } = renderHook(() => useSelection<Row>());

    act(() => result.current.setMany(["a", "b"], true));
    expect(result.current.selectors.filterSelected(items, (item) => item.removable)).toEqual(["a"]);
  });

  it("reports all and some selected on the page", () => {
    const items = [makeRow("a", true), makeRow("b", true)];
    const { result } = renderHook(() => useSelection<Row>());

    act(() => result.current.toggle("a"));
    expect(result.current.selectors.someSelectedOnPage(items)).toBe(true);
    expect(result.current.selectors.allSelectedOnPage(items)).toBe(false);

    act(() => result.current.toggle("b"));
    expect(result.current.selectors.allSelectedOnPage(items)).toBe(true);
  });
});
