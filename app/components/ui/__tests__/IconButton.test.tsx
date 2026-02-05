import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconButton } from "../IconButton";
import { Play, Pause, Download } from "lucide-react";

describe("IconButton", () => {
  it("renders the provided icon", () => {
    render(<IconButton icon={Play} aria-label="Play" />);
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("renders with default variant", () => {
    render(<IconButton icon={Play} aria-label="Play" data-testid="btn" />);
    const button = screen.getByTestId("btn");
    expect(button).toHaveClass("border-fg/10", "text-fg/40");
  });

  it("renders with secondary variant", () => {
    render(<IconButton icon={Play} aria-label="Play" variant="secondary" data-testid="btn" />);
    const button = screen.getByTestId("btn");
    expect(button).toHaveClass("border-secondary-500/30", "text-secondary-400");
  });

  it("renders with red variant", () => {
    render(<IconButton icon={Pause} aria-label="Pause" variant="red" data-testid="btn" />);
    const button = screen.getByTestId("btn");
    expect(button).toHaveClass("border-red-500/30", "text-red-400");
  });

  it("renders with green variant", () => {
    render(<IconButton icon={Play} aria-label="Play" variant="green" data-testid="btn" />);
    const button = screen.getByTestId("btn");
    expect(button).toHaveClass("border-green-500/30", "text-green-400");
  });

  it("renders with primary variant", () => {
    render(<IconButton icon={Download} aria-label="Download" variant="primary" data-testid="btn" />);
    const button = screen.getByTestId("btn");
    expect(button).toHaveClass("border-primary-500/30", "text-primary-400");
  });

  it("renders with sm size", () => {
    render(<IconButton icon={Play} aria-label="Play" size="sm" data-testid="btn" />);
    const button = screen.getByTestId("btn");
    expect(button).toHaveClass("rounded-md", "p-1");
  });

  it("renders with md size", () => {
    render(<IconButton icon={Play} aria-label="Play" size="md" data-testid="btn" />);
    const button = screen.getByTestId("btn");
    expect(button).toHaveClass("rounded-lg", "p-1.5");
  });

  it("handles onClick events", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<IconButton icon={Play} aria-label="Play" onClick={handleClick} />);
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disabled state prevents clicks", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<IconButton icon={Play} aria-label="Play" onClick={handleClick} disabled />);
    await user.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders regular button when animated is false", () => {
    render(<IconButton icon={Play} aria-label="Play" animated={false} data-testid="btn" />);
    const button = screen.getByTestId("btn");
    expect(button.tagName).toBe("BUTTON");
  });

  it("applies custom className", () => {
    render(<IconButton icon={Play} aria-label="Play" className="custom-class" data-testid="btn" />);
    const button = screen.getByTestId("btn");
    expect(button).toHaveClass("custom-class");
  });

  it("has cursor-pointer class", () => {
    render(<IconButton icon={Play} aria-label="Play" data-testid="btn" />);
    const button = screen.getByTestId("btn");
    expect(button).toHaveClass("cursor-pointer");
  });

  it("has transition-colors class for smooth transitions", () => {
    render(<IconButton icon={Play} aria-label="Play" data-testid="btn" />);
    const button = screen.getByTestId("btn");
    expect(button).toHaveClass("transition-colors");
  });
});
