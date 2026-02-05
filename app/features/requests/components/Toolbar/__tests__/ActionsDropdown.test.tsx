import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@test/test-utils";
import userEvent from "@testing-library/user-event";
import { ActionsDropdown } from "../ActionsDropdown";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    motion: {
      button: ({ children, className, ...props }: React.ComponentProps<"button">) => (
        <button className={className} {...props}>
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

describe("ActionsDropdown", () => {
  const defaultProps = {
    showRetryFailed: false,
    onRetryAllFailed: vi.fn(),
    onDeleteAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders trigger button with Actions label", () => {
    render(<ActionsDropdown {...defaultProps} />);

    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("opens dropdown menu when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<ActionsDropdown {...defaultProps} />);

    await user.click(screen.getByRole("button"));

    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });

  it("shows delete all option", async () => {
    const user = userEvent.setup();
    render(<ActionsDropdown {...defaultProps} />);

    await user.click(screen.getByRole("button"));

    expect(await screen.findByText("Delete all")).toBeInTheDocument();
  });

  it("calls onDeleteAll when delete all is clicked", async () => {
    const user = userEvent.setup();
    const onDeleteAll = vi.fn();
    render(<ActionsDropdown {...defaultProps} onDeleteAll={onDeleteAll} />);

    await user.click(screen.getByRole("button"));
    await screen.findByRole("menu");
    await user.click(screen.getByText("Delete all"));

    expect(onDeleteAll).toHaveBeenCalledTimes(1);
  });

  it("hides retry failed option when showRetryFailed is false", async () => {
    const user = userEvent.setup();
    render(<ActionsDropdown {...defaultProps} showRetryFailed={false} />);

    await user.click(screen.getByRole("button"));
    await screen.findByRole("menu");

    expect(screen.queryByText("Retry all failed")).not.toBeInTheDocument();
  });

  it("shows retry failed option when showRetryFailed is true", async () => {
    const user = userEvent.setup();
    render(<ActionsDropdown {...defaultProps} showRetryFailed={true} />);

    await user.click(screen.getByRole("button"));

    expect(await screen.findByText("Retry all failed")).toBeInTheDocument();
  });

  it("calls onRetryAllFailed when retry is clicked", async () => {
    const user = userEvent.setup();
    const onRetryAllFailed = vi.fn();
    render(<ActionsDropdown {...defaultProps} showRetryFailed={true} onRetryAllFailed={onRetryAllFailed} />);

    await user.click(screen.getByRole("button"));
    await screen.findByRole("menu");
    await user.click(screen.getByText("Retry all failed"));

    expect(onRetryAllFailed).toHaveBeenCalledTimes(1);
  });
});
