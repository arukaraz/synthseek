import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@test/test-utils";
import { TrendingHeroNav } from "../TrendingHeroNav";
import { MAX_DOTS } from "../constants";

function buildProps(overrides: Partial<React.ComponentProps<typeof TrendingHeroNav>> = {}) {
  return {
    total: 4,
    currentIndex: 0,
    onSelect: vi.fn(),
    onPrev: vi.fn(),
    onNext: vi.fn(),
    ...overrides,
  };
}

describe("TrendingHeroNav", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when there is one or fewer slides", () => {
    const { container } = render(<TrendingHeroNav {...buildProps({ total: 1 })} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders one dot per slide when total is below the cap", () => {
    render(<TrendingHeroNav {...buildProps({ total: 4 })} />);

    expect(screen.getAllByRole("button", { name: /Go to slide/ })).toHaveLength(4);
  });

  it("caps the dot count at MAX_DOTS when there are more slides", () => {
    render(<TrendingHeroNav {...buildProps({ total: 20 })} />);

    expect(screen.getAllByRole("button", { name: /Go to slide/ })).toHaveLength(MAX_DOTS);
  });

  it("invokes onPrev when the previous arrow is clicked", () => {
    const onPrev = vi.fn();
    render(<TrendingHeroNav {...buildProps({ onPrev })} />);

    fireEvent.click(screen.getByRole("button", { name: "Previous trending track" }));

    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it("invokes onNext when the next arrow is clicked", () => {
    const onNext = vi.fn();
    render(<TrendingHeroNav {...buildProps({ onNext })} />);

    fireEvent.click(screen.getByRole("button", { name: "Next trending track" }));

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("maps the first dot to index 0 when selected", () => {
    const onSelect = vi.fn();
    render(<TrendingHeroNav {...buildProps({ total: 4, onSelect })} />);

    fireEvent.click(screen.getByRole("button", { name: "Go to slide 1" }));

    expect(onSelect).toHaveBeenCalledWith(0);
  });

  it("maps the last dot to the last real index when capped", () => {
    const onSelect = vi.fn();
    render(<TrendingHeroNav {...buildProps({ total: 12, onSelect })} />);

    fireEvent.click(screen.getByRole("button", { name: `Go to slide ${MAX_DOTS}` }));

    expect(onSelect).toHaveBeenCalledWith(11);
  });

  it("marks the active dot based on currentIndex", () => {
    render(<TrendingHeroNav {...buildProps({ total: 4, currentIndex: 2 })} />);

    const dots = screen.getAllByRole("button", { name: /Go to slide/ });
    expect(dots[2].className).not.toEqual(dots[0].className);
  });

  it("clamps the active dot to the last visible dot when currentIndex overflows the cap", () => {
    render(<TrendingHeroNav {...buildProps({ total: 12, currentIndex: 11 })} />);

    const dots = screen.getAllByRole("button", { name: /Go to slide/ });
    expect(dots[MAX_DOTS - 1].className).not.toEqual(dots[0].className);
  });
});
