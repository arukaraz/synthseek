import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../EmptyState";
import { Search, Music, Inbox } from "lucide-react";

describe("EmptyState", () => {
  it("renders the title", () => {
    render(<EmptyState icon={Search} title="No results found" description="Try a different search" />);
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<EmptyState icon={Search} title="No results" description="Try a different search term" />);
    expect(screen.getByText("Try a different search term")).toBeInTheDocument();
  });

  it("renders the provided icon", () => {
    render(<EmptyState icon={Music} title="No music" description="Add some tracks" />);
    const iconContainer = screen.getByRole("heading", { name: "No music" }).previousSibling;
    expect(iconContainer).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <EmptyState icon={Inbox} title="Empty" description="Nothing here" className="custom-class" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("renders title as h3 heading", () => {
    render(<EmptyState icon={Search} title="Test Title" description="Description" />);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("Test Title");
  });

  it("has flex layout with centered items", () => {
    const { container } = render(
      <EmptyState icon={Search} title="Title" description="Description" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("flex", "flex-col", "items-center", "justify-center");
  });
});
