import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@test/test-utils";
import { ViewToggle } from "../ViewToggle";

const replaceMock = vi.fn();
let searchParamsString = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/requests",
  useSearchParams: () => new URLSearchParams(searchParamsString),
}));

describe("ViewToggle", () => {
  beforeEach(() => {
    replaceMock.mockClear();
    searchParamsString = "";
  });

  it("renders both view mode buttons", () => {
    render(<ViewToggle />);

    expect(screen.getByLabelText("Switch to groups view")).toBeInTheDocument();
    expect(screen.getByLabelText("Switch to list view")).toBeInTheDocument();
  });

  it("applies active styling to groups button by default", () => {
    render(<ViewToggle />);

    const groupsButton = screen.getByLabelText("Switch to groups view");
    const listButton = screen.getByLabelText("Switch to list view");

    expect(groupsButton).toHaveClass("bg-fg/10", "text-fg");
    expect(listButton).toHaveClass("text-fg/40");
  });

  it("applies active styling to list button when ?view=list", () => {
    searchParamsString = "view=list";
    render(<ViewToggle />);

    const groupsButton = screen.getByLabelText("Switch to groups view");
    const listButton = screen.getByLabelText("Switch to list view");

    expect(listButton).toHaveClass("bg-fg/10", "text-fg");
    expect(groupsButton).toHaveClass("text-fg/40");
  });

  it("calls router.replace with empty query when groups button clicked from list view (default cleared)", () => {
    searchParamsString = "view=list";
    render(<ViewToggle />);

    fireEvent.click(screen.getByLabelText("Switch to groups view"));

    expect(replaceMock).toHaveBeenCalledWith("/requests", { scroll: false });
  });

  it("calls router.replace with view=list when list button clicked from groups view", () => {
    render(<ViewToggle />);

    fireEvent.click(screen.getByLabelText("Switch to list view"));

    expect(replaceMock).toHaveBeenCalledWith("/requests?view=list", { scroll: false });
  });

  it("has correct title attributes for buttons", () => {
    render(<ViewToggle />);

    expect(screen.getByTitle("Groups view")).toBeInTheDocument();
    expect(screen.getByTitle("List view")).toBeInTheDocument();
  });
});
