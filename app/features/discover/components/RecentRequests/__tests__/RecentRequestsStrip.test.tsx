import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { FlatTrackRow } from "@features/requests/types";
import { fireEvent, renderWithProviders, screen } from "@test/test-utils";

import { RecentRequestsStrip } from "../RecentRequestsStrip";
import { createFlatTrackRow } from "./fixtures";

vi.mock("../RecentRequestCard", () => ({
  RecentRequestCard: ({ request }: { request: FlatTrackRow }) => <div data-testid="card">{request.title}</div>,
}));

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function getScroller(): HTMLElement {
  const scroller = document.querySelector(".no-scrollbar");
  if (!(scroller instanceof HTMLElement)) throw new Error("scroller not found");
  return scroller;
}

function setScrollerGeometry(geometry: { scrollLeft: number; clientWidth: number; scrollWidth: number }) {
  const scroller = getScroller();
  Object.defineProperty(scroller, "scrollLeft", { value: geometry.scrollLeft, configurable: true });
  Object.defineProperty(scroller, "clientWidth", { value: geometry.clientWidth, configurable: true });
  Object.defineProperty(scroller, "scrollWidth", { value: geometry.scrollWidth, configurable: true });
  return scroller;
}

describe("RecentRequestsStrip", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("renders a card per item", () => {
    renderWithProviders(
      <RecentRequestsStrip
        items={[createFlatTrackRow({ id: "a", title: "A" }), createFlatTrackRow({ id: "b", title: "B" })]}
      />
    );

    expect(screen.getAllByTestId("card")).toHaveLength(2);
  });

  it("disables both edge buttons when content fits", () => {
    renderWithProviders(<RecentRequestsStrip items={[createFlatTrackRow()]} />);

    setScrollerGeometry({ scrollLeft: 0, clientWidth: 300, scrollWidth: 300 });
    fireEvent.scroll(getScroller());

    expect(screen.getByLabelText("Scroll to previous requests")).toBeDisabled();
    expect(screen.getByLabelText("Scroll to next requests")).toBeDisabled();
  });

  it("enables the next button when content overflows", () => {
    renderWithProviders(<RecentRequestsStrip items={[createFlatTrackRow()]} />);

    setScrollerGeometry({ scrollLeft: 0, clientWidth: 300, scrollWidth: 900 });
    fireEvent.scroll(getScroller());

    expect(screen.getByLabelText("Scroll to next requests")).toBeEnabled();
    expect(screen.getByLabelText("Scroll to previous requests")).toBeDisabled();
  });

  it("enables the previous button once scrolled away from the start", () => {
    renderWithProviders(<RecentRequestsStrip items={[createFlatTrackRow()]} />);

    setScrollerGeometry({ scrollLeft: 80, clientWidth: 300, scrollWidth: 900 });
    fireEvent.scroll(getScroller());

    expect(screen.getByLabelText("Scroll to previous requests")).toBeEnabled();
  });

  it("scrolls by one card width when the next button is pressed", () => {
    renderWithProviders(<RecentRequestsStrip items={[createFlatTrackRow()]} />);

    const scroller = setScrollerGeometry({ scrollLeft: 0, clientWidth: 300, scrollWidth: 900 });
    const first = scroller.firstElementChild;
    if (first instanceof HTMLElement) Object.defineProperty(first, "offsetWidth", { value: 240, configurable: true });
    const scrollBy = vi.fn();
    scroller.scrollBy = scrollBy;
    fireEvent.scroll(scroller);

    fireEvent.click(screen.getByLabelText("Scroll to next requests"));

    expect(scrollBy).toHaveBeenCalledWith({ left: 240, behavior: "smooth" });
  });

  it("scrolls back by one card width when the previous button is pressed", () => {
    renderWithProviders(<RecentRequestsStrip items={[createFlatTrackRow()]} />);

    const scroller = setScrollerGeometry({ scrollLeft: 240, clientWidth: 300, scrollWidth: 900 });
    const first = scroller.firstElementChild;
    if (first instanceof HTMLElement) Object.defineProperty(first, "offsetWidth", { value: 240, configurable: true });
    const scrollBy = vi.fn();
    scroller.scrollBy = scrollBy;
    fireEvent.scroll(scroller);

    fireEvent.click(screen.getByLabelText("Scroll to previous requests"));

    expect(scrollBy).toHaveBeenCalledWith({ left: -240, behavior: "smooth" });
  });

  it("falls back to the client width as the step when no card is present to measure", () => {
    renderWithProviders(<RecentRequestsStrip items={[createFlatTrackRow()]} />);

    const scroller = setScrollerGeometry({ scrollLeft: 0, clientWidth: 280, scrollWidth: 900 });
    const scrollBy = vi.fn();
    scroller.scrollBy = scrollBy;
    fireEvent.scroll(scroller);
    scroller.replaceChildren();

    fireEvent.click(screen.getByLabelText("Scroll to next requests"));

    expect(scrollBy).toHaveBeenCalledWith({ left: 280, behavior: "smooth" });
  });
});
