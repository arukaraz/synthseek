import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { THEME_OPTIONS } from "../constants";
import { ThemeSelector } from "../ThemeSelector";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ThemeSelector", () => {
  it("renders a radio for every theme option", () => {
    render(<ThemeSelector value="dark" onSelect={vi.fn()} ariaLabel="Color theme" />);

    const group = screen.getByRole("radiogroup", { name: "Color theme" });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(THEME_OPTIONS.length);
  });

  it("marks the selected option as checked", () => {
    render(<ThemeSelector value="ocean" onSelect={vi.fn()} ariaLabel="Color theme" />);

    expect(screen.getByRole("radio", { name: "Ocean" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Synthseek" })).not.toBeChecked();
  });

  it("selects an option on click", async () => {
    const onSelect = vi.fn();
    render(<ThemeSelector value="dark" onSelect={onSelect} ariaLabel="Color theme" />);

    await userEvent.click(screen.getByRole("radio", { name: "Ocean" }));

    expect(onSelect).toHaveBeenCalledWith("ocean");
  });

  it("makes only the first option tabbable when no value matches", () => {
    render(<ThemeSelector value={undefined} onSelect={vi.fn()} ariaLabel="Color theme" />);

    expect(screen.getByRole("radio", { name: "Synthseek" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "Ocean" })).toHaveAttribute("tabindex", "-1");
  });

  it("moves selection forward with ArrowRight roving navigation", () => {
    const onSelect = vi.fn();
    render(<ThemeSelector value="dark" onSelect={onSelect} ariaLabel="Color theme" />);

    fireEvent.keyDown(screen.getByRole("radio", { name: "Synthseek" }), { key: "ArrowRight" });

    expect(onSelect).toHaveBeenCalledWith("midnight");
  });

  it("wraps to the last option with ArrowLeft from the first", () => {
    const onSelect = vi.fn();
    render(<ThemeSelector value="dark" onSelect={onSelect} ariaLabel="Color theme" />);

    fireEvent.keyDown(screen.getByRole("radio", { name: "Synthseek" }), { key: "ArrowLeft" });

    expect(onSelect).toHaveBeenCalledWith("ocean");
  });

  it("jumps to the last option with End", () => {
    const onSelect = vi.fn();
    render(<ThemeSelector value="dark" onSelect={onSelect} ariaLabel="Color theme" />);

    fireEvent.keyDown(screen.getByRole("radio", { name: "Synthseek" }), { key: "End" });

    expect(onSelect).toHaveBeenCalledWith("ocean");
  });

  it("ignores keys that are not roving navigation keys", () => {
    const onSelect = vi.fn();
    render(<ThemeSelector value="dark" onSelect={onSelect} ariaLabel="Color theme" />);

    fireEvent.keyDown(screen.getByRole("radio", { name: "Synthseek" }), { key: "Enter" });

    expect(onSelect).not.toHaveBeenCalled();
  });
});
