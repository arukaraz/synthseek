import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@test/test-utils";

import { RuleControls } from "../RuleControls";
import type { WidgetRule } from "../types";

const LIMITS = { daysMax: 3650, topNMax: 50 };

function renderRule(rule: WidgetRule, playlists: { id: string; name: string }[] = []) {
  const onChange = vi.fn<(rule: WidgetRule) => void>();
  const view = render(
    <RuleControls rule={rule} limits={LIMITS} people={[]} playlists={playlists} onChange={onChange} />
  );
  return { onChange, view };
}

function selected(name: string): string | null {
  return screen.getByRole("button", { name }).textContent;
}

describe("RuleControls", () => {
  it.each<[WidgetRule, string, string]>([
    [{ field: "plays", op: "gte", value: 3 }, "at least", "times"],
    [{ field: "durationMinutes", op: "lte", value: 4 }, "at most", "min"],
    [{ field: "rating", op: "gte", value: 4 }, "at least", "stars"],
    [{ field: "bitrate", op: "lt", value: 192 }, "below", "kbps"],
    [{ field: "ownedShare", op: "gte", value: 0.5 }, "at least", "%"],
    [{ field: "listeners", op: "lt", value: 1000 }, "below", ""],
    [{ field: "releaseType", op: "isNot", value: "ep" }, "is not", ""],
    [{ field: "mood", op: "is", value: "calm" }, "is", ""],
    [{ field: "user", op: "with", value: "household" }, "played by me and", ""],
  ])("shows the condition of %j and the unit after its value", (rule, condition, unit) => {
    renderRule(rule);
    expect(selected("Condition")).toBe(condition);
    if (unit) expect(screen.getByText(unit)).toBeInTheDocument();
  });

  it.each<[WidgetRule, string]>([
    [{ field: "tempo", op: "is", value: "slow" }, "Slow, under 95"],
    [{ field: "energy", op: "is", value: "high" }, "High"],
    [{ field: "releaseType", op: "is", value: "ep" }, "EP"],
    [{ field: "mood", op: "isNot", value: "calm" }, "Calm"],
    [{ field: "favorite", op: "is", value: true }, "Yes"],
    [{ field: "inLibrary", op: "is", value: false }, "No"],
    [{ field: "requestStatus", op: "is", value: "complete" }, "Complete"],
    [{ field: "decade", op: "is", value: "myTop" }, "My top decade"],
    [{ field: "decade", op: "is", value: 1990 }, "1990s"],
    [{ field: "user", op: "is", value: "household" }, "everyone who shares"],
  ])("names the value of %j in words", (rule, value) => {
    renderRule(rule);
    expect(selected("Value")).toBe(value);
  });

  it("names the playlist a rule points at, and asks for one when it points at none", () => {
    renderRule({ field: "inPlaylist", op: "is", value: "p1" }, [{ id: "p1", name: "Road trip" }]);
    expect(selected("Value")).toBe("Road trip");
    renderRule({ field: "inPlaylist", op: "isNot", value: "gone" });
    expect(screen.getByText("Choose a playlist")).toBeInTheDocument();
  });

  it.each<[WidgetRule, number, string[]]>([
    [{ field: "addedInLast", op: "days", value: 30 }, 30, ["the last", "days"]],
    [{ field: "notPlayedInLast", op: "days", value: 90 }, 90, ["days"]],
    [{ field: "skips", op: "lte", value: 2 }, 2, ["at most"]],
    [{ field: "genre", op: "inMyTop", value: 5 }, 5, ["in my top"]],
  ])("reads %j as a sentence around its number", (rule, number, words) => {
    renderRule(rule);
    for (const word of words) expect(screen.getByText(word)).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Value" })).toHaveValue(number);
  });

  it("shows a share as a percent and stores the percent typed back as a fraction", () => {
    const { onChange } = renderRule({ field: "ownedShare", op: "lt", value: 0.25 });
    const field = screen.getByRole("spinbutton", { name: "Value" });
    expect(field).toHaveValue(25);
    fireEvent.change(field, { target: { value: "40" } });
    expect(onChange).toHaveBeenCalledWith({ field: "ownedShare", op: "lt", value: 0.4 });
  });

  it("changes one end of a year range and keeps the other", () => {
    const { onChange } = renderRule({ field: "yearRange", op: "between", value: { from: 1990, to: 1999 } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "To year" }), { target: { value: "2005" } });
    expect(onChange).toHaveBeenCalledWith({ field: "yearRange", op: "between", value: { from: 1990, to: 2005 } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "From year" }), { target: { value: "1980" } });
    expect(onChange).toHaveBeenLastCalledWith({ field: "yearRange", op: "between", value: { from: 1980, to: 1999 } });
  });

  it("changes the size of a top artist window or its days, keeping the other", () => {
    const { onChange } = renderRule({ field: "artistInMyTop", op: "within", value: { n: 10, days: 30 } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "over days" }), { target: { value: "60" } });
    expect(onChange).toHaveBeenCalledWith({ field: "artistInMyTop", op: "within", value: { n: 10, days: 60 } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Top" }), { target: { value: "20" } });
    expect(onChange).toHaveBeenLastCalledWith({ field: "artistInMyTop", op: "within", value: { n: 20, days: 30 } });
  });

  it("hands up a typed number for a counted rule", () => {
    const { onChange } = renderRule({ field: "listeners", op: "gte", value: 100 });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Value" }), { target: { value: "500" } });
    expect(onChange).toHaveBeenCalledWith({ field: "listeners", op: "gte", value: 500 });
  });

  it("draws nothing for the time slot rule, which has no value to set", () => {
    const { view } = renderRule({ field: "inCurrentTimeSlot", op: "is", value: true });
    expect(view.container).toBeEmptyDOMElement();
  });
});
