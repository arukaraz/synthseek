import { describe, it, expect, vi } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../../LibraryFilterSidebar/LibraryFilterSidebar", () => ({
  LibraryFilterSidebar: ({ onToggleValue }: { onToggleValue: (key: string, value: string) => void }) => (
    <button type="button" data-testid="sidebar" onClick={() => onToggleValue("source", "deezer")}>
      sidebar
    </button>
  ),
}));

vi.mock("../../LibraryFilterSheet/LibraryFilterSheet", () => ({
  LibraryFilterSheet: ({ open }: { open: boolean }) => <div data-testid="sheet">{open ? "open" : "closed"}</div>,
}));

vi.mock("../../LibraryTable/LibraryTable", () => ({
  LibraryTable: () => <div data-testid="table" />,
}));

vi.mock("../../LibraryCard", () => ({
  LibraryInfiniteGrid: () => <div data-testid="grid" />,
}));

vi.mock("@components/ui/Pagination", () => ({
  Pagination: () => <div data-testid="pagination" />,
}));

import { VIEW_CONFIG } from "../../../constants";
import { LibraryViewLayout } from "../LibraryViewLayout";
import type { LibraryViewLayoutProps } from "../types";

interface Row {
  id: string;
  name: string;
}

function makeController() {
  return {
    config: VIEW_CONFIG.tracks,
    filters: {},
    facetSearch: {},
    page: 1,
    pageSize: 50,
    setFilterValues: vi.fn(),
    setOrphan: vi.fn(),
    setFacetSearch: vi.fn(),
    clearFilters: vi.fn(),
    setPage: vi.fn(),
    setPageSize: vi.fn(),
  } as unknown as LibraryViewLayoutProps<Row>["controller"];
}

function tableProps(overrides?: Partial<LibraryViewLayoutProps<Row>>): LibraryViewLayoutProps<Row> {
  return {
    controller: makeController(),
    items: [{ id: "1", name: "Alpha" }],
    total: 1,
    facets: {},
    isLoading: false,
    isError: false,
    content: {
      layout: "table",
      columns: [],
      getRowId: (item: Row) => item.id,
    },
    filtersOpen: false,
    onFiltersOpenChange: vi.fn(),
    ...overrides,
  };
}

function gridProps(overrides?: Partial<LibraryViewLayoutProps<Row>>): LibraryViewLayoutProps<Row> {
  return {
    ...tableProps(),
    controller: { ...makeController(), config: VIEW_CONFIG.albums },
    content: {
      layout: "grid",
      renderCard: () => <li>card</li>,
      getCardId: (item: Row) => item.id,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    },
    ...overrides,
  };
}

describe("LibraryViewLayout", () => {
  it("renders the error empty-state when isError is true", () => {
    renderWithProviders(<LibraryViewLayout {...tableProps({ isError: true })} />);

    expect(screen.getByText("page.error.title")).toBeInTheDocument();
    expect(screen.queryByTestId("table")).not.toBeInTheDocument();
  });

  it("renders the loading spinner when loading with no items yet", () => {
    renderWithProviders(<LibraryViewLayout {...tableProps({ isLoading: true, items: undefined })} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders the per-view empty-state when items is an empty list", () => {
    renderWithProviders(<LibraryViewLayout {...tableProps({ items: [] })} />);

    expect(screen.getByText(VIEW_CONFIG.tracks.emptyTitleKey)).toBeInTheDocument();
  });

  it("renders the table and pagination for a table layout with results", () => {
    renderWithProviders(<LibraryViewLayout {...tableProps()} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });

  it("renders the infinite grid and no pagination for a grid layout", () => {
    renderWithProviders(<LibraryViewLayout {...gridProps()} />);

    expect(screen.getByTestId("grid")).toBeInTheDocument();
    expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
  });

  it("passes the filtersOpen flag through to the mobile sheet", () => {
    renderWithProviders(<LibraryViewLayout {...tableProps({ filtersOpen: true })} />);

    expect(screen.getByTestId("sheet")).toHaveTextContent("open");
  });

  it("routes a sidebar facet toggle into the controller's setFilterValues", async () => {
    const setFilterValues = vi.fn();
    const props = tableProps();
    props.controller = { ...makeController(), setFilterValues } as unknown as typeof props.controller;

    const { user } = renderWithProviders(<LibraryViewLayout {...props} />);

    await user.click(screen.getAllByTestId("sidebar")[0]);

    expect(setFilterValues).toHaveBeenCalledWith("source", ["deezer"]);
  });
});
