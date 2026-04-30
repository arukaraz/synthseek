import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@test/test-utils";
import { SearchInput } from "../SearchInput";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      button: ({ children, className, onClick, ...props }: React.ComponentProps<"button">) => (
        <button className={className} onClick={onClick} {...props}>
          {children}
        </button>
      ),
      div: ({ children, className, ...props }: React.ComponentProps<"div">) => (
        <div className={className} {...props}>
          {children}
        </div>
      ),
    },
  };
});

describe("SearchInput", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
    isOpen: false,
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search trigger button when closed", () => {
    render(<SearchInput {...defaultProps} isOpen={false} />);

    expect(screen.getByLabelText("Open search")).toBeInTheDocument();
  });

  it("calls onOpenChange when trigger is clicked", () => {
    const onOpenChange = vi.fn();
    render(<SearchInput {...defaultProps} onOpenChange={onOpenChange} isOpen={false} />);

    fireEvent.click(screen.getByLabelText("Open search"));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("shows input field when open", () => {
    render(<SearchInput {...defaultProps} isOpen={true} />);

    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("calls onChange when input value changes", () => {
    const onChange = vi.fn();
    render(<SearchInput {...defaultProps} onChange={onChange} isOpen={true} />);

    fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "test" } });

    expect(onChange).toHaveBeenCalledWith("test");
  });

  it("shows close button when open", () => {
    render(<SearchInput {...defaultProps} isOpen={true} />);

    expect(screen.getByLabelText("Close search")).toBeInTheDocument();
  });

  it("clears value and closes when close button clicked", () => {
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    render(<SearchInput {...defaultProps} onChange={onChange} onOpenChange={onOpenChange} isOpen={true} />);

    fireEvent.click(screen.getByLabelText("Close search"));

    expect(onChange).toHaveBeenCalledWith("");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes on Escape key press", () => {
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    render(<SearchInput {...defaultProps} onChange={onChange} onOpenChange={onOpenChange} isOpen={true} />);

    fireEvent.keyDown(screen.getByPlaceholderText("Search..."), { key: "Escape" });

    expect(onChange).toHaveBeenCalledWith("");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("displays current value in input", () => {
    render(<SearchInput {...defaultProps} value="my search" isOpen={true} />);

    expect(screen.getByPlaceholderText("Search...")).toHaveValue("my search");
  });

  it("hides trigger button on mobile when open (sm:inline-flex)", () => {
    render(<SearchInput {...defaultProps} isOpen={true} />);

    const trigger = screen.getByLabelText("Open search");
    expect(trigger).toHaveClass("hidden", "sm:inline-flex");
  });

  it("has correct title on search trigger", () => {
    render(<SearchInput {...defaultProps} isOpen={false} />);

    expect(screen.getByTitle("Search requests")).toBeInTheDocument();
  });

  describe("focus timer cleanup", () => {
    it("cleans up focus timer on unmount", () => {
      vi.useFakeTimers();
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      const { unmount } = render(<SearchInput {...defaultProps} isOpen={true} />);

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
      vi.useRealTimers();
    });

    it("cleans up focus timer when isOpen changes to false", () => {
      vi.useFakeTimers();
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      const { rerender } = render(<SearchInput {...defaultProps} isOpen={true} />);

      rerender(<SearchInput {...defaultProps} isOpen={false} />);

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
      vi.useRealTimers();
    });
  });
});
