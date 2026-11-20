import { describe, expect, it, vi } from "vitest";

import { fireEvent, renderWithProviders, screen } from "@test/test-utils";
import userEvent from "@testing-library/user-event";

import { SuggestedFilters } from "../SuggestedFilters";
import type { SuggestedYears } from "../types";

const ANY: SuggestedYears = { from: null, to: null };

function renderFilters(years: SuggestedYears, saving = false) {
  const onApply = vi.fn();
  renderWithProviders(<SuggestedFilters years={years} saving={saving} onApply={onApply} />);
  return onApply;
}

function slide(name: string, value: number) {
  fireEvent.change(screen.getByRole("slider", { name }), { target: { value: String(value) } });
}

async function openPanel() {
  await userEvent.click(screen.getByRole("button", { name: "Filter suggestions" }));
}

describe("SuggestedFilters", () => {
  it("keeps the range out of sight until the filter button is pressed", async () => {
    renderFilters(ANY);
    expect(screen.queryByText("Release years")).not.toBeInTheDocument();

    await openPanel();

    expect(screen.getByText("Release years")).toBeInTheDocument();
    expect(screen.getByText("Any year")).toBeInTheDocument();
  });

  it("opens on the years the playlist remembers", async () => {
    renderFilters({ from: 1990, to: 2005 });

    await openPanel();

    expect(screen.getByRole("slider", { name: "Earliest year" })).toHaveValue("1990");
    expect(screen.getByRole("slider", { name: "Latest year" })).toHaveValue("2005");
    expect(screen.getByText("1990 – 2005")).toBeInTheDocument();
  });

  it("names the range as the thumbs move and hands it over only on Apply", async () => {
    const onApply = renderFilters(ANY);
    await openPanel();

    slide("Earliest year", 1990);
    expect(screen.getByText("From 1990")).toBeInTheDocument();
    expect(onApply).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith({ from: 1990, to: null });
    expect(screen.queryByText("Release years")).not.toBeInTheDocument();
  });

  it("closes without saving when Apply is pressed on the range already in force", async () => {
    const onApply = renderFilters({ from: 1990, to: 2005 });
    await openPanel();

    await userEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).not.toHaveBeenCalled();
    expect(screen.queryByText("Release years")).not.toBeInTheDocument();
  });

  it("forgets a range that was moved and never applied", async () => {
    renderFilters({ from: 1990, to: 2005 });
    await openPanel();
    slide("Earliest year", 1970);
    expect(screen.getByText("1970 – 2005")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    await openPanel();

    expect(screen.getByText("1990 – 2005")).toBeInTheDocument();
  });

  it("cannot be opened while a range is being saved", () => {
    renderFilters(ANY, true);

    expect(screen.getByRole("button", { name: "Filter suggestions" })).toBeDisabled();
  });
});
