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
  TopHeader: ({ onSearch, initialQuery }: { onSearch: (q: string) => void; initialQuery: string }) => (
    <header>
      <span data-testid="initial-query">{initialQuery}</span>
      <button type="button" onClick={() => onSearch("synth")}>
        do-search
      </button>
      <button type="button" onClick={() => onSearch("   ")}>
        empty-search
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

  it("pushes a search route preserving the active filter", async () => {
    getParamMock.mockImplementation((key) => (key === "filter" ? "albums" : null));

    const { user } = renderWithUser(
      <MainLayoutContent>
        <p>child</p>
      </MainLayoutContent>
    );

    await user.click(screen.getByRole("button", { name: "do-search" }));

    expect(pushMock).toHaveBeenCalledWith("/search?q=synth&filter=albums");
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

  it("pushes back to the root when the query is empty", async () => {
    const { user } = renderWithUser(
      <MainLayoutContent>
        <p>child</p>
      </MainLayoutContent>
    );

    await user.click(screen.getByRole("button", { name: "empty-search" }));

    expect(pushMock).toHaveBeenCalledWith("/");
  });
});
