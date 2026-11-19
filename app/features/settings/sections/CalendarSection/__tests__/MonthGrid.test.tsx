import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { FollowRelease } from "@hooks/api/queries/artist-follow/types";

import { MonthGrid } from "../components/MonthGrid";

vi.mock("@components/ReleaseActions", () => ({
  ReleaseMainAction: () => null,
  ReleaseMoreMenu: () => null,
}));

const MONDAY = 1;
const NOVEMBER = { year: 2026, month: 11 };

function release(id: string, overrides: Partial<FollowRelease> = {}): FollowRelease {
  return {
    releaseId: id,
    catalogAlbumId: `al-${id}`,
    title: `Title ${id}`,
    artistName: `Artist ${id}`,
    creditedArtist: null,
    catalogArtistId: `ar-${id}`,
    image: null,
    releaseDate: "2026-11-18",
    type: "album",
    explicit: false,
    autoRequest: false,
    state: "announced",
    ...overrides,
  };
}

function renderMonth(releases: FollowRelease[], width = 900, onMonthChange = vi.fn()) {
  render(
    <MonthGrid
      month={NOVEMBER}
      firstDay={MONDAY}
      releases={releases}
      today="2026-11-18"
      width={width}
      onMonthChange={onMonthChange}
    />
  );
  return onMonthChange;
}

describe("MonthGrid", () => {
  it("starts the week where the locale does and marks the server's today", () => {
    renderMonth([]);

    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(7);
    expect(headers[0]).toHaveTextContent("Monday");
    expect(screen.getByRole("gridcell", { current: "date" })).toHaveAttribute("data-iso", "2026-11-18");
  });

  it("shows three chips for a busy day and counts the rest", () => {
    renderMonth(["a", "b", "c", "d", "e"].map((id) => release(id)));

    const cell = screen.getByRole("gridcell", { name: /November 18.*5 releases/ });
    expect(within(cell).getAllByRole("button", { name: /Artist/ })).toHaveLength(3);
    expect(within(cell).getByRole("button", { name: "+2 more" })).toBeInTheDocument();
  });

  it("does not draw an overflow button for a day that fits", () => {
    renderMonth([release("a"), release("b")]);

    expect(screen.queryByRole("button", { name: /more$/ })).not.toBeInTheDocument();
  });

  it("announces the month and how many releases it holds", () => {
    renderMonth([release("a"), release("b")]);

    expect(screen.getByRole("status")).toHaveTextContent("November 2026, 2 releases");
  });

  it("moves focus a day at a time with the arrow keys and asks for the next month at the edge", () => {
    const onMonthChange = renderMonth([]);
    const today = screen.getByRole("gridcell", { current: "date" });
    today.focus();

    fireEvent.keyDown(today, { key: "ArrowRight" });
    expect(document.activeElement).toHaveAttribute("data-iso", "2026-11-19");

    fireEvent.keyDown(document.activeElement ?? today, { key: "PageDown" });
    expect(onMonthChange).toHaveBeenCalledWith({ year: 2026, month: 12 });
  });

  it("keeps a single tab stop in the grid", () => {
    renderMonth([release("a")]);

    const stops = screen.getAllByRole("gridcell").filter((cell) => cell.getAttribute("tabindex") === "0");
    expect(stops).toHaveLength(1);
  });

  it("gives the compact grid short day cells and the wide grid tall ones, never both", () => {
    const wide = renderMonth([release("a")], 900);
    expect(wide).toBeDefined();
    const tall = screen.getAllByRole("gridcell")[0];
    expect(tall).toHaveClass("min-h-28");
    expect(tall).not.toHaveClass("min-h-12");
  });

  it("keeps the compact day cell from carrying the tall minimum height", () => {
    renderMonth([release("a")], 400);

    const short = screen.getAllByRole("gridcell")[0];
    expect(short).toHaveClass("min-h-12");
    expect(short).not.toHaveClass("min-h-28");
  });

  it("swaps chips for dots and a day list when the container is narrow", () => {
    renderMonth([release("a"), release("b")], 400);

    expect(screen.queryByRole("button", { name: /Artist a/ })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: /Releases on/ })).toBeInTheDocument();
  });
});
