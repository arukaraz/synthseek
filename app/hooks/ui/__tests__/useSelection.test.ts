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

describe("useSelection range", () => {
  const order = ["a", "b", "c", "d", "e"];

  it("selects every id between the anchor and the extended id", () => {
    const { result } = renderHook(() => useSelection<Row>());

    act(() => result.current.toggle("b"));
    act(() => result.current.extendTo(order, "d"));

    expect([...result.current.selectedIds].sort()).toEqual(["b", "c", "d"]);
  });

  it("extends upwards when the extended id sits before the anchor", () => {
    const { result } = renderHook(() => useSelection<Row>());

    act(() => result.current.toggle("d"));
    act(() => result.current.extendTo(order, "b"));

    expect([...result.current.selectedIds].sort()).toEqual(["b", "c", "d"]);
  });

  it("clears the range when the anchor click was a deselection", () => {
    const { result } = renderHook(() => useSelection<Row>());

    act(() => result.current.setMany(order, true));
    act(() => result.current.toggle("b"));
    act(() => result.current.extendTo(order, "d"));

    expect([...result.current.selectedIds].sort()).toEqual(["a", "e"]);
  });

  it("leaves the anchor where the plain click put it, so the next range still starts there", () => {
    const { result } = renderHook(() => useSelection<Row>());

    act(() => result.current.toggle("b"));
    act(() => result.current.extendTo(order, "d"));

    expect(result.current.rangeTo(order, "e")).toEqual({ ids: ["b", "c", "d", "e"], selected: true });
  });

  it("falls back to a plain toggle when no anchor has been set yet", () => {
    const { result } = renderHook(() => useSelection<Row>());

    act(() => result.current.extendTo(order, "c"));

    expect([...result.current.selectedIds]).toEqual(["c"]);
  });

  it("falls back to a plain toggle when the anchor is no longer on the page", () => {
    const { result } = renderHook(() => useSelection<Row>());

    act(() => result.current.toggle("a"));
    act(() => result.current.extendTo(["x", "y", "z"], "y"));

    expect([...result.current.selectedIds].sort()).toEqual(["a", "y"]);
  });

  it("re-anchors on the fallback so the next extend ranges from it", () => {
    const { result } = renderHook(() => useSelection<Row>());

    act(() => result.current.extendTo(order, "b"));
    act(() => result.current.extendTo(order, "d"));

    expect([...result.current.selectedIds].sort()).toEqual(["b", "c", "d"]);
  });

  it("drops the anchor when the selection is cleared", () => {
    const { result } = renderHook(() => useSelection<Row>());

    act(() => result.current.toggle("a"));
    act(() => result.current.clear());
    act(() => result.current.extendTo(order, "d"));

    expect([...result.current.selectedIds]).toEqual(["d"]);
  });

  it("previews the pending range and its target state without applying it", () => {
    const { result } = renderHook(() => useSelection<Row>());

    act(() => result.current.toggle("b"));
    const preview = result.current.rangeTo(order, "d");

    expect(preview).toEqual({ ids: ["b", "c", "d"], selected: true });
    expect([...result.current.selectedIds]).toEqual(["b"]);
  });

  it("previews nothing when the anchor is off the page", () => {
    const { result } = renderHook(() => useSelection<Row>());

    act(() => result.current.toggle("a"));

    expect(result.current.rangeTo(["x", "y"], "y")).toBeNull();
  });
});
