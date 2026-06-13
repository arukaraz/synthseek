import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FacetSearchInput } from "../FacetSearchInput";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("FacetSearchInput", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("pushes the FULL typed value to onSearch, not just the last character", () => {
    const pushed: string[] = [];
    render(<FacetSearchInput value="" label="Genre" onSearch={(term) => pushed.push(term)} />);

    const input = screen.getByLabelText("Genre");
    fireEvent.change(input, { target: { value: "R" } });
    fireEvent.change(input, { target: { value: "Ro" } });
    fireEvent.change(input, { target: { value: "Roc" } });
    fireEvent.change(input, { target: { value: "Rock" } });

    expect(input).toHaveValue("Rock");

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(pushed[pushed.length - 1]).toBe("Rock");
  });

  it("reflects every keystroke locally before the debounced push lands", () => {
    const pushed: string[] = [];
    render(<FacetSearchInput value="" label="Artist" onSearch={(term) => pushed.push(term)} />);

    const input = screen.getByLabelText("Artist");
    fireEvent.change(input, { target: { value: "Q" } });
    fireEvent.change(input, { target: { value: "Qu" } });
    fireEvent.change(input, { target: { value: "Que" } });

    expect(input).toHaveValue("Que");
    expect(pushed).toHaveLength(0);
  });
});
