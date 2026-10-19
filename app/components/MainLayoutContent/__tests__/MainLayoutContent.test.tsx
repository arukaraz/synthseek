import { describe, it, expect, vi, afterEach } from "vitest";

import { render, renderWithUser, screen } from "@test/test-utils";

import { MainLayoutContent } from "../MainLayoutContent";

const pushMock = vi.fn();
const getParamMock = vi.fn<(key: string) => string | null>(() => null);
const useSubscriptionsMock = vi.fn();
const useRehydrateRequestDockMock = vi.fn();
const useRehydratePlaylistSyncDockMock = vi.fn();
const useReviewApprovalDockMock = vi.fn();
const useHashTargetGlowMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: (key: string) => getParamMock(key) }),
}));

vi.mock("@hooks/api/subscriptions", () => ({
  useSubscriptions: () => useSubscriptionsMock(),
  useRehydrateRequestDock: () => useRehydrateRequestDockMock(),
  useRehydratePlaylistSyncDock: () => useRehydratePlaylistSyncDockMock(),
  useReviewApprovalDock: () => useReviewApprovalDockMock(),
}));

vi.mock("@hooks/ui/useHashTargetGlow", () => ({
  useHashTargetGlow: () => useHashTargetGlowMock(),
}));

vi.mock("@components/TopHeader", () => ({
  TopHeader: ({
    onSearch,
    initialQuery,
    initialScope,
  }: {
    onSearch: (q: string, scope: string) => void;
    initialQuery: string;
    initialScope: string;
  }) => (
    <header>
      <span data-testid="initial-query">{initialQuery}</span>
      <span data-testid="initial-scope">{initialScope}</span>
      <button type="button" onClick={() => onSearch("synth", initialScope)}>
        do-search
      </button>
      <button type="button" onClick={() => onSearch("boards of canada", "all")}>
        spaced-search
      </button>
    </header>
  ),
}));

vi.mock("@components/ContentShell", () => ({
  ContentShell: ({ children, banner }: { children: React.ReactNode; banner?: React.ReactNode }) => (
    <main data-testid="content-shell">
      <div data-testid="content-shell-banner">{banner}</div>
      {children}
    </main>
  ),
}));

vi.mock("@components/SystemStatusBanner", () => ({
  SystemStatusBanner: () => <section data-testid="system-status-banner" />,
}));

vi.mock("@components/BottomNav", () => ({
  BottomNav: () => <nav data-testid="bottom-nav" />,
}));

vi.mock("@components/ui/ProgressDock", () => ({
  ProgressDock: () => null,
}));

vi.mock("@components/PlayerDock", () => ({
  PlayerDock: () => null,
}));

vi.mock("@features/search/components/ContentRequestFlow", () => ({
  ContentRequestFlow: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("MainLayoutContent", () => {
  afterEach(() => {
    vi.clearAllMocks();
    getParamMock.mockReturnValue(null);
  });

  it("wires the page subscriptions, every dock rehydration, and the hash glow effect", () => {
    render(
      <MainLayoutContent>
        <p>child</p>
      </MainLayoutContent>
    );

    expect(useSubscriptionsMock).toHaveBeenCalledTimes(1);
    expect(useRehydrateRequestDockMock).toHaveBeenCalledTimes(1);
    expect(useRehydratePlaylistSyncDockMock).toHaveBeenCalledTimes(1);
    expect(useReviewApprovalDockMock).toHaveBeenCalledTimes(1);
    expect(useHashTargetGlowMock).toHaveBeenCalledTimes(1);
  });

  it("renders children inside the content shell", () => {
    render(
      <MainLayoutContent>
        <p>child</p>
      </MainLayoutContent>
    );

    expect(screen.getByTestId("content-shell")).toHaveTextContent("child");
  });

  it("mounts the system status notice in the content shell's banner slot, so it spans every page", () => {
    render(
      <MainLayoutContent>
        <p>child</p>
      </MainLayoutContent>
    );

    expect(screen.getByTestId("content-shell-banner")).toContainElement(screen.getByTestId("system-status-banner"));
  });

  it("seeds the header with the q search param", () => {
    getParamMock.mockImplementation((key) => (key === "q" ? "tycho" : null));

    render(
      <MainLayoutContent>
        <p>child</p>
      </MainLayoutContent>
    );

    expect(screen.getByTestId("initial-query")).toHaveTextContent("tycho");
  });

  it("seeds the header scope with a valid filter param and falls back to all for an unknown one", () => {
    getParamMock.mockImplementation((key) => (key === "filter" ? "album" : null));
    const { unmount } = render(
      <MainLayoutContent>
        <p>child</p>
      </MainLayoutContent>
    );
    expect(screen.getByTestId("initial-scope")).toHaveTextContent("album");
    unmount();

    getParamMock.mockImplementation((key) => (key === "filter" ? "albums" : null));
    render(
      <MainLayoutContent>
        <p>child</p>
      </MainLayoutContent>
    );
    expect(screen.getByTestId("initial-scope")).toHaveTextContent("all");
  });

  it("pushes a search route carrying the chosen scope", async () => {
    getParamMock.mockImplementation((key) => (key === "filter" ? "album" : null));

    const { user } = renderWithUser(
      <MainLayoutContent>
        <p>child</p>
      </MainLayoutContent>
    );

    await user.click(screen.getByRole("button", { name: "do-search" }));

    expect(pushMock).toHaveBeenCalledWith("/search?q=synth&filter=album");
  });

  it("pushes a search route without a filter when none is set", async () => {
    const { user } = renderWithUser(
      <MainLayoutContent>
        <p>child</p>
      </MainLayoutContent>
    );

    await user.click(screen.getByRole("button", { name: "do-search" }));

    expect(pushMock).toHaveBeenCalledWith("/search?q=synth");
  });

  it("encodes the query and leaves the filter out for the all scope", async () => {
    const { user } = renderWithUser(
      <MainLayoutContent>
        <p>child</p>
      </MainLayoutContent>
    );

    await user.click(screen.getByRole("button", { name: "spaced-search" }));

    expect(pushMock).toHaveBeenCalledWith("/search?q=boards%20of%20canada");
  });
});
