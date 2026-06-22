import { describe, it, expect, vi, beforeEach } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";
import type { LibraryUrlController } from "../../../hooks/useLibraryUrlState";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const useLibraryCountsMock = vi.hoisted(() => vi.fn());

vi.mock("@hooks/api", () => ({
  useLibraryCounts: useLibraryCountsMock,
}));

interface CapturedProps {
  filter: { value: string; options: { value: string; count?: number }[] };
  sort: { value: string; options: { value: string }[] };
  direction: { value: string };
}

const captured: { props?: CapturedProps } = {};

vi.mock("@components/ui/FilterSortDropdown", () => ({
  FilterSortDropdown: (props: CapturedProps) => {
    captured.props = props;
    return (
      <div data-testid="dropdown">
        {props.filter.options.map((option) => (
          <span key={option.value} data-testid={`view-${option.value}`}>
            {option.value}:{option.count ?? "none"}
          </span>
        ))}
      </div>
    );
  },
}));

import { VIEW_CONFIG } from "../../../constants";
import { LibraryFilterSortMenu } from "../LibraryFilterSortMenu";

function makeController(overrides?: Partial<LibraryUrlController>): LibraryUrlController {
  return {
    config: VIEW_CONFIG.tracks,
    view: "tracks",
    sort: "recent",
    effectiveDirection: "desc",
    setSort: vi.fn(),
    setDir: vi.fn(),
    ...overrides,
  } as unknown as LibraryUrlController;
}

describe("LibraryFilterSortMenu", () => {
  beforeEach(() => {
    captured.props = undefined;
    useLibraryCountsMock.mockReset();
  });

  it("wires the live counts into the per-view options", () => {
    useLibraryCountsMock.mockReturnValue({ data: { tracks: 12, albums: 3, artists: 7, playlists: 2 } });

    renderWithProviders(<LibraryFilterSortMenu controller={makeController()} onViewChange={vi.fn()} />);

    expect(screen.getByTestId("view-tracks")).toHaveTextContent("tracks:12");
    expect(screen.getByTestId("view-artists")).toHaveTextContent("artists:7");
  });

  it("leaves the counts undefined while they are still loading", () => {
    useLibraryCountsMock.mockReturnValue({ data: undefined });

    renderWithProviders(<LibraryFilterSortMenu controller={makeController()} onViewChange={vi.fn()} />);

    expect(screen.getByTestId("view-albums")).toHaveTextContent("albums:none");
  });

  it("maps the active view's sort options and forwards the current sort and direction", () => {
    useLibraryCountsMock.mockReturnValue({ data: undefined });

    renderWithProviders(
      <LibraryFilterSortMenu
        controller={makeController({ sort: "title", effectiveDirection: "asc" })}
        onViewChange={vi.fn()}
      />
    );

    expect(captured.props?.sort.value).toBe("title");
    expect(captured.props?.direction.value).toBe("asc");
    expect(captured.props?.sort.options.map((option) => option.value)).toEqual(
      VIEW_CONFIG.tracks.sortOptions.map((option) => option.value)
    );
  });
});
