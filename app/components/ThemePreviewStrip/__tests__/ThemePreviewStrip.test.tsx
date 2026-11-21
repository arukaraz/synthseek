import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemePreviewStrip } from "../ThemePreviewStrip";

const push = vi.fn();
const stopPreview = vi.fn();
let previewing: boolean;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@theme/ThemeProvider", () => ({
  useThemeContext: () => ({ previewing, stopPreview }),
}));

beforeEach(() => {
  previewing = true;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ThemePreviewStrip", () => {
  it("renders nothing while the theme is not being previewed", () => {
    previewing = false;
    const { container } = render(<ThemePreviewStrip />);

    expect(container).toBeEmptyDOMElement();
  });

  it("says the draft is a preview and that nothing is saved", () => {
    render(<ThemePreviewStrip />);

    expect(screen.getByText("Preview.").tagName).toBe("STRONG");
    expect(screen.getByText(/Nothing is saved until you go back and press Save\./)).toBeInTheDocument();
  });

  it("stops the preview and goes back to the editor with the edit param", async () => {
    render(<ThemePreviewStrip />);

    await userEvent.click(screen.getByRole("button", { name: "Back to the editor" }));

    expect(stopPreview).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/settings/customization/theme?edit=1");
  });

  it("keeps the editor out of the root bundle", () => {
    const directory = join(__dirname, "..");
    const sources = readdirSync(directory)
      .filter((name) => name.endsWith(".ts") || name.endsWith(".tsx"))
      .map((name) => readFileSync(join(directory, name), "utf8"));

    for (const source of sources) {
      expect(source).not.toContain("@theme/custom");
      expect(source).not.toContain("@theme/contract");
    }
  });
});
