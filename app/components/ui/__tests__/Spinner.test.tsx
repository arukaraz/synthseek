import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "../Spinner";

describe("Spinner", () => {
  it("renders an accessible status with the default label", () => {
    render(<Spinner />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it("renders a custom accessible label", () => {
    render(<Spinner label="Loading patch notes" />);
    expect(screen.getByText("Loading patch notes")).toBeInTheDocument();
  });

  it("renders the color-cycling ring with the branded animation classes", () => {
    const { container } = render(<Spinner />);
    const ring = container.querySelector(".branded-loader-ring");
    expect(ring).toBeInTheDocument();
    expect(ring).toHaveClass("animate-loading-ring", "rounded-full", "border-transparent");
  });

  it("applies size variant classes", () => {
    const { container } = render(<Spinner size="lg" />);
    const ring = container.querySelector(".branded-loader-ring");
    expect(ring).toHaveClass("size-10");
  });

  it("merges a custom className onto the ring", () => {
    const { container } = render(<Spinner className="custom-ring" />);
    const ring = container.querySelector(".branded-loader-ring");
    expect(ring).toHaveClass("custom-ring");
  });

  it("renders a decorative ring without a status region", () => {
    const { container } = render(<Spinner decorative size="fill" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    const ring = container.querySelector(".branded-loader-ring");
    expect(ring).toHaveAttribute("aria-hidden", "true");
    expect(ring).toHaveClass("absolute", "inset-0");
  });
});
