import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ThemeSelector } from "../ThemeSelector";
import type { ThemeOption } from "../types";

const options: ThemeOption[] = [
  { value: "dark", label: "Synthseek", paint: { theme: "dark" } },
  { value: "midnight", label: "Midnight", paint: { theme: "midnight" } },
  { value: "ocean", label: "Ocean", paint: { theme: "ocean" } },
  { value: "custom", label: "Custom", paint: { theme: "custom", base: "dark" } },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ThemeSelector", () => {
  it("renders a radio for every option", () => {
    render(<ThemeSelector value="dark" options={options} onSelect={vi.fn()} ariaLabel="Color theme" />);

    expect(screen.getByRole("radiogroup", { name: "Color theme" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(options.length);
  });

  it("marks the selected option as checked", () => {
    render(<ThemeSelector value="ocean" options={options} onSelect={vi.fn()} ariaLabel="Color theme" />);

    expect(screen.getByRole("radio", { name: "Ocean" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Synthseek" })).not.toBeChecked();
  });

  it("selects an option on click", async () => {
    const onSelect = vi.fn();
    render(<ThemeSelector value="dark" options={options} onSelect={onSelect} ariaLabel="Color theme" />);

    await userEvent.click(screen.getByRole("radio", { name: "Custom" }));

    expect(onSelect).toHaveBeenCalledWith("custom");
  });

  it("moves selection forward with ArrowRight roving navigation", () => {
    const onSelect = vi.fn();
    render(<ThemeSelector value="dark" options={options} onSelect={onSelect} ariaLabel="Color theme" />);

    fireEvent.keyDown(screen.getByRole("radio", { name: "Synthseek" }), { key: "ArrowRight" });

    expect(onSelect).toHaveBeenCalledWith("midnight");
  });

  it("wraps from the first option to Custom with ArrowLeft", () => {
    const onSelect = vi.fn();
    render(<ThemeSelector value="dark" options={options} onSelect={onSelect} ariaLabel="Color theme" />);

    fireEvent.keyDown(screen.getByRole("radio", { name: "Synthseek" }), { key: "ArrowLeft" });

    expect(onSelect).toHaveBeenCalledWith("custom");
  });

  it("jumps to the last option with End and the first with Home", () => {
    const onSelect = vi.fn();
    render(<ThemeSelector value="ocean" options={options} onSelect={onSelect} ariaLabel="Color theme" />);

    fireEvent.keyDown(screen.getByRole("radio", { name: "Ocean" }), { key: "End" });
    fireEvent.keyDown(screen.getByRole("radio", { name: "Ocean" }), { key: "Home" });

    expect(onSelect).toHaveBeenNthCalledWith(1, "custom");
    expect(onSelect).toHaveBeenNthCalledWith(2, "dark");
  });

  it("keeps only the selected option in the tab order", () => {
    render(<ThemeSelector value="ocean" options={options} onSelect={vi.fn()} ariaLabel="Color theme" />);

    expect(screen.getByRole("radio", { name: "Ocean" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "Synthseek" })).toHaveAttribute("tabindex", "-1");
  });

  it("ignores keys that are not roving navigation keys", () => {
    const onSelect = vi.fn();
    render(<ThemeSelector value="dark" options={options} onSelect={onSelect} ariaLabel="Color theme" />);

    fireEvent.keyDown(screen.getByRole("radio", { name: "Synthseek" }), { key: "Enter" });

    expect(onSelect).not.toHaveBeenCalled();
  });
});
