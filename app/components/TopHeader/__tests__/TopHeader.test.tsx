import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";

import { TopHeader } from "../TopHeader";

const pathnameMock = vi.fn<() => string>(() => "/");

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: null, isAdmin: false }),
}));

vi.mock("@hooks/api/subscriptions", () => ({
  useVersionState: () => ({ updateAvailable: false, latestVersion: null, currentVersion: "1.0.0" }),
}));

vi.mock("@hooks/api/mutations/auth/useLogout", () => ({
  useLogout: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe("TopHeader", () => {
  beforeEach(() => {
    pathnameMock.mockReturnValue("/");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("marks the discover tab active on the root path", () => {
    renderWithProviders(<TopHeader />);

    expect(screen.getByRole("link", { name: "Discover" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Requests" })).not.toHaveAttribute("aria-current");
  });

  it("marks the requests tab active on a requests path", () => {
    pathnameMock.mockReturnValue("/requests");

    renderWithProviders(<TopHeader />);

    expect(screen.getByRole("link", { name: "Requests" })).toHaveAttribute("aria-current", "page");
  });

  it("marks the library tab active on a library path", () => {
    pathnameMock.mockReturnValue("/library");

    renderWithProviders(<TopHeader />);

    expect(screen.getByRole("link", { name: "Library" })).toHaveAttribute("aria-current", "page");
  });

  it("does not render a settings tab in the primary nav", () => {
    pathnameMock.mockReturnValue("/settings/general");

    renderWithProviders(<TopHeader />);

    expect(screen.queryByRole("link", { name: "Settings" })).not.toBeInTheDocument();
  });

  it("seeds the search input with the initial query", () => {
    renderWithProviders(<TopHeader initialQuery="radiohead" />);

    expect(screen.getByPlaceholderText("Search tracks, artists, albums...")).toHaveValue("radiohead");
  });

  it("calls onSearch with the trimmed query on submit", async () => {
    const onSearch = vi.fn();
    const { user } = renderWithProviders(<TopHeader onSearch={onSearch} />);

    const input = screen.getByPlaceholderText("Search tracks, artists, albums...");
    await user.type(input, "  daft punk  ");
    await user.type(input, "{Enter}");

    expect(onSearch).toHaveBeenCalledWith("daft punk");
  });

  it("does not call onSearch when the query is only whitespace", async () => {
    const onSearch = vi.fn();
    const { user } = renderWithProviders(<TopHeader onSearch={onSearch} />);

    const input = screen.getByPlaceholderText("Search tracks, artists, albums...");
    await user.type(input, "   ");
    await user.type(input, "{Enter}");

    expect(onSearch).not.toHaveBeenCalled();
  });

  it("shows the desktop clear button only when there is a query and clears it", async () => {
    const { user } = renderWithProviders(<TopHeader />);

    const input = screen.getByPlaceholderText("Search tracks, artists, albums...");
    await user.type(input, "tycho");

    const clearButton = screen.getByRole("button", { name: "Clear search" });
    await user.click(clearButton);

    expect(input).toHaveValue("");
  });

  it("renders the search input expanded by default without a mobile search toggle", () => {
    renderWithProviders(<TopHeader />);

    expect(screen.getByPlaceholderText("Search tracks, artists, albums...")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Close search" })).not.toBeInTheDocument();
  });

  it("keeps the logo visible on mobile alongside the expanded search", () => {
    renderWithProviders(<TopHeader />);

    const logo = screen.getByLabelText("Synthseek Logo");
    expect(logo).toBeInTheDocument();

    const logoGroup = logo.closest("div.shrink-0");
    expect(logoGroup).not.toBeNull();
    expect(logoGroup?.className).not.toContain("hidden");
    expect(logoGroup?.className).toContain("flex");
  });

  it("gates the primary nav destinations to desktop while the logo stays on mobile", () => {
    renderWithProviders(<TopHeader />);

    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(nav.className).toContain("hidden");
    expect(nav.className).toContain("sm:flex");
  });

  it("applies focus styling when the input is focused and removes it on blur", async () => {
    const { user } = renderWithProviders(<TopHeader />);

    const input = screen.getByPlaceholderText("Search tracks, artists, albums...");
    await user.click(input);
    await user.tab();

    expect(input).not.toHaveFocus();
  });
});
