import { describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";
import { PlaylistSyncToggle } from "../PlaylistSyncToggle";

function getIcon() {
  const icon = document.querySelector("[data-rotation]");
  if (!(icon instanceof Element)) {
    throw new Error("sync icon not found");
  }
  return icon;
}

describe("PlaylistSyncToggle", () => {
  it("fires onToggle with the next value when the switch flips", async () => {
    const onToggle = vi.fn();
    const { user } = renderWithProviders(<PlaylistSyncToggle syncEnabled={false} onToggle={onToggle} />);

    await user.click(screen.getByRole("switch"));

    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it("spins the icon one full turn clockwise when turned on", async () => {
    const { user } = renderWithProviders(<PlaylistSyncToggle syncEnabled={false} onToggle={vi.fn()} />);

    expect(getIcon().getAttribute("data-rotation")).toBe("0");

    await user.click(screen.getByRole("switch"));

    expect(getIcon().getAttribute("data-rotation")).toBe("360");
  });

  it("spins the icon one full turn counter-clockwise when turned off", async () => {
    const { user } = renderWithProviders(<PlaylistSyncToggle syncEnabled={true} onToggle={vi.fn()} />);

    await user.click(screen.getByRole("switch"));

    expect(getIcon().getAttribute("data-rotation")).toBe("-360");
  });

  it("disables the switch while pending so it cannot be clicked again", () => {
    renderWithProviders(<PlaylistSyncToggle syncEnabled={false} onToggle={vi.fn()} disabled />);

    expect(screen.getByRole("switch")).toBeDisabled();
  });
});
