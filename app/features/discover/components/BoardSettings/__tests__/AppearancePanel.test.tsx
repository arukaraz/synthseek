import { describe, expect, it, vi } from "vitest";

import type { BoardAppearance } from "@hooks/api/queries/board/types";
import { fireEvent, render, screen } from "@test/test-utils";

import type { BoardBackground } from "../../ExploreBoard/types";
import { AppearancePanel } from "../AppearancePanel";

const LOOK: BoardAppearance = { density: "comfortable", text: "default" };

function renderPanel(background: BoardBackground = "on", appearance: BoardAppearance | null = LOOK) {
  const onAppearance = vi.fn<(appearance: BoardAppearance) => void>();
  const onBackground = vi.fn<(shown: boolean) => void>();
  render(
    <AppearancePanel
      appearance={appearance ?? undefined}
      onAppearance={onAppearance}
      background={background}
      onBackground={onBackground}
    />
  );
  return { onAppearance, onBackground };
}

describe("AppearancePanel", () => {
  it("hands up the density and the text size the member picks, keeping the other axis", () => {
    const { onAppearance } = renderPanel();

    fireEvent.click(screen.getByRole("radio", { name: "Compact" }));
    fireEvent.click(screen.getByRole("radio", { name: "Large" }));

    expect(onAppearance.mock.calls).toEqual([
      [{ density: "compact", text: "default" }],
      [{ density: "comfortable", text: "large" }],
    ]);
  });

  it("offers no density or text choice until the member's own look has loaded", () => {
    renderPanel("on", null);

    expect(screen.queryByRole("radio", { name: "Comfortable" })).toBeNull();
    expect(screen.queryByRole("radio", { name: "Default" })).toBeNull();
  });

  it("hands up the background of the whole board and leaves the look alone", () => {
    const { onAppearance, onBackground } = renderPanel("on");

    fireEvent.click(screen.getByRole("radio", { name: "Off" }));

    expect(onBackground).toHaveBeenCalledWith(false);
    expect(onAppearance).not.toHaveBeenCalled();
  });

  it.each([
    ["on", "true", "false"],
    ["off", "false", "true"],
  ] as const)("shows a board read as %s with that choice marked", (background, on, off) => {
    renderPanel(background);

    expect(screen.getByRole("radio", { name: "On" })).toHaveAttribute("aria-checked", on);
    expect(screen.getByRole("radio", { name: "Off" })).toHaveAttribute("aria-checked", off);
  });

  it("sits in a card named Appearance with no heading or hint of its own", () => {
    renderPanel();

    expect(screen.getByRole("region", { name: "Appearance" })).toBeInTheDocument();
    expect(screen.queryByRole("heading")).toBeNull();
  });
});
