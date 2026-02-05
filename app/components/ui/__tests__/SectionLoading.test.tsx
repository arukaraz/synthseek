import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionLoading } from "../SectionLoading";

describe("SectionLoading", () => {
  it("renders default loading message", () => {
    render(<SectionLoading />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<SectionLoading message="Fetching data..." />);
    expect(screen.getByText("Fetching data...")).toBeInTheDocument();
  });

  it("does not render default message when custom message provided", () => {
    render(<SectionLoading message="Custom message" />);
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(screen.getByText("Custom message")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<SectionLoading className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("has flex layout with centered items", () => {
    const { container } = render(<SectionLoading />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("flex", "flex-col", "items-center", "justify-center");
  });
});
