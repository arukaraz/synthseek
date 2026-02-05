import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@test/test-utils";
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
    isMobile: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("desktop mode", () => {
    it("renders search trigger button when closed", () => {
      render(<SearchInput {...defaultProps} isOpen={false} isMobile={false} />);

      expect(screen.getByLabelText("Open search")).toBeInTheDocument();
    });

    it("calls onOpenChange when trigger is clicked", () => {
      const onOpenChange = vi.fn();
      render(<SearchInput {...defaultProps} onOpenChange={onOpenChange} isOpen={false} isMobile={false} />);

      fireEvent.click(screen.getByLabelText("Open search"));

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("shows input field when open", () => {
      render(<SearchInput {...defaultProps} isOpen={true} isMobile={false} />);

      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    it("calls onChange when input value changes", () => {
      const onChange = vi.fn();
      render(<SearchInput {...defaultProps} onChange={onChange} isOpen={true} isMobile={false} />);

      fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "test" } });

      expect(onChange).toHaveBeenCalledWith("test");
    });

    it("shows close button when open", () => {
      render(<SearchInput {...defaultProps} isOpen={true} isMobile={false} />);

      expect(screen.getByLabelText("Close search")).toBeInTheDocument();
    });

    it("clears value and closes when close button clicked", () => {
      const onChange = vi.fn();
      const onOpenChange = vi.fn();
      render(<SearchInput {...defaultProps} onChange={onChange} onOpenChange={onOpenChange} isOpen={true} isMobile={false} />);

      fireEvent.click(screen.getByLabelText("Close search"));

      expect(onChange).toHaveBeenCalledWith("");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("closes on Escape key press", () => {
      const onChange = vi.fn();
      const onOpenChange = vi.fn();
      render(<SearchInput {...defaultProps} onChange={onChange} onOpenChange={onOpenChange} isOpen={true} isMobile={false} />);

      fireEvent.keyDown(screen.getByPlaceholderText("Search..."), { key: "Escape" });

      expect(onChange).toHaveBeenCalledWith("");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("displays current value in input", () => {
      render(<SearchInput {...defaultProps} value="my search" isOpen={true} isMobile={false} />);

      expect(screen.getByPlaceholderText("Search...")).toHaveValue("my search");
    });
  });

  describe("mobile mode", () => {
    it("renders search trigger when closed", () => {
      render(<SearchInput {...defaultProps} isOpen={false} isMobile={true} />);

      expect(screen.getByLabelText("Open search")).toBeInTheDocument();
    });

    it("shows full width input when open", () => {
      render(<SearchInput {...defaultProps} isOpen={true} isMobile={true} />);

      expect(screen.getByPlaceholderText("Search requests...")).toBeInTheDocument();
    });

    it("calls onChange on mobile input change", () => {
      const onChange = vi.fn();
      render(<SearchInput {...defaultProps} onChange={onChange} isOpen={true} isMobile={true} />);

      fireEvent.change(screen.getByPlaceholderText("Search requests..."), { target: { value: "mobile search" } });

      expect(onChange).toHaveBeenCalledWith("mobile search");
    });

    it("shows close button on mobile when open", () => {
      render(<SearchInput {...defaultProps} isOpen={true} isMobile={true} />);

      expect(screen.getByLabelText("Close search")).toBeInTheDocument();
    });

    it("clears and closes on mobile close button click", () => {
      const onChange = vi.fn();
      const onOpenChange = vi.fn();
      render(<SearchInput {...defaultProps} onChange={onChange} onOpenChange={onOpenChange} isOpen={true} isMobile={true} />);

      fireEvent.click(screen.getByLabelText("Close search"));

      expect(onChange).toHaveBeenCalledWith("");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("has correct title on search trigger", () => {
    render(<SearchInput {...defaultProps} isOpen={false} />);

    expect(screen.getByTitle("Search requests")).toBeInTheDocument();
  });

  describe("focus timer cleanup", () => {
    it("cleans up focus timer on unmount", () => {
      vi.useFakeTimers();
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      const { unmount } = render(<SearchInput {...defaultProps} isOpen={true} isMobile={false} />);

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
      vi.useRealTimers();
    });

    it("cleans up focus timer when isOpen changes to false", () => {
      vi.useFakeTimers();
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      const { rerender } = render(<SearchInput {...defaultProps} isOpen={true} isMobile={false} />);

      rerender(<SearchInput {...defaultProps} isOpen={false} isMobile={false} />);

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
      vi.useRealTimers();
    });
  });
});
