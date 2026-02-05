import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@test/test-utils";
import { SortableHeader } from "../SortableHeader";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    motion: {
      div: ({ children, className, ...props }: React.ComponentProps<"div">) => (
        <div className={className} {...props}>
          {children}
        </div>
      ),
    },
  };
});

describe("SortableHeader", () => {
  const defaultProps = {
    label: "Title",
    field: "title",
    currentField: "artist",
    direction: "asc" as const,
    onSort: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the label text", () => {
    render(<SortableHeader {...defaultProps} />);

    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("calls onSort with field when clicked", () => {
    const onSort = vi.fn();
    render(<SortableHeader {...defaultProps} onSort={onSort} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onSort).toHaveBeenCalledWith("title");
  });

  it("applies active styling when field matches currentField", () => {
    render(<SortableHeader {...defaultProps} field="title" currentField="title" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("text-primary-400");
  });

  it("applies inactive styling when field does not match currentField", () => {
    render(<SortableHeader {...defaultProps} field="title" currentField="artist" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("text-fg/40");
  });

  it("shows ArrowUp icon when active and direction is asc", () => {
    const { container } = render(
      <SortableHeader {...defaultProps} field="title" currentField="title" direction="asc" />
    );

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("h-3", "w-3");
  });

  it("shows ArrowDown icon when active and direction is desc", () => {
    const { container } = render(
      <SortableHeader {...defaultProps} field="title" currentField="title" direction="desc" />
    );

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("h-3", "w-3");
  });

  it("shows ArrowUpDown icon when not active", () => {
    const { container } = render(<SortableHeader {...defaultProps} field="title" currentField="artist" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("h-3", "w-3");
  });

  it("has cursor-pointer class", () => {
    render(<SortableHeader {...defaultProps} />);

    expect(screen.getByRole("button")).toHaveClass("cursor-pointer");
  });

  it("has uppercase text styling", () => {
    render(<SortableHeader {...defaultProps} />);

    expect(screen.getByRole("button")).toHaveClass("uppercase");
  });
});
