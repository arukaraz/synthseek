import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";
import { RequestStatus } from "@api/__generated__/types";

describe("StatusBadge", () => {
  it("renders with queued status", () => {
    render(<StatusBadge status={RequestStatus.enum.queued} />);
    expect(screen.getByText("Queued")).toBeInTheDocument();
  });

  it("renders with complete status", () => {
    render(<StatusBadge status={RequestStatus.enum.complete} />);
    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("renders with failed status", () => {
    render(<StatusBadge status={RequestStatus.enum.failed} />);
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("renders with downloading status", () => {
    render(<StatusBadge status={RequestStatus.enum.downloading} />);
    expect(screen.getByText("Downloading")).toBeInTheDocument();
  });

  it("renders with searching status", () => {
    render(<StatusBadge status={RequestStatus.enum.searching} />);
    expect(screen.getByText("Searching")).toBeInTheDocument();
  });

  it("renders with in_progress status", () => {
    render(<StatusBadge status={RequestStatus.enum.in_progress} />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("renders with partially_complete status", () => {
    render(<StatusBadge status={RequestStatus.enum.partially_complete} />);
    expect(screen.getByText("Partially Complete")).toBeInTheDocument();
  });

  it("renders with cancelled status", () => {
    render(<StatusBadge status={RequestStatus.enum.cancelled} />);
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  it("renders with sm size by default", () => {
    render(<StatusBadge status={RequestStatus.enum.queued} />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveClass("px-1.5", "py-0.5", "text-xs");
  });

  it("renders with md size", () => {
    render(<StatusBadge status={RequestStatus.enum.queued} size="md" />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveClass("px-2", "text-sm");
  });

  it("renders with lg size", () => {
    render(<StatusBadge status={RequestStatus.enum.queued} size="lg" />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveClass("px-2.5", "py-1", "text-base");
  });

  it("hides label when showLabel is false", () => {
    render(<StatusBadge status={RequestStatus.enum.queued} showLabel={false} />);
    expect(screen.queryByText("Queued")).not.toBeInTheDocument();
  });

  it("has data-status attribute", () => {
    render(<StatusBadge status={RequestStatus.enum.complete} />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveAttribute("data-status", "complete");
  });

  it("applies custom className", () => {
    render(<StatusBadge status={RequestStatus.enum.queued} className="custom-class" />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveClass("custom-class");
  });

  it("applies correct color class for queued status", () => {
    render(<StatusBadge status={RequestStatus.enum.queued} />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveClass("text-orange-400");
  });

  it("applies correct color class for complete status", () => {
    render(<StatusBadge status={RequestStatus.enum.complete} />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveClass("text-green-400");
  });

  it("applies correct color class for failed status", () => {
    render(<StatusBadge status={RequestStatus.enum.failed} />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveClass("text-red-400");
  });

  it("renders icon when showIcon is true", () => {
    render(<StatusBadge status={RequestStatus.enum.queued} showIcon />);
    const badge = screen.getByTestId("status-badge");
    const icon = badge.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("does not render icon when showIcon is false", () => {
    render(<StatusBadge status={RequestStatus.enum.queued} showIcon={false} />);
    const badge = screen.getByTestId("status-badge");
    const icon = badge.querySelector("svg");
    expect(icon).not.toBeInTheDocument();
  });
});
