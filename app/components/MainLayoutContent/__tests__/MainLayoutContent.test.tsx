import { describe, it, expect, vi, afterEach } from "vitest";

import { render, renderWithUser, screen } from "@test/test-utils";

import { MainLayoutContent } from "../MainLayoutContent";

const pushMock = vi.fn();
const getParamMock = vi.fn<(key: string) => string | null>(() => null);
const useSubscriptionsMock = vi.fn();
const useRehydrateRequestDockMock = vi.fn();
const useRehydratePlexSyncDockMock = vi.fn();
const useHashTargetGlowMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: (key: string) => getParamMock(key) }),
}));

vi.mock("@hooks/api/subscriptions", () => ({
  useSubscriptions: () => useSubscriptionsMock(),
  useRehydrateRequestDock: () => useRehydrateRequestDockMock(),
  useRehydratePlexSyncDock: () => useRehydratePlexSyncDockMock(),
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
  ContentShell: ({ children }: { children: React.ReactNode }) => <main data-testid="content-shell">{children}</main>,
}));

vi.mock("@components/BottomNav", () => ({
  BottomNav: () => <nav data-testid="bottom-nav" />,
}));

vi.mock("@components/ui/ProgressDock", () => ({
  ProgressDock: () => null,
}));

vi.mock("@features/search/components/ContentRequestFlow", () => ({
  ContentRequestFlow: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("MainLayoutContent", () => {
  afterEach(() => {
    vi.clearAllMocks();
    getParamMock.mockReturnValue(null);
  });

  it("wires the page subscriptions, both dock rehydrations, and the hash glow effect", () => {
    render(
      <MainLayoutContent>
        <p>child</p>
      </MainLayoutContent>
    );

    expect(useSubscriptionsMock).toHaveBeenCalledTimes(1);
    expect(useRehydrateRequestDockMock).toHaveBeenCalledTimes(1);
    expect(useRehydratePlexSyncDockMock).toHaveBeenCalledTimes(1);
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
