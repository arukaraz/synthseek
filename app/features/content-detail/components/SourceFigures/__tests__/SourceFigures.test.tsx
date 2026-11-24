import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { render, screen, within } from "@test/test-utils";

import { figureGroupsOf } from "../helpers";
import { SourceFigures } from "../SourceFigures";
import type { FigureSources } from "../types";

const ALL: FigureSources = {
  lastfm: { listeners: 1200, plays: 9800 },
  listenbrainz: { listeners: 310, plays: 4100 },
  catalogFans: { provider: "Deezer", fans: 5600 },
};

function renderFigures(sources: FigureSources = ALL) {
  render(<SourceFigures groups={figureGroupsOf(sources)} plain={{ label: "In library", value: 7 }} />);
  return userEvent.setup();
}

function figure(name: RegExp): HTMLElement {
  return screen.getByRole("button", { name });
}

describe("SourceFigures", () => {
  it("shows one figure per datum from the first source that has it, with no badge beside it", () => {
    renderFigures();

    expect(figure(/Listeners/)).toHaveTextContent("1,200");
    expect(figure(/Plays/)).toHaveTextContent("9,800");
    expect(document.querySelector("[data-source-badge]")).toBeNull();
  });

  it("calls the figure Fans when the catalog is the first source that has it", () => {
    renderFigures({ ...ALL, lastfm: null });

    expect(figure(/Fans/)).toHaveTextContent("5,600");
    expect(screen.queryByRole("button", { name: /Listeners/ })).not.toBeInTheDocument();
    expect(figure(/Plays/)).toHaveTextContent("4,100");
  });

  it("opens that figure alone, one row per source with its badge, the catalog's marked as fans", async () => {
    const user = renderFigures();

    await user.click(figure(/Listeners/));

    const panel = screen.getByRole("group", { name: "Listeners by source" });
    expect([...panel.querySelectorAll("[data-source-badge]")].map((badge) => badge.textContent)).toEqual([
      "Last.fm",
      "Deezer",
      "ListenBrainz",
    ]);
    expect(panel).toHaveTextContent("1,200");
    expect(panel).toHaveTextContent("fans5,600");
    expect(panel).toHaveTextContent("310");
    expect(panel).not.toHaveTextContent("9,800");
    expect(screen.queryByRole("group", { name: "Plays by source" })).not.toBeInTheDocument();
  });

  it("closes on a second click of the same figure", async () => {
    const user = renderFigures();

    await user.click(figure(/Listeners/));
    await user.click(figure(/Listeners/));

    expect(screen.queryByRole("group", { name: "Listeners by source" })).not.toBeInTheDocument();
  });

  it("keeps a single breakdown open: opening the plays closes the listeners", async () => {
    const user = renderFigures();

    await user.click(figure(/Listeners/));
    await user.click(figure(/Plays/));

    expect(screen.queryByRole("group", { name: "Listeners by source" })).not.toBeInTheDocument();
    const panel = screen.getByRole("group", { name: "Plays by source" });
    expect([...panel.querySelectorAll("[data-source-badge]")].map((badge) => badge.textContent)).toEqual([
      "Last.fm",
      "ListenBrainz",
    ]);
  });

  it("draws a figure nobody has as a dash that opens nothing", () => {
    renderFigures({ lastfm: null, listenbrainz: null, catalogFans: null });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Listeners").parentElement).toHaveTextContent("-");
    expect(screen.getByText("Plays").parentElement).toHaveTextContent("-");
  });

  it("never makes the plain figure a button", () => {
    renderFigures();

    const cell = screen.getByText("In library").parentElement;
    if (!cell) throw new Error("cell missing");
    expect(cell).toHaveTextContent("7");
    expect(within(cell).queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });
});
