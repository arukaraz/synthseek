import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@test/test-utils";
import userEvent from "@testing-library/user-event";
import { StatusFilterDropdown } from "../StatusFilterDropdown";

describe("StatusFilterDropdown", () => {
  const defaultProps = {
    value: "all" as const,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders trigger button with current filter label", () => {
    render(<StatusFilterDropdown {...defaultProps} value="all" />);

    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("shows Active label when value is active", () => {
    render(<StatusFilterDropdown {...defaultProps} value="active" />);

    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("shows Done label when value is done", () => {
    render(<StatusFilterDropdown {...defaultProps} value="done" />);

    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("shows Failed label when value is failed", () => {
    render(<StatusFilterDropdown {...defaultProps} value="failed" />);

    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("opens dropdown menu when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<StatusFilterDropdown {...defaultProps} />);

    await user.click(screen.getByRole("button"));

    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });

  it("displays all filter options in dropdown", async () => {
    const user = userEvent.setup();
    render(<StatusFilterDropdown {...defaultProps} />);

    await user.click(screen.getByRole("button"));

    expect(await screen.findByRole("menuitemradio", { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /active/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /done/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /failed/i })).toBeInTheDocument();
  });

  it("calls onChange with selected filter value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StatusFilterDropdown {...defaultProps} onChange={onChange} />);

    await user.click(screen.getByRole("button"));
    await screen.findByRole("menu");
    await user.click(screen.getByRole("menuitemradio", { name: /failed/i }));

    expect(onChange).toHaveBeenCalledWith("failed");
  });

  it("marks current value as checked in radio group", async () => {
    const user = userEvent.setup();
    render(<StatusFilterDropdown {...defaultProps} value="active" />);

    await user.click(screen.getByRole("button"));
    const activeOption = await screen.findByRole("menuitemradio", { name: /active/i });

    expect(activeOption).toHaveAttribute("aria-checked", "true");
  });

  it("renders icon for each filter option", async () => {
    const user = userEvent.setup();
    render(<StatusFilterDropdown {...defaultProps} />);

    await user.click(screen.getByRole("button"));
    const menuItems = await screen.findAllByRole("menuitemradio");

    expect(menuItems).toHaveLength(4);
  });
});
