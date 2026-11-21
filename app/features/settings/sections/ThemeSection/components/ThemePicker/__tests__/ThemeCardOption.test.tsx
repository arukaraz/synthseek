import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ThemeCardOption } from "../ThemeCardOption";
import type { ThemeCardOptionProps, ThemeOption } from "../types";

const baseOption: ThemeOption = { value: "dark", label: "Synthseek", paint: { theme: "dark" } };

function renderOption(overrides: Partial<ThemeCardOptionProps> = {}) {
  const onSelect = vi.fn();
  const registerRef = vi.fn();
  const onKeyNav = vi.fn();
  const view = render(
    <ThemeCardOption
      option={baseOption}
      selected={false}
      tabbable
      onSelect={onSelect}
      registerRef={registerRef}
      onKeyNav={onKeyNav}
      {...overrides}
    />
  );
  return { onSelect, registerRef, onKeyNav, ...view };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ThemeCardOption", () => {
  it("names the radio after its label", () => {
    renderOption();

    expect(screen.getByRole("radio", { name: "Synthseek" })).toBeInTheDocument();
  });

  it("reflects the selected state through aria-checked", () => {
    renderOption({ selected: true });

    expect(screen.getByRole("radio", { name: "Synthseek" })).toBeChecked();
  });

  it("paints its miniature with the theme and the base it was given", () => {
    const { container } = renderOption({
      option: { value: "custom", label: "Custom", paint: { theme: "custom", base: "ocean" } },
    });

    const miniature = container.querySelector('[data-theme="custom"]');

    expect(miniature).toHaveAttribute("data-theme-base", "ocean");
    expect(miniature).toHaveAttribute("aria-hidden", "true");
  });

  it("registers its node and clears the registration on unmount", () => {
    const { registerRef, unmount } = renderOption();

    expect(registerRef).toHaveBeenCalledWith("dark", expect.any(HTMLButtonElement));

    unmount();
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
