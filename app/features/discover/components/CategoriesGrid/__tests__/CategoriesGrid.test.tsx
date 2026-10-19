import { describe, it, expect, vi, afterEach } from "vitest";
import { renderWithProviders, screen, fireEvent } from "@test/test-utils";
import { createMockQuery, createLoadingQuery, createErrorQuery, mockRouter, resetNextMocks } from "@test/mocks";
import enDiscover from "@modules/i18n/messages/en/discover.json";
import { CategoriesGrid } from "../CategoriesGrid";

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

describe("CategoriesGrid", () => {
  afterEach(() => {
    vi.clearAllMocks();
    useCategoriesMock.mockReset();
    resetNextMocks();
  });

  it("renders the skeleton while loading", () => {
    useCategoriesMock.mockReturnValue(createLoadingQuery<CategoriesPayload>());

    const { container } = renderWithProviders(<CategoriesGrid size="M+" info="Browse genres" />);

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders the error empty state when the query errors", () => {
    useCategoriesMock.mockReturnValue(createErrorQuery<CategoriesPayload>(new Error("boom")));

    renderWithProviders(<CategoriesGrid size="M+" info="Browse genres" />);

    expect(screen.getByText(enDiscover.categories.grid.errorTitle)).toBeInTheDocument();
  });

  it("renders the empty state when there are no categories", () => {
    useCategoriesMock.mockReturnValue(createMockQuery<CategoriesPayload>(buildPayload([])));

    renderWithProviders(<CategoriesGrid size="M+" info="Browse genres" />);

    expect(screen.getByText(enDiscover.categories.grid.emptyTitle)).toBeInTheDocument();
  });

  it("renders one card per category up to the limit", () => {
    useCategoriesMock.mockReturnValue(createMockQuery<CategoriesPayload>(buildPayload(genres)));

    renderWithProviders(<CategoriesGrid size="M+" info="Browse genres" />);

    expect(screen.getByText("Rock")).toBeInTheDocument();
    expect(screen.getByText("Jazz")).toBeInTheDocument();
  });

  it("navigates to the category route when a card is clicked", () => {
    useCategoriesMock.mockReturnValue(createMockQuery<CategoriesPayload>(buildPayload(genres)));

    renderWithProviders(<CategoriesGrid size="M+" info="Browse genres" />);
    fireEvent.click(screen.getByText("Rock"));

    expect(mockRouter.push).toHaveBeenCalledWith("/discover/category/rock?name=Rock");
  });

  it("navigates to the all-categories route from the see-all action", () => {
    useCategoriesMock.mockReturnValue(createMockQuery<CategoriesPayload>(buildPayload(genres)));

    renderWithProviders(<CategoriesGrid size="M+" info="Browse genres" />);
    fireEvent.click(screen.getByRole("button", { name: enDiscover.categories.grid.seeAllAriaLabel }));

    expect(mockRouter.push).toHaveBeenCalledWith("/discover/categories");
  });

  it("lays the mosaic out in two columns at the half-width size", () => {
    useCategoriesMock.mockReturnValue(createMockQuery<CategoriesPayload>(buildPayload(genres)));

    renderWithProviders(<CategoriesGrid size="M+" info="Browse genres" />);

    expect(screen.getByText("Rock").closest(".grid")).toHaveClass("grid-cols-2");
  });

  it("lays the mosaic out in four columns at the full-width size", () => {
    useCategoriesMock.mockReturnValue(createMockQuery<CategoriesPayload>(buildPayload(genres)));

    renderWithProviders(<CategoriesGrid size="XL" info="Browse genres" />);

    expect(screen.getByText("Rock").closest(".grid")).toHaveClass("grid-cols-4");
  });

  it("encodes category names with spaces in the navigation URL", () => {
    useCategoriesMock.mockReturnValue(
      createMockQuery<CategoriesPayload>(buildPayload([{ id: "hip-hop", name: "Hip Hop" }]))
    );

    renderWithProviders(<CategoriesGrid size="M+" info="Browse genres" />);
    fireEvent.click(screen.getByText("Hip Hop"));

    expect(mockRouter.push).toHaveBeenCalledWith("/discover/category/hip-hop?name=Hip%20Hop");
  });
});
