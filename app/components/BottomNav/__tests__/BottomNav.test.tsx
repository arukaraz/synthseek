import { describe, it, expect, vi, afterEach } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";

import { BottomNav } from "../BottomNav";

const navState = vi.hoisted(() => {
  const Glyph = () => null;
  return {
    items: [
      { href: "/", icon: Glyph, label: "Discover", isActive: true },
      { href: "/requests", icon: Glyph, label: "Requests", isActive: false },
      { href: "/library", icon: Glyph, label: "Library", isActive: false },
    ],
  };
});

vi.mock("@hooks/ui/usePrimaryNav", () => ({
  usePrimaryNav: () => navState.items,
}));

vi.mock("../../UserAvatarMenu", () => ({
  UserAvatarMenu: () => <button type="button">avatar</button>,
}));

describe("BottomNav", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders one link per primary nav item with its label", () => {
    renderWithProviders(<BottomNav />);

    expect(screen.getByRole("link", { name: "Discover" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Requests" })).toHaveAttribute("href", "/requests");
    expect(screen.getByRole("link", { name: "Library" })).toHaveAttribute("href", "/library");
  });

  it("marks the active item with aria-current and leaves the others unmarked", () => {
    renderWithProviders(<BottomNav />);

    expect(screen.getByRole("link", { name: "Discover" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Requests" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Library" })).not.toHaveAttribute("aria-current");
  });

  it("exposes a distinctly named navigation landmark and keeps the avatar menu reachable", () => {
    renderWithProviders(<BottomNav />);

    expect(screen.getByRole("navigation", { name: "Mobile" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "avatar" })).toBeInTheDocument();
  });
});
