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

  it("renders the filter trigger button when closed", () => {
    render(<SearchInput {...defaultProps} isOpen={false} />);

    expect(screen.getByLabelText("Open filter")).toBeInTheDocument();
  });

  it("calls onOpenChange when trigger is clicked", () => {
    const onOpenChange = vi.fn();
    render(<SearchInput {...defaultProps} onOpenChange={onOpenChange} isOpen={false} />);

    fireEvent.click(screen.getByLabelText("Open filter"));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("renders the desktop filter input", () => {
    render(<SearchInput {...defaultProps} isOpen={false} />);

    expect(screen.getByPlaceholderText("Filter...")).toBeInTheDocument();
  });

  it("calls onChange when the input value changes", () => {
    const onChange = vi.fn();
    render(<SearchInput {...defaultProps} onChange={onChange} isOpen={false} />);

    fireEvent.change(screen.getByPlaceholderText("Filter..."), { target: { value: "test" } });

    expect(onChange).toHaveBeenCalledWith("test");
  });

  it("shows the close button when open", () => {
    render(<SearchInput {...defaultProps} isOpen={true} />);

    expect(screen.getByLabelText("Close filter")).toBeInTheDocument();
  });

  it("hides the trigger button when open", () => {
    render(<SearchInput {...defaultProps} isOpen={true} />);

    expect(screen.queryByLabelText("Open filter")).not.toBeInTheDocument();
  });

  it("clears value and closes when the close button is clicked", () => {
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    render(<SearchInput {...defaultProps} onChange={onChange} onOpenChange={onOpenChange} isOpen={true} />);

    fireEvent.click(screen.getByLabelText("Close filter"));

    expect(onChange).toHaveBeenCalledWith("");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes on Escape key press in the mobile input", () => {
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    render(<SearchInput {...defaultProps} onChange={onChange} onOpenChange={onOpenChange} isOpen={true} />);

    const inputs = screen.getAllByPlaceholderText("Filter...");
    fireEvent.keyDown(inputs[inputs.length - 1], { key: "Escape" });

    expect(onChange).toHaveBeenCalledWith("");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("displays the current value in the input", () => {
    render(<SearchInput {...defaultProps} value="my filter" isOpen={false} />);

    expect(screen.getByPlaceholderText("Filter...")).toHaveValue("my filter");
  });

  it("has the correct title on the filter trigger", () => {
    render(<SearchInput {...defaultProps} isOpen={false} />);

    expect(screen.getByTitle("Filter requests")).toBeInTheDocument();
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
