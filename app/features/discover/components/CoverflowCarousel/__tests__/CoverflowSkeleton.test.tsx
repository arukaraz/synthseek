import { describe, it, expect, vi } from "vitest";
import { render } from "@test/test-utils";
import { CoverflowSkeleton } from "../CoverflowSkeleton";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    motion: {
      div: ({ children, className, style, ...props }: React.ComponentProps<"div">) => (
        <div className={className} style={style} {...props}>
          {children}
        </div>
      ),
    },
  };
});

describe("CoverflowSkeleton", () => {
  it("renders the carousel wrapper", () => {
    const { container } = render(<CoverflowSkeleton />);

    const wrapper = container.querySelector(".group\\/carousel");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass("relative", "w-full", "overflow-hidden");
  });

  it("renders skeleton cards", () => {
    const { container } = render(<CoverflowSkeleton />);

    const cards = container.querySelectorAll(".aspect-square.absolute");
    expect(cards.length).toBeGreaterThan(0);
  });

  it("renders center card with special styling", () => {
    const { container } = render(<CoverflowSkeleton />);

    const centerCard = container.querySelector(".bg-fg\\/15");
    expect(centerCard).toBeInTheDocument();
    expect(centerCard).toHaveClass("ring-2", "ring-white/10");
  });

  it("has perspective container for 3D effect", () => {
    const { container } = render(<CoverflowSkeleton />);

    const perspectiveContainer = container.querySelector('[style*="perspective"]');
    expect(perspectiveContainer).toBeInTheDocument();
  });

  it("renders cards with rounded corners", () => {
    const { container } = render(<CoverflowSkeleton />);

    const cards = container.querySelectorAll(".rounded-xl");
    expect(cards.length).toBeGreaterThan(0);
  });

  it("renders cards with shadow", () => {
    const { container } = render(<CoverflowSkeleton />);

    const cards = container.querySelectorAll(".shadow-2xl");
    expect(cards.length).toBeGreaterThan(0);
  });

  it("hides some cards on mobile", () => {
    const { container } = render(<CoverflowSkeleton />);

    const hiddenOnMobile = container.querySelectorAll(".hidden.sm\\:block");
    expect(hiddenOnMobile.length).toBeGreaterThan(0);
  });

  it("has responsive aspect ratio classes", () => {
    const { container } = render(<CoverflowSkeleton />);

    const aspectContainer = container.querySelector(".aspect-square.sm\\:aspect-4\\/3");
    expect(aspectContainer).toBeInTheDocument();
  });
});
