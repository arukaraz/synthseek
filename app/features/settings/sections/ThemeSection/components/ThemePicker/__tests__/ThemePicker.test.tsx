import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CustomThemeSummary, Theme } from "@theme/ThemeProvider";

const select = vi.fn();
const setEditParam = vi.fn();
const useThemeFiles = vi.fn();
let context: { theme: Theme; custom: CustomThemeSummary | null; select: typeof select; previewing?: boolean };

vi.mock("@theme/ThemeProvider", () => ({
  useThemeContext: () => ({ previewing: false, ...context }),
}));

vi.mock("@hooks/api/queries/theme", () => ({
  useThemeFiles: (enabled: boolean) => useThemeFiles(enabled),
}));

vi.mock("@hooks/ui/useUrlParam", () => ({
  useUrlParam: () => [undefined, setEditParam],
}));

import { ThemePicker } from "../ThemePicker";

const custom: CustomThemeSummary = {
  name: "Mine",
  scheme: "dark",
  startedFrom: "ocean",
  follows: [],
  fingerprint: "abc",
  folder: "mine",
};

const savedFiles = {
  files: [
    { path: "tokens/surfaces.css", kind: "tokens", text: ":root { --surface: red; }", hash: "h1", unreadable: false },
    {
      path: "custom.css",
      kind: "custom",
      text: "@keyframes spin { to { opacity: 0 } }",
      hash: "h2",
      unreadable: false,
    },
  ],
};

function customMiniature(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>('[data-theme="custom"]');
}

beforeEach(() => {
  context = { theme: "dark", custom: null, select };
  useThemeFiles.mockReturnValue({ data: undefined });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ThemePicker", () => {
  it("offers Synthseek, Midnight, Ocean and Custom, in that order, in one radiogroup", () => {
    render(<ThemePicker editing={false} />);

    const group = screen.getByRole("radiogroup", { name: "Color theme" });
    const names = screen.getAllByRole("radio").map((radio) => radio.getAttribute("aria-label"));

    expect(group).toContainElement(screen.getAllByRole("radio")[3]);
    expect(names).toEqual(["Synthseek", "Midnight", "Ocean", "Custom"]);
  });

  it("marks the account's theme as selected and says the choice follows the account", () => {
    context = { theme: "ocean", custom: null, select };
    render(<ThemePicker editing={false} />);

    expect(screen.getByRole("radio", { name: "Ocean" })).toBeChecked();
    expect(screen.getByText(/For your account, on every device\./)).toBeInTheDocument();
  });

  it("selects through the theme context, Custom included", async () => {
    render(<ThemePicker editing={false} />);

    await userEvent.click(screen.getByRole("radio", { name: "Midnight" }));
    await userEvent.click(screen.getByRole("radio", { name: "Custom" }));

    expect(select).toHaveBeenNthCalledWith(1, "midnight");
    expect(select).toHaveBeenNthCalledWith(2, "custom");
  });

  it("paints the Custom miniature with the custom theme and its base once the account has one", () => {
    context = { theme: "dark", custom, select };
    const { container } = render(<ThemePicker editing={false} />);

    const miniature = container.querySelector('[data-theme="custom"]');

    expect(miniature).toHaveAttribute("data-theme-base", "ocean");
  });

  it("paints the Custom miniature with the current preset before a custom theme exists", () => {
    context = { theme: "midnight", custom: null, select };
    const { container } = render(<ThemePicker editing={false} />);

    expect(container.querySelector('[data-theme="custom"]')).toBeNull();
    expect(container.querySelectorAll('[data-theme="midnight"]')).toHaveLength(2);
    expect(useThemeFiles).toHaveBeenLastCalledWith(false);
  });

  it("paints the Custom miniature from the saved tokens while another theme is active", () => {
    context = { theme: "dark", custom, select };
    useThemeFiles.mockReturnValue({ data: savedFiles });
    const { container } = render(<ThemePicker editing={false} />);

    const miniature = customMiniature(container);

    expect(useThemeFiles).toHaveBeenLastCalledWith(true);
    expect(miniature?.style.getPropertyValue("--surface")).toBe("red");
    expect(miniature?.getAttribute("style")).not.toContain("keyframes");
  });

  it.each([
    ["Custom is the active theme", { theme: "custom" as const, previewing: false }],
    ["the draft is being previewed", { theme: "dark" as const, previewing: true }],
  ])("leaves the Custom miniature to the sheet on the page while %s", (_case, painted) => {
    context = { ...painted, custom, select };
    useThemeFiles.mockReturnValue({ data: savedFiles });
    const { container } = render(<ThemePicker editing={false} />);

    expect(useThemeFiles).toHaveBeenLastCalledWith(false);
    expect(customMiniature(container)?.style.getPropertyValue("--surface")).toBe("");
  });

  it("offers to edit the custom theme without applying it only when it exists, is not active and the editor is closed", async () => {
    context = { theme: "dark", custom, select };
    render(<ThemePicker editing={false} />);

    await userEvent.click(screen.getByRole("button", { name: "Edit my custom theme without applying it" }));

    expect(setEditParam).toHaveBeenCalledWith("1");
  });

  it("hides the edit link without a custom theme", () => {
    render(<ThemePicker editing={false} />);

    expect(screen.queryByRole("button", { name: /Edit my custom theme/ })).not.toBeInTheDocument();
  });

  it("hides the edit link while Custom is the active theme", () => {
    context = { theme: "custom", custom, select };
    render(<ThemePicker editing={false} />);

    expect(screen.queryByRole("button", { name: /Edit my custom theme/ })).not.toBeInTheDocument();
  });

  it("hides the edit link while the editor is already open", () => {
    context = { theme: "dark", custom, select };
    render(<ThemePicker editing />);

    expect(screen.queryByRole("button", { name: /Edit my custom theme/ })).not.toBeInTheDocument();
  });
});
