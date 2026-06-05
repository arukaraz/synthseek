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

  it("marks the settings tab active on a settings path", () => {
    pathnameMock.mockReturnValue("/settings/general");

    renderWithProviders(<TopHeader />);

    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("aria-current", "page");
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

  it("opens the mobile search and closes it via the close button", async () => {
    const { user } = renderWithProviders(<TopHeader />);

    const triggerButton = screen.getByTitle("Search");
    await user.click(triggerButton);

    const input = screen.getByPlaceholderText("Search tracks, artists, albums...");
    await user.type(input, "boards");

    await user.click(screen.getByRole("button", { name: "Close search" }));

    expect(input).toHaveValue("");
    expect(screen.getByTitle("Search")).toBeInTheDocument();
  });

  it("closes the mobile search when Escape is pressed", async () => {
    const { user } = renderWithProviders(<TopHeader />);

    const input = screen.getByPlaceholderText("Search tracks, artists, albums...");
    await user.type(input, "aphex");
    await user.type(input, "{Escape}");

    expect(input).toHaveValue("");
  });

  it("applies focus styling when the input is focused and removes it on blur", async () => {
    const { user } = renderWithProviders(<TopHeader />);

    const input = screen.getByPlaceholderText("Search tracks, artists, albums...");
    await user.click(input);
    await user.tab();

    expect(input).not.toHaveFocus();
  });
});
