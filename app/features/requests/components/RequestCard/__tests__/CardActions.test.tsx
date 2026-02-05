import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@test/test-utils";
import { CardActions } from "../CardActions";
import { ContentType } from "@api/__generated__/types";

vi.mock("framer-motion", () => ({
  motion: {
    button: ({
      children,
      onClick,
      ...props
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      [key: string]: unknown;
    }) => (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("CardActions", () => {
  const defaultProps = {
    canRetry: false,
    onRetry: vi.fn(),
    onRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("icon-only variant", () => {
    it("renders remove button", () => {
      render(<CardActions {...defaultProps} variant="icon-only" />);

      expect(screen.getByTitle("Remove request")).toBeInTheDocument();
    });

    it("does not render retry button when canRetry is false", () => {
      render(<CardActions {...defaultProps} variant="icon-only" />);

      expect(screen.queryByTitle("Retry download")).not.toBeInTheDocument();
    });

    it("renders retry button when canRetry is true", () => {
      render(<CardActions {...defaultProps} variant="icon-only" canRetry />);

      expect(screen.getByTitle("Retry download")).toBeInTheDocument();
    });

    it("calls onRemove when remove button clicked", () => {
      const onRemove = vi.fn();
      render(<CardActions {...defaultProps} variant="icon-only" onRemove={onRemove} />);

      fireEvent.click(screen.getByTitle("Remove request"));

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("calls onRetry when retry button clicked", () => {
      const onRetry = vi.fn();
      render(<CardActions {...defaultProps} variant="icon-only" canRetry onRetry={onRetry} />);

      fireEvent.click(screen.getByTitle("Retry download"));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe("with-label variant", () => {
    it("renders Remove button with label", () => {
      render(<CardActions {...defaultProps} variant="with-label" />);

      expect(screen.getByText("Remove")).toBeInTheDocument();
    });

    it("renders Retry button when canRetry is true", () => {
      render(<CardActions {...defaultProps} variant="with-label" canRetry />);

      expect(screen.getByText("Retry")).toBeInTheDocument();
    });

    it("renders Retry Album for album item type", () => {
      render(<CardActions {...defaultProps} variant="with-label" canRetry itemType={ContentType.enum.album} />);

      expect(screen.getByText("Retry Album")).toBeInTheDocument();
    });

    it("calls onRemove when Remove clicked", () => {
      const onRemove = vi.fn();
      render(<CardActions {...defaultProps} variant="with-label" onRemove={onRemove} />);

      fireEvent.click(screen.getByText("Remove"));

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("calls onRetry when Retry clicked", () => {
      const onRetry = vi.fn();
      render(<CardActions {...defaultProps} variant="with-label" canRetry onRetry={onRetry} />);

      fireEvent.click(screen.getByText("Retry"));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  it("defaults to icon-only variant", () => {
    render(<CardActions {...defaultProps} />);

    expect(screen.getByTitle("Remove request")).toBeInTheDocument();
    expect(screen.queryByText("Remove")).not.toBeInTheDocument();
  });
});
