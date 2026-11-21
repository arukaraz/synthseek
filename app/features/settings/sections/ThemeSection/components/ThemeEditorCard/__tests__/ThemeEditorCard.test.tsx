import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { makeEditor } from "../../../__tests__/fixtures";
import type { ThemeEditor } from "../../../types";
import { ThemeEditorCard } from "../ThemeEditorCard";

let loaded: ThemeEditor | null = null;

vi.mock("../../../hooks/useThemeEditor", () => ({
  useThemeEditor: () => loaded,
}));

vi.mock("../EditorFrame", () => ({
  EditorFrame: ({ safeEdit }: { safeEdit: boolean }) => <div data-testid="frame" data-safe={String(safeEdit)} />,
}));

afterEach(() => {
  cleanup();
  loaded = null;
});

describe("ThemeEditorCard", () => {
  it("shows the standard section loader under the title while the account's files load", () => {
    const { container } = render(<ThemeEditorCard safeEdit={false} />);

    expect(screen.getByRole("heading", { name: "Custom theme" })).toBeInTheDocument();
    expect(screen.getByText("Loading your theme")).toBeInTheDocument();
    expect(screen.queryByTestId("frame")).not.toBeInTheDocument();
    expect(container.querySelector('[data-part="card"]')).not.toBeNull();
  });

  it("hands the loaded editor to the frame, with the safe-edit flag", () => {
    loaded = makeEditor();
    render(<ThemeEditorCard safeEdit />);

    expect(screen.getByTestId("frame")).toHaveAttribute("data-safe", "true");
    expect(screen.queryByText("Loading your theme")).not.toBeInTheDocument();
  });
});
