import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@test/test-utils";
import { SortDirectionButton } from "../SortDirectionButton";

describe("SortDirectionButton", () => {
  const defaultProps = {
    direction: "asc" as const,
    onToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders ascending button when direction is asc", () => {
    render(<SortDirectionButton {...defaultProps} direction="asc" />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Ascending");
    expect(button).toHaveAttribute("aria-label", "Sort ascending");
  });

  it("renders descending button when direction is desc", () => {
    render(<SortDirectionButton {...defaultProps} direction="desc" />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Descending");
    expect(button).toHaveAttribute("aria-label", "Sort descending");
  });

  it("calls onToggle when clicked", () => {
    const onToggle = vi.fn();
    render(<SortDirectionButton {...defaultProps} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("renders ArrowUp icon for ascending", () => {
    const { container } = render(<SortDirectionButton {...defaultProps} direction="asc" />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("size-3.5");
  });

  it("renders ArrowDown icon for descending", () => {
    const { container } = render(<SortDirectionButton {...defaultProps} direction="desc" />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("size-3.5");
  });

  it("has correct button styling", () => {
    render(<SortDirectionButton {...defaultProps} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("rounded-lg", "p-1.5", "transition-colors");
  });
});
