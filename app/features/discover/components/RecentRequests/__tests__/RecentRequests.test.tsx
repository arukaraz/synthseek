import { afterEach, describe, expect, it, vi } from "vitest";

import i18n from "@locale";
import type { FlatTrackRow } from "@features/requests/types";
import { mockRouter, resetNextMocks } from "@test/mocks";
import { renderWithProviders, screen } from "@test/test-utils";

import { RecentRequests } from "../RecentRequests";
import { createFlatTrackRow } from "./fixtures";

interface RecentRequestsResult {
  recent: FlatTrackRow[];
  isLoading: boolean;
  isError: boolean;
  limit: number;
}

const useRecentRequestsMock = vi.fn<() => RecentRequestsResult>();

vi.mock("../../../hooks/useRecentRequests", () => ({
  useRecentRequests: () => useRecentRequestsMock(),
}));

vi.mock("../RecentRequestCard", () => ({
  RecentRequestCard: ({ request, layout }: { request: FlatTrackRow; layout: string }) => (
    <div data-testid="card" data-layout={layout}>
      {request.title}
    </div>
  ),
}));

function buildResult(overrides: Partial<RecentRequestsResult> = {}): RecentRequestsResult {
  return {
    recent: [createFlatTrackRow()],
    isLoading: false,
    isError: false,
    limit: 15,
    ...overrides,
  };
}

describe("RecentRequests", () => {
  afterEach(() => {
    vi.clearAllMocks();
    useRecentRequestsMock.mockReset();
    resetNextMocks();
  });

  it("renders the skeleton and header while loading", () => {
    useRecentRequestsMock.mockReturnValue(buildResult({ isLoading: true, recent: [] }));

    const { container } = renderWithProviders(<RecentRequests size="L" info="Your latest requests" />);

    expect(screen.getByText(i18n.t("discover:recentRequests.title"))).toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).not.toBeNull();
    expect(screen.queryByTestId("card")).not.toBeInTheDocument();
  });

  it("renders the error empty state when the query errors", () => {
    useRecentRequestsMock.mockReturnValue(buildResult({ isError: true, recent: [] }));

    renderWithProviders(<RecentRequests size="L" info="Your latest requests" />);

    expect(screen.getByText(i18n.t("discover:recentRequests.errorTitle"))).toBeInTheDocument();
  });

  it("renders the empty state when there are no recent requests", () => {
    useRecentRequestsMock.mockReturnValue(buildResult({ recent: [] }));

    renderWithProviders(<RecentRequests size="L" info="Your latest requests" />);

    expect(screen.getByText(i18n.t("discover:recentRequests.emptyTitle"))).toBeInTheDocument();
  });

  it("renders every recent row as a tile at size L with the limit in the subtitle", () => {
    useRecentRequestsMock.mockReturnValue(
      buildResult({ recent: [createFlatTrackRow({ id: "a" }), createFlatTrackRow({ id: "b" })], limit: 15 })
    );

    renderWithProviders(<RecentRequests size="L" info="Your latest requests" />);

    const cards = screen.getAllByTestId("card");
    expect(cards).toHaveLength(2);
    expect(cards.every((card) => card.dataset.layout === "tile")).toBe(true);
    expect(screen.getByText(i18n.t("discover:recentRequests.subtitle", { count: 15 }))).toBeInTheDocument();
  });

  it("renders the recent rows as compact rows at size M", () => {
    useRecentRequestsMock.mockReturnValue(buildResult({ recent: [createFlatTrackRow({ id: "a" })] }));

    renderWithProviders(<RecentRequests size="M" info="Your latest requests" />);

    expect(screen.getByTestId("card")).toHaveAttribute("data-layout", "row");
  });

  it("shows the widget description in an info tooltip trigger", () => {
    useRecentRequestsMock.mockReturnValue(buildResult());

    renderWithProviders(<RecentRequests size="L" info="Your latest requests" />);

    expect(screen.getByRole("button", { name: /more information/i })).toBeInTheDocument();
  });

  it("navigates to the requests page when the header action is clicked", async () => {
    useRecentRequestsMock.mockReturnValue(buildResult());

    const { user } = renderWithProviders(<RecentRequests size="L" info="Your latest requests" />);
    await user.click(screen.getByRole("button", { name: i18n.t("discover:recentRequests.openAriaLabel") }));

    expect(mockRouter.push).toHaveBeenCalledWith("/requests");
  });
});
