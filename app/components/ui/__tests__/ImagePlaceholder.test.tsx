import { describe, it, expect } from "vitest";
import { render } from "@test/test-utils";
import { ImagePlaceholder } from "../ImagePlaceholder";
import { User } from "lucide-react";

describe("ImagePlaceholder", () => {
  it("renders with default Music icon", () => {
    const { container } = render(<ImagePlaceholder />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("text-primary-400");
  });

  it("renders with custom icon", () => {
    const { container } = render(<ImagePlaceholder icon={User} />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies sm size classes", () => {
    const { container } = render(<ImagePlaceholder size="sm" />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("h-10", "w-10");
  });

  it("applies md size classes by default", () => {
    const { container } = render(<ImagePlaceholder />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("h-14", "w-14");
  });

  it("applies lg size classes", () => {
    const { container } = render(<ImagePlaceholder size="lg" />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("h-16", "w-16");
  });

  it("applies sm icon size", () => {
    const { container } = render(<ImagePlaceholder size="sm" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("h-5", "w-5");
  });

  it("applies md icon size by default", () => {
    const { container } = render(<ImagePlaceholder />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("h-7", "w-7");
  });

  it("applies lg icon size", () => {
    const { container } = render(<ImagePlaceholder size="lg" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("h-8", "w-8");
  });

  it("applies custom className", () => {
    const { container } = render(<ImagePlaceholder className="custom-class" />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("has gradient background styling", () => {
    const { container } = render(<ImagePlaceholder />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("bg-gradient-to-br");
  });

  it("has rounded corners", () => {
    const { container } = render(<ImagePlaceholder />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("rounded-lg");
  });
});
