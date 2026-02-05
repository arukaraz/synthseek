import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@test/test-utils";
import { FilterTabs } from "../FilterTabs";
import { ContentType } from "@api/__generated__/types";

describe("FilterTabs", () => {
  const defaultProps = {
    activeFilter: "all" as const,
    onFilterChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all filter tabs", () => {
    render(<FilterTabs {...defaultProps} />);

    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Playlists")).toBeInTheDocument();
    expect(screen.getByText("Artists")).toBeInTheDocument();
    expect(screen.getByText("Albums")).toBeInTheDocument();
    expect(screen.getByText("Songs")).toBeInTheDocument();
  });

  it("applies active styling to selected filter", () => {
    render(<FilterTabs {...defaultProps} activeFilter="all" />);

    const allButton = screen.getByText("All");
    expect(allButton).toHaveClass("bg-fg", "text-surface");
  });

  it("applies inactive styling to non-selected filters", () => {
    render(<FilterTabs {...defaultProps} activeFilter="all" />);

    const albumsButton = screen.getByText("Albums");
    expect(albumsButton).toHaveClass("bg-fg/5");
  });

  it("calls onFilterChange when tab clicked", () => {
    const onFilterChange = vi.fn();
    render(<FilterTabs {...defaultProps} onFilterChange={onFilterChange} />);

    fireEvent.click(screen.getByText("Albums"));

    expect(onFilterChange).toHaveBeenCalledWith(ContentType.enum.album);
  });

  it("calls onFilterChange with correct content type for each tab", () => {
    const onFilterChange = vi.fn();
    render(<FilterTabs {...defaultProps} onFilterChange={onFilterChange} />);

    fireEvent.click(screen.getByText("Songs"));
    expect(onFilterChange).toHaveBeenCalledWith(ContentType.enum.track);

    fireEvent.click(screen.getByText("Artists"));
    expect(onFilterChange).toHaveBeenCalledWith(ContentType.enum.artist);

    fireEvent.click(screen.getByText("Playlists"));
    expect(onFilterChange).toHaveBeenCalledWith(ContentType.enum.playlist);

    fireEvent.click(screen.getByText("All"));
    expect(onFilterChange).toHaveBeenCalledWith("all");
  });

  it("applies data-cy attributes to tabs", () => {
    const { container } = render(<FilterTabs {...defaultProps} />);

    expect(container.querySelector('[data-cy="filter-tab-all"]')).toBeInTheDocument();
    expect(container.querySelector('[data-cy="filter-tab-album"]')).toBeInTheDocument();
    expect(container.querySelector('[data-cy="filter-tab-track"]')).toBeInTheDocument();
  });
});
