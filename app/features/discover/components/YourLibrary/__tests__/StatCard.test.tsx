import { describe, it, expect } from "vitest";
import { render, screen } from "@test/test-utils";
import { StatCard } from "../StatCard";
import { Music, Clock } from "lucide-react";

describe("StatCard", () => {
  it("renders value and label", () => {
    render(<StatCard value={42} label="Tracks" />);

    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Tracks")).toBeInTheDocument();
  });

  it("formats large numbers with locale string", () => {
    render(<StatCard value={1234567} label="Downloads" />);

    expect(screen.getByText("1,234,567")).toBeInTheDocument();
  });

  it("renders sublabel when provided", () => {
    render(<StatCard value={100} label="Complete" sublabel="last 7 days" />);

    expect(screen.getByText("last 7 days")).toBeInTheDocument();
  });

  it("does not render sublabel when not provided", () => {
    render(<StatCard value={100} label="Complete" />);

    expect(screen.queryByText("last 7 days")).not.toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(<StatCard value={50} label="Songs" icon={Music} />);

    const icon = document.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("does not render icon when not provided", () => {
    const { container } = render(<StatCard value={50} label="Songs" />);

    const icon = container.querySelector("svg");
    expect(icon).not.toBeInTheDocument();
  });

  it("renders zero value correctly", () => {
    render(<StatCard value={0} label="Pending" />);

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    const { container } = render(<StatCard value={10} label="Test" icon={Clock} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("flex", "flex-col", "items-center");
  });
});
