import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, fireEvent, renderWithProviders, screen, within } from "@test/test-utils";

import { TopHeader } from "../TopHeader";

interface AuthState {
  currentUser: { username: string; avatar_url: string | null } | null;
  isAdmin: boolean;
}

const { pathnameMock, pushMock, openForResultMock } = vi.hoisted(() => ({
  pathnameMock: vi.fn<() => string>(() => "/"),
  pushMock: vi.fn<(href: string) => void>(),
  openForResultMock: vi.fn<(item: unknown) => void>(),
}));
const searchData = vi.hoisted((): { current: unknown } => ({ current: undefined }));
const auth = vi.hoisted((): { current: AuthState } => ({ current: { currentUser: null, isAdmin: false } }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@modules/providers/AuthProvider", () => ({ useAuthContext: () => auth.current }));

vi.mock("@hooks/api/subscriptions", () => ({
  useVersionState: () => ({ updateAvailable: false, latestVersion: null, currentVersion: "1.0.0" }),
}));

vi.mock("@hooks/api/queries/useSearchContent", () => ({
  useSearchContent: (query: string) => ({ data: query ? searchData.current : undefined }),
}));

vi.mock("@hooks/ui/useDebounce", () => ({ useDebounce: <T,>(value: T) => value }));

vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForResult: openForResultMock }),
}));

const TRACK = {
  id: "t1",
  type: "track",
  title: "Karma Police",
  artists: [{ id: "a1", name: "Radiohead" }],
  album: { id: "al1", name: "OK Computer", images: [] },
  images: [],
};

function renderHeader(onSearch = vi.fn()) {
  renderWithProviders(<TopHeader onSearch={onSearch} initialQuery="" initialScope="all" />);
  return onSearch;
}

function openSearch() {
  act(() => {
    fireEvent.click(screen.getAllByRole("button", { name: "Search" })[0]);
  });
}

function input(): HTMLElement {
  return screen.getByRole("combobox");
}

function type(value: string) {
  fireEvent.change(input(), { target: { value } });
}

beforeEach(() => {
  window.localStorage.clear();
  pathnameMock.mockReturnValue("/");
  searchData.current = { results: { tracks: { items: [TRACK] } } };
  auth.current = { currentUser: null, isAdmin: false };
});

afterEach(() => {
  vi.restoreAllMocks();
  pushMock.mockReset();
  openForResultMock.mockReset();
});

describe("TopHeader", () => {
  it("marks the primary nav chip of the current section", () => {
    pathnameMock.mockReturnValue("/requests");
    renderHeader();

    expect(screen.getByRole("link", { name: "Requests" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Discover" })).not.toHaveAttribute("aria-current");
  });

  it("shows a closed search field with the shortcut, and no input until it opens", () => {
    renderHeader();

    expect(screen.getByText("Search or jump to…")).toBeInTheDocument();
    expect(screen.getByText("Ctrl K")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("opens with the scopes in place of the nav chips and focuses the input", () => {
    renderHeader();
    openSearch();

    expect(input()).toHaveFocus();
    expect(screen.queryByRole("link", { name: "Requests" })).not.toBeInTheDocument();
    const scopes = screen.getAllByRole("radiogroup", { name: "Search in" })[0];
    expect(within(scopes).getByRole("radio", { name: "All" })).toHaveAttribute("aria-checked", "true");
  });

  it("offers the sections and the member's settings home under Go to", () => {
    renderHeader();
    openSearch();

    const options = screen.getAllByRole("option").map((option) => option.textContent);
    expect(options).toEqual([
      expect.stringContaining("Requests"),
      expect.stringContaining("Library"),
      expect.stringContaining("Settings"),
    ]);

    fireEvent.click(screen.getAllByRole("option")[2]);
    expect(pushMock).toHaveBeenCalledWith("/settings/account");
  });

  it("sends an admin's settings entry to the overview", () => {
    auth.current = { currentUser: { username: "dan", avatar_url: null }, isAdmin: true };
    renderHeader();
    openSearch();

    fireEvent.click(screen.getAllByRole("option").at(-1) ?? document.body);

    expect(pushMock).toHaveBeenCalledWith("/settings/overview");
  });

  it("lists quick results while typing and opens the request flow for one", () => {
    renderHeader();
    openSearch();
    type("karma");

    const result = screen.getByRole("option", { name: /Karma Police/ });
    fireEvent.click(result);

    expect(openForResultMock).toHaveBeenCalledWith(TRACK);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("submits the trimmed query with the scope on Enter, and ignores a blank one", () => {
    const onSearch = renderHeader();
    openSearch();

    type("   ");
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(onSearch).not.toHaveBeenCalled();

    type("  daft punk ");
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(onSearch).toHaveBeenCalledWith("daft punk", "all");
  });

  it("moves through the options with the arrows and opens the highlighted one on Enter", () => {
    renderHeader();
    openSearch();
    type("karma");

    fireEvent.keyDown(input(), { key: "ArrowDown" });
    expect(input()).toHaveAttribute("aria-activedescendant", "omni-search-options-0");
    fireEvent.keyDown(input(), { key: "Enter" });

    expect(openForResultMock).toHaveBeenCalledWith(TRACK);
  });

  it("cycles the scope with Tab and closes on Escape", () => {
    const onSearch = renderHeader();
    openSearch();

    fireEvent.keyDown(input(), { key: "Tab" });
    type("nin");
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(onSearch).toHaveBeenCalledWith("nin", "playlist");

    openSearch();
    fireEvent.keyDown(input(), { key: "Escape" });
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("opens from the keyboard shortcut", () => {
    renderHeader();

    act(() => {
      fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    });

    expect(input()).toBeInTheDocument();
  });

  it("leaves the shortcut to the settings palette on settings pages", () => {
    pathnameMock.mockReturnValue("/settings/account");
    renderHeader();

    act(() => {
      fireEvent.keyDown(document.body, { key: "k", ctrlKey: true });
    });

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText("Ctrl K")).not.toBeInTheDocument();
  });

  it("leaves the shortcut to an element that already handled it", () => {
    const claim = (event: KeyboardEvent) => event.preventDefault();
    document.body.addEventListener("keydown", claim);
    renderHeader();

    act(() => {
      fireEvent.keyDown(document.body, { key: "k", ctrlKey: true });
    });
    document.body.removeEventListener("keydown", claim);

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("remembers a submitted search and runs it again from Recent searches", () => {
    const onSearch = renderHeader();
    openSearch();
    type("boards of canada");
    fireEvent.keyDown(input(), { key: "Enter" });
    openSearch();
    type("");

    fireEvent.click(screen.getByRole("option", { name: /boards of canada/ }));

    expect(onSearch).toHaveBeenLastCalledWith("boards of canada", "all");
  });

  it("keeps the search box itself as the phone's way in and out, with no Cancel button", () => {
    renderHeader();
    openSearch();

    expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows the settings gear and the user's avatar on the right when signed in", () => {
    auth.current = { currentUser: { username: "dan", avatar_url: null }, isAdmin: true };
    renderHeader();

    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings/overview");
  });
});
