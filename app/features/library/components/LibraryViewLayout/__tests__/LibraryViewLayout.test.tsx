import { describe, it, expect, vi } from "vitest";

import { createLibraryController, createLibraryShell } from "@test/factories";
import { act, renderWithProviders, screen } from "@test/test-utils";

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

vi.mock("../../LibraryShelf", () => ({
  LibraryShelfHeader: ({ collapsed }: { collapsed: boolean }) => (
    <div data-testid="shelf" data-collapsed={String(collapsed)} />
  ),
}));

vi.mock("../LibraryLetterIndex", () => ({
  LibraryLetterIndex: ({ index }: { index: { entries: readonly { letter: string }[] } }) => (
    <nav data-testid="letter-index">{index.entries.map((entry) => entry.letter).join("")}</nav>
  ),
}));

const loadMoreProps = vi.hoisted(() => ({ current: undefined as Record<string, unknown> | undefined }));

vi.mock("../../LibraryLoadMore/LibraryLoadMore", () => ({
  LibraryLoadMore: (props: Record<string, unknown>) => {
    loadMoreProps.current = props;
    return <div data-testid="load-more" />;
  },
}));

import { VIEW_CONFIG } from "../../../constants";
import { LibraryViewLayout } from "../LibraryViewLayout";
import type { LibraryViewLayoutProps } from "../types";

interface Row {
  id: string;
  name: string;
}

function makeController() {
  return createLibraryController();
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
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    },
    shell: createLibraryShell(),
    ...overrides,
  };
}

function gridProps(overrides?: Partial<LibraryViewLayoutProps<Row>>): LibraryViewLayoutProps<Row> {
  return {
    ...tableProps(),
    controller: createLibraryController({ view: "albums", config: VIEW_CONFIG.albums }),
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

describe("LibraryViewLayout scrolling on a phone", () => {
  function scrollList(top: number) {
    const list = screen.getByTestId("table").parentElement;
    if (!(list instanceof HTMLElement)) throw new Error("no list");
    Object.defineProperty(list, "clientHeight", { configurable: true, value: 500 });
    Object.defineProperty(list, "scrollHeight", { configurable: true, value: 3000 });
    act(() => {
      list.scrollTop = top;
      list.dispatchEvent(new Event("scroll"));
    });
  }

  it("folds the shelf while the list is scrolled down and unfolds it back at the top", () => {
    renderWithProviders(<LibraryViewLayout {...tableProps({ shell: createLibraryShell({ phone: true }) })} />);
    expect(screen.getByTestId("shelf")).toHaveAttribute("data-collapsed", "false");

    scrollList(400);
    expect(screen.getByTestId("shelf")).toHaveAttribute("data-collapsed", "true");

    scrollList(0);
    expect(screen.getByTestId("shelf")).toHaveAttribute("data-collapsed", "false");
  });

  it("never folds the shelf on a wider screen", () => {
    renderWithProviders(<LibraryViewLayout {...tableProps()} />);

    scrollList(400);

    expect(screen.getByTestId("shelf")).toHaveAttribute("data-collapsed", "false");
  });
});

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

  it("renders the table with the load-more sentinel for a table layout with results", () => {
    renderWithProviders(<LibraryViewLayout {...tableProps()} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.getByTestId("load-more")).toBeInTheDocument();
  });

  it("hands the table's paging state to the load-more control", () => {
    const fetchNextPage = vi.fn();
    const base = tableProps();
    renderWithProviders(
      <LibraryViewLayout
        {...base}
        content={{
          layout: "table",
          columns: [],
          getRowId: (item: Row) => item.id,
          hasNextPage: true,
          isFetchingNextPage: true,
          fetchNextPage,
        }}
      />
    );

    expect(loadMoreProps.current).toMatchObject({ hasNextPage: true, isFetchingNextPage: true, fetchNextPage });
  });

  it("renders the infinite grid and no table load-more for a grid layout", () => {
    renderWithProviders(<LibraryViewLayout {...gridProps()} />);

    expect(screen.getByTestId("grid")).toBeInTheDocument();
    expect(screen.queryByTestId("load-more")).not.toBeInTheDocument();
  });

  it("shows a letter index on a grid only once it has more than one letter to jump to", () => {
    const grid = gridProps();
    const withIndex = (letters: string[]): LibraryViewLayoutProps<Row> => ({
      ...grid,
      content: {
        layout: "grid",
        renderCard: () => <li>card</li>,
        getCardId: (item: Row) => item.id,
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: vi.fn(),
        letterIndex: {
          entries: letters.map((letter, offset) => ({ letter, offset })),
          descending: false,
          loadThrough: vi.fn(async () => undefined),
        },
      },
    });

    const { rerender } = renderWithProviders(<LibraryViewLayout {...withIndex(["A"])} />);

    expect(screen.queryByTestId("letter-index")).not.toBeInTheDocument();

    rerender(<LibraryViewLayout {...withIndex(["A", "D"])} />);

    expect(screen.getByTestId("letter-index")).toHaveTextContent("AD");
  });

  it("passes the filtersOpen flag through to the mobile sheet", () => {
    renderWithProviders(<LibraryViewLayout {...tableProps({ shell: createLibraryShell({ filtersOpen: true }) })} />);

    expect(screen.getByTestId("sheet")).toHaveTextContent("open");
  });

  it("routes a sidebar facet toggle into the controller's setFilterValues", async () => {
    const setFilterValues = vi.fn();
    const props = tableProps();
    props.controller = createLibraryController({ setFilterValues });

    const { user } = renderWithProviders(<LibraryViewLayout {...props} />);

    await user.click(screen.getAllByTestId("sidebar")[0]);

    expect(setFilterValues).toHaveBeenCalledWith("source", ["deezer"]);
  });

  it("covers the stale rows with a spinner while a new filter is in flight", () => {
    const { container } = renderWithProviders(<LibraryViewLayout {...tableProps({ isRefreshing: true })} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(container.querySelector(".opacity-40")).not.toBeNull();
  });

  it("leaves the rows alone once the results are current", () => {
    const { container } = renderWithProviders(<LibraryViewLayout {...tableProps()} />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(container.querySelector(".opacity-40")).toBeNull();
  });
});
