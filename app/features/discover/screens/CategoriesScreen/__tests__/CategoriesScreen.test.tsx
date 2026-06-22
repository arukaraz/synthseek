import { describe, it, expect, vi, afterEach } from "vitest";
import { renderWithProviders, screen, fireEvent } from "@test/test-utils";
import { createMockQuery, createLoadingQuery, createErrorQuery, mockRouter, resetNextMocks } from "@test/mocks";
import { CategoriesScreen } from "../CategoriesScreen";

interface CategoriesPayload {
  data: { items: { id: string; name: string }[] };
}

const useCategoriesMock = vi.fn();

vi.mock("@hooks/api/queries/useCategories", () => ({
  useCategories: () => useCategoriesMock(),
}));

function buildPayload(items: { id: string; name: string }[]): CategoriesPayload {
  return { data: { items } };
}

const genres = [
  { id: "rock", name: "Rock" },
  { id: "jazz", name: "Jazz" },
];

describe("CategoriesScreen", () => {
  afterEach(() => {
    vi.clearAllMocks();
    useCategoriesMock.mockReset();
    resetNextMocks();
  });

  it("renders the loading copy and skeleton tiles while loading", () => {
    useCategoriesMock.mockReturnValue(createLoadingQuery<CategoriesPayload>());

    const { container } = renderWithProviders(<CategoriesScreen />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders the error empty state when the query errors", () => {
    useCategoriesMock.mockReturnValue(createErrorQuery<CategoriesPayload>(new Error("boom")));

    renderWithProviders(<CategoriesScreen />);

    expect(screen.getByText("Failed to load genres")).toBeInTheDocument();
  });

  it("renders the empty state when there are no genres", () => {
    useCategoriesMock.mockReturnValue(createMockQuery<CategoriesPayload>(buildPayload([])));

    renderWithProviders(<CategoriesScreen />);

    expect(screen.getByText("No Genres")).toBeInTheDocument();
  });

  it("renders the genre count and a card per genre", () => {
    useCategoriesMock.mockReturnValue(createMockQuery<CategoriesPayload>(buildPayload(genres)));

    renderWithProviders(<CategoriesScreen />);

    expect(screen.getByText("2 genres")).toBeInTheDocument();
    expect(screen.getByText("Rock")).toBeInTheDocument();
    expect(screen.getByText("Jazz")).toBeInTheDocument();
  });

  it("navigates back when the back button is clicked", () => {
    useCategoriesMock.mockReturnValue(createMockQuery<CategoriesPayload>(buildPayload(genres)));

    renderWithProviders(<CategoriesScreen />);
    fireEvent.click(screen.getByText("Back"));

    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it("navigates to the category route when a card is clicked", () => {
    useCategoriesMock.mockReturnValue(createMockQuery<CategoriesPayload>(buildPayload(genres)));

    renderWithProviders(<CategoriesScreen />);
    fireEvent.click(screen.getByText("Rock"));

    expect(mockRouter.push).toHaveBeenCalledWith("/discover/category/rock?name=Rock");
  });
});
