import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CustomThemeSummary, Theme } from "@theme/ThemeProvider";

import { ThemeSection } from "../ThemeSection";

let context: { theme: Theme; custom: CustomThemeSummary | null };
let editParam: string | undefined;

vi.mock("@theme/ThemeProvider", () => ({
  useThemeContext: () => context,
}));

vi.mock("@hooks/ui/useUrlParam", () => ({
  useUrlParam: () => [editParam, vi.fn()],
}));

vi.mock("../components/ThemePicker", () => ({
  ThemePicker: ({ editing }: { editing: boolean }) => <div data-testid="picker" data-editing={String(editing)} />,
}));

vi.mock("../components/ThemeEditorCard", () => ({
  ThemeEditorCard: ({ safeEdit }: { safeEdit: boolean }) => <div data-testid="editor" data-safe={String(safeEdit)} />,
}));

const custom: CustomThemeSummary = {
  name: "Mine",
  scheme: "dark",
  startedFrom: "dark",
  follows: [],
  fingerprint: "abc",
  folder: "mine",
};

beforeEach(() => {
  context = { theme: "dark", custom: null };
  editParam = undefined;
});

afterEach(() => {
  cleanup();
});

describe("ThemeSection", () => {
  it("shows only the picker for an account without a custom theme", () => {
    render(<ThemeSection />);

    expect(screen.getByTestId("picker")).toHaveAttribute("data-editing", "false");
    expect(screen.queryByTestId("editor")).not.toBeInTheDocument();
  });

  it("shows the editor while Custom is the active theme", () => {
    context = { theme: "custom", custom };
    render(<ThemeSection />);

    expect(screen.getByTestId("editor")).toHaveAttribute("data-safe", "false");
    expect(screen.getByTestId("picker")).toHaveAttribute("data-editing", "true");
  });

  it("hides the editor once a preset is selected and the edit param is absent", () => {
    context = { theme: "ocean", custom };
    render(<ThemeSection />);

    expect(screen.queryByTestId("editor")).not.toBeInTheDocument();
  });

  it("keeps the editor open beside a preset when the edit param is present", () => {
    context = { theme: "ocean", custom };
    editParam = "1";
    render(<ThemeSection />);

    expect(screen.getByTestId("editor")).toHaveAttribute("data-safe", "true");
  });

  it("never opens the editor before the account has a custom theme, even with the param", () => {
    editParam = "1";
    render(<ThemeSection />);

    expect(screen.queryByTestId("editor")).not.toBeInTheDocument();
  });
});
