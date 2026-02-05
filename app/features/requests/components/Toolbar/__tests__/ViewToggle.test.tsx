import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@test/test-utils";
import { ViewToggle } from "../ViewToggle";

describe("ViewToggle", () => {
  const defaultProps = {
    viewMode: "compact" as const,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders both view mode buttons", () => {
    render(<ViewToggle {...defaultProps} />);

    expect(screen.getByLabelText("Switch to grid view")).toBeInTheDocument();
    expect(screen.getByLabelText("Switch to list view")).toBeInTheDocument();
  });

  it("applies active styling to compact button when viewMode is compact", () => {
    render(<ViewToggle {...defaultProps} viewMode="compact" />);

    const gridButton = screen.getByLabelText("Switch to grid view");
    const listButton = screen.getByLabelText("Switch to list view");

    expect(gridButton).toHaveClass("bg-fg/10", "text-fg");
    expect(listButton).toHaveClass("text-fg/40");
  });

  it("applies active styling to list button when viewMode is list", () => {
    render(<ViewToggle {...defaultProps} viewMode="list" />);

    const gridButton = screen.getByLabelText("Switch to grid view");
    const listButton = screen.getByLabelText("Switch to list view");

    expect(listButton).toHaveClass("bg-fg/10", "text-fg");
    expect(gridButton).toHaveClass("text-fg/40");
  });

  it("calls onChange with compact when grid button clicked", () => {
    const onChange = vi.fn();
    render(<ViewToggle {...defaultProps} viewMode="list" onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Switch to grid view"));

    expect(onChange).toHaveBeenCalledWith("compact");
  });

  it("calls onChange with list when list button clicked", () => {
    const onChange = vi.fn();
    render(<ViewToggle {...defaultProps} viewMode="compact" onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Switch to list view"));

    expect(onChange).toHaveBeenCalledWith("list");
  });

  it("has correct title attributes for buttons", () => {
    render(<ViewToggle {...defaultProps} />);

    expect(screen.getByTitle("Grid view")).toBeInTheDocument();
    expect(screen.getByTitle("List view")).toBeInTheDocument();
  });
});
