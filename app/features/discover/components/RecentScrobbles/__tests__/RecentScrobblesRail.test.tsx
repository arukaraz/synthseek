import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, renderWithProviders, screen } from "@test/test-utils";

import { RecentScrobblesRail } from "../RecentScrobblesRail";
import { createScrobble } from "./fixtures";

vi.mock("../RecentScrobbleNode", () => ({
  RecentScrobbleNode: ({ scrobble }: { scrobble: ReturnType<typeof createScrobble> }) => (
    <div data-testid="node">{scrobble.title}</div>
  ),
}));

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function setScrollerGeometry(geometry: { scrollLeft: number; clientWidth: number; scrollWidth: number }) {
  const scroller = document.querySelector(".snap-x");
  if (!(scroller instanceof HTMLElement)) throw new Error("scroller not found");
  Object.defineProperty(scroller, "scrollLeft", { value: geometry.scrollLeft, configurable: true });
  Object.defineProperty(scroller, "clientWidth", { value: geometry.clientWidth, configurable: true });
  Object.defineProperty(scroller, "scrollWidth", { value: geometry.scrollWidth, configurable: true });
  return scroller;
}

describe("RecentScrobblesRail", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("renders a node per scrobble", () => {
    renderWithProviders(
      <RecentScrobblesRail
        scrobbles={[
          createScrobble({ catalogTrackId: "a", title: "A" }),
          createScrobble({ catalogTrackId: "b", title: "B" }),
        ]}
      />
    );

    expect(screen.getAllByTestId("node")).toHaveLength(2);
  });

  it("hides both edge affordances when content fits without scrolling", () => {
    renderWithProviders(<RecentScrobblesRail scrobbles={[createScrobble()]} />);

    setScrollerGeometry({ scrollLeft: 0, clientWidth: 300, scrollWidth: 300 });
    fireEvent.scroll(document.querySelector(".snap-x") as HTMLElement);

    expect(screen.getByLabelText("Scroll left").parentElement).toHaveClass("opacity-0");
    expect(screen.getByLabelText("Scroll right").parentElement).toHaveClass("opacity-0");
  });

  it("shows the right affordance when more content extends past the viewport", () => {
    renderWithProviders(<RecentScrobblesRail scrobbles={[createScrobble()]} />);

    setScrollerGeometry({ scrollLeft: 0, clientWidth: 300, scrollWidth: 900 });
    fireEvent.scroll(document.querySelector(".snap-x") as HTMLElement);

    expect(screen.getByLabelText("Scroll right").parentElement).toHaveClass("opacity-100");
    expect(screen.getByLabelText("Scroll left").parentElement).toHaveClass("opacity-0");
  });

  it("shows the left affordance once scrolled away from the start", () => {
    renderWithProviders(<RecentScrobblesRail scrobbles={[createScrobble()]} />);

    setScrollerGeometry({ scrollLeft: 120, clientWidth: 300, scrollWidth: 900 });
    fireEvent.scroll(document.querySelector(".snap-x") as HTMLElement);

    expect(screen.getByLabelText("Scroll left").parentElement).toHaveClass("opacity-100");
  });

  it("scrolls right by a page step when the right button is pressed", () => {
    renderWithProviders(<RecentScrobblesRail scrobbles={[createScrobble()]} />);

    const scroller = setScrollerGeometry({ scrollLeft: 0, clientWidth: 300, scrollWidth: 900 });
    const first = scroller.firstElementChild;
    if (first instanceof HTMLElement) Object.defineProperty(first, "offsetWidth", { value: 120, configurable: true });
    const scrollBy = vi.fn();
    scroller.scrollBy = scrollBy;

    fireEvent.click(screen.getByLabelText("Scroll right"));

    expect(scrollBy).toHaveBeenCalledWith({ left: (120 + 12) * 4, behavior: "smooth" });
  });

  it("scrolls left by a negative page step when the left button is pressed", () => {
    renderWithProviders(<RecentScrobblesRail scrobbles={[createScrobble()]} />);

    const scroller = setScrollerGeometry({ scrollLeft: 200, clientWidth: 300, scrollWidth: 900 });
    const first = scroller.firstElementChild;
    if (first instanceof HTMLElement) Object.defineProperty(first, "offsetWidth", { value: 100, configurable: true });
    const scrollBy = vi.fn();
    scroller.scrollBy = scrollBy;

    fireEvent.click(screen.getByLabelText("Scroll left"));

    expect(scrollBy).toHaveBeenCalledWith({ left: -(100 + 12) * 4, behavior: "smooth" });
  });

  it("falls back to the client width as the step when the rail has no node to measure", () => {
    renderWithProviders(<RecentScrobblesRail scrobbles={[]} />);

    const scroller = setScrollerGeometry({ scrollLeft: 0, clientWidth: 260, scrollWidth: 260 });
    const scrollBy = vi.fn();
    scroller.scrollBy = scrollBy;

    fireEvent.click(screen.getByLabelText("Scroll right"));

    expect(scrollBy).toHaveBeenCalledWith({ left: 260 * 4, behavior: "smooth" });
  });
});
