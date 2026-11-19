import { render, screen } from "@testing-library/react";
import { Check, Clock, Disc3, Download, Hourglass, TriangleAlert, Zap } from "lucide-react";
import { describe, expect, it } from "vitest";

import { TooltipProvider } from "@components/ui/Tooltip";
import type { FollowReleaseState } from "@hooks/api/queries/artist-follow/types";

import { isRequestable, releaseStateInfo } from "../helpers";
import { ReleaseState } from "../ReleaseState";

const EXPECTED: ReadonlyArray<[FollowReleaseState, string, unknown, "none" | "request" | "viewRequest" | "play"]> = [
  ["announced", "Announced", Clock, "none"],
  ["available", "Not in library", Disc3, "request"],
  ["quota_skipped", "Skipped: request quota reached", TriangleAlert, "request"],
  ["requested", "Requested", Download, "viewRequest"],
  ["pending_approval", "Waiting for approval", Hourglass, "none"],
  ["auto_requested", "Requested automatically", Zap, "viewRequest"],
  ["in_library", "In library", Check, "play"],
];

describe("release state", () => {
  it.each(EXPECTED)("%s reads %s with its glyph and action", (state, label, glyph, action) => {
    const info = releaseStateInfo(state, false);
    expect(info.glyph).toBe(glyph);
    expect(info.action).toBe(action);

    render(<ReleaseState state={state} autoRequest={false} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("promises a request for an announced release of an artist set to automatic requests", () => {
    render(<ReleaseState state="announced" autoRequest />);
    expect(screen.getByText("Will be requested")).toBeInTheDocument();
    expect(screen.queryByText("Announced")).not.toBeInTheDocument();
  });

  it("offers a request only for the two states the library can still act on", () => {
    const requestable = EXPECTED.filter(([state]) => isRequestable(state)).map(([state]) => state);
    expect(requestable).toEqual(["available", "quota_skipped"]);
  });

  it("keeps the label as the accessible name when only the glyph is drawn", () => {
    render(
      <TooltipProvider>
        <ReleaseState state="in_library" autoRequest={false} showLabel={false} />
      </TooltipProvider>
    );
    expect(screen.getByRole("img", { name: "In library" })).toBeInTheDocument();
  });
});
