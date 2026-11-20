import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { RangeSlider } from "../RangeSlider";
import { lowThumbLeads, rangeFillInset } from "../RangeSlider/helpers";

function renderSlider(low: number, high: number) {
  const onChange = vi.fn();
  render(
    <RangeSlider min={1950} max={2050} low={low} high={high} onChange={onChange} lowLabel="First" highLabel="Last" />
  );
  return onChange;
}

function slide(name: string, value: number) {
  fireEvent.change(screen.getByRole("slider", { name }), { target: { value: String(value) } });
}

describe("RangeSlider", () => {
  it("shows both ends as sliders over the same scale", () => {
    renderSlider(1960, 2000);

    expect(screen.getByRole("slider", { name: "First" })).toHaveValue("1960");
    expect(screen.getByRole("slider", { name: "Last" })).toHaveValue("2000");
    expect(screen.getByRole("slider", { name: "First" })).toHaveAttribute("min", "1950");
    expect(screen.getByRole("slider", { name: "Last" })).toHaveAttribute("max", "2050");
  });

  it("moves one end and reports the other where it was", () => {
    const onChange = renderSlider(1960, 2000);

    slide("First", 1980);
    expect(onChange).toHaveBeenLastCalledWith(1980, 2000);

    slide("Last", 2010);
    expect(onChange).toHaveBeenLastCalledWith(1960, 2010);
  });

  it("stops the low end at the high one", () => {
    const onChange = renderSlider(1960, 2000);

    slide("First", 2030);

    expect(onChange).toHaveBeenLastCalledWith(2000, 2000);
  });

  it("stops the high end at the low one", () => {
    const onChange = renderSlider(1960, 2000);

    slide("Last", 1955);

    expect(onChange).toHaveBeenLastCalledWith(1960, 1960);
  });
});

describe("rangeFillInset", () => {
  it("leaves out the share of the scale before the low end and after the high end", () => {
    expect(rangeFillInset(1950, 2050, 1950, 2050)).toBe("0% 0%");
    expect(rangeFillInset(1950, 2050, 1975, 2025)).toBe("25% 25%");
    expect(rangeFillInset(1950, 2050, 2000, 2000)).toBe("50% 50%");
  });

  it("paints nothing wider than the scale when an end falls outside it", () => {
    expect(rangeFillInset(1950, 2050, 1900, 2100)).toBe("0% 0%");
  });

  it("has no share to give on a scale of a single value", () => {
    expect(rangeFillInset(2000, 2000, 2000, 2000)).toBe("0% 100%");
  });
});

describe("lowThumbLeads", () => {
  it("puts the low thumb on top only once it sits past the middle, where the high thumb can cover it", () => {
    expect(lowThumbLeads(1950, 2050, 1960)).toBe(false);
    expect(lowThumbLeads(1950, 2050, 2000)).toBe(false);
    expect(lowThumbLeads(1950, 2050, 2001)).toBe(true);
  });
});
