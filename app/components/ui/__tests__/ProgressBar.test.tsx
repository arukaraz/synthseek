import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "../ProgressBar";

describe("ProgressBar", () => {
  it("renders with 0% progress", () => {
    render(<ProgressBar progress={0} />);
    const progressBar = screen.getByTestId("progress-bar");
    expect(progressBar).toHaveAttribute("data-progress", "0");
  });

  it("renders with 50% progress", () => {
    render(<ProgressBar progress={50} />);
    const progressBar = screen.getByTestId("progress-bar");
    expect(progressBar).toHaveAttribute("data-progress", "50");
  });

  it("renders with 100% progress", () => {
    render(<ProgressBar progress={100} />);
    const progressBar = screen.getByTestId("progress-bar");
    expect(progressBar).toHaveAttribute("data-progress", "100");
  });

  it("sets isActive data attribute when active", () => {
    render(<ProgressBar progress={50} isActive={true} />);
    const progressBar = screen.getByTestId("progress-bar");
    expect(progressBar).toHaveAttribute("data-loading", "true");
  });

  it("sets isActive data attribute to false when not active", () => {
    render(<ProgressBar progress={50} isActive={false} />);
    const progressBar = screen.getByTestId("progress-bar");
    expect(progressBar).toHaveAttribute("data-loading", "false");
  });

  it("renders with sm size", () => {
    render(<ProgressBar progress={50} size="sm" />);
    const progressBar = screen.getByTestId("progress-bar");
    expect(progressBar).toHaveClass("h-1");
  });

  it("renders with md size (default)", () => {
    render(<ProgressBar progress={50} size="md" />);
    const progressBar = screen.getByTestId("progress-bar");
    expect(progressBar).toHaveClass("h-1.5");
  });

  it("renders with lg size, for when the bar is the thing being read rather than a trim", () => {
    render(<ProgressBar progress={50} size="lg" />);
    const progressBar = screen.getByTestId("progress-bar");
    expect(progressBar).toHaveClass("h-2.5");
  });

  it("carries no border, which would eat the height the size asked for and leave the fill with none", () => {
    render(<ProgressBar progress={50} size="sm" />);
    const progressBar = screen.getByTestId("progress-bar");
    expect(progressBar.className).not.toMatch(/\bborder\b/);
  });

  it("gives the fill the whole track to draw in", () => {
    render(<ProgressBar progress={50} />);
    const fill = screen.getByTestId("progress-bar").firstElementChild;
    expect(fill).toHaveClass("h-full");
  });

  it("applies custom className", () => {
    render(<ProgressBar progress={50} className="custom-class" />);
    const progressBar = screen.getByTestId("progress-bar");
    expect(progressBar).toHaveClass("custom-class");
  });

  it("has overflow-hidden class", () => {
    render(<ProgressBar progress={50} />);
    const progressBar = screen.getByTestId("progress-bar");
    expect(progressBar).toHaveClass("overflow-hidden");
  });

  it("has rounded-full class", () => {
    render(<ProgressBar progress={50} />);
    const progressBar = screen.getByTestId("progress-bar");
    expect(progressBar).toHaveClass("rounded-full");
  });
});
