import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Moon } from "lucide-react";

import { ThemeCardOption } from "../ThemeCardOption";
import type { ThemeCardOptionProps, ThemeOption } from "../types";

const baseOption: ThemeOption = {
  value: "dark",
  label: "Synthseek",
  icon: Moon,
  preview: "dark",
};

function renderOption(overrides: Partial<ThemeCardOptionProps> = {}) {
  const onSelect = vi.fn();
  const registerRef = vi.fn();
  const onKeyNav = vi.fn();
  render(
    <ThemeCardOption
      option={baseOption}
      selected={false}
      featured={false}
      tabbable
      onSelect={onSelect}
      registerRef={registerRef}
      onKeyNav={onKeyNav}
      {...overrides}
    />
  );
  return { onSelect, registerRef, onKeyNav };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ThemeCardOption", () => {
  it("uses the bare label as the accessible name when there is no hint", () => {
    renderOption();

    expect(screen.getByRole("radio", { name: "Synthseek" })).toBeInTheDocument();
  });

  it("folds the hint into the accessible name and renders it", () => {
    renderOption({ option: { ...baseOption, hint: "Default" } });

    expect(screen.getByRole("radio", { name: "Synthseek (Default)" })).toBeInTheDocument();
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("reflects the selected state through aria-checked", () => {
    renderOption({ selected: true });

    expect(screen.getByRole("radio", { name: "Synthseek" })).toBeChecked();
  });

  it("registers its node and clears the registration on unmount", () => {
    const { registerRef } = renderOption();

    expect(registerRef).toHaveBeenCalledWith("dark", expect.any(HTMLButtonElement));

    cleanup();
    expect(registerRef).toHaveBeenLastCalledWith("dark", null);
  });

  it("forwards click selection and keyboard navigation", async () => {
    const { onSelect, onKeyNav } = renderOption();

    const radio = screen.getByRole("radio", { name: "Synthseek" });
    await userEvent.click(radio);
    expect(onSelect).toHaveBeenCalledWith("dark");

    radio.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onKeyNav).toHaveBeenCalledWith(expect.objectContaining({ key: "ArrowRight" }), "dark");
  });

  it("drops out of the tab order when not tabbable", () => {
    renderOption({ tabbable: false });

    expect(screen.getByRole("radio", { name: "Synthseek" })).toHaveAttribute("tabindex", "-1");
  });
});
