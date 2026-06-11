import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { ActivityDivider } from "../ActivityDivider";

const reducedMotion = vi.hoisted(() => ({ value: false }));

vi.mock("framer-motion", () => ({
  useReducedMotion: () => reducedMotion.value,
}));

describe("ActivityDivider", () => {
  beforeEach(() => {
    reducedMotion.value = false;
  });

  it("renders an idle rail", () => {
    const { container } = render(<ActivityDivider state="idle" />);
    const rail = container.querySelector(".activity-rail");
    expect(rail).toHaveClass("activity-rail-idle");
  });

  it("renders the in-progress rail with faster motion", () => {
    const { container } = render(<ActivityDivider state="in-progress" />);
    const rail = container.querySelector(".activity-rail");
    expect(rail).toHaveClass("activity-rail-progress");
  });

  it("renders the plex-sync azure rail and its travel sweep", () => {
    const { container } = render(<ActivityDivider state="plex-sync" value={3} max={8} />);
    const rail = container.querySelector(".activity-rail");
    expect(rail).toHaveClass("activity-rail-plex");
    expect(container.querySelector(".activity-rail-travel")).toBeInTheDocument();
  });

  it("no longer renders the inline plex-sync chip, label, or live region", () => {
    render(<ActivityDivider state="plex-sync" value={3} max={8} />);
    expect(screen.queryByText("3/8")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders toolbar children", () => {
    render(
      <ActivityDivider state="plex-sync" value={3} max={8}>
        <button type="button">Import library</button>
      </ActivityDivider>
    );
    expect(screen.getByRole("button", { name: "Import library" })).toBeInTheDocument();
  });

  it("substitutes a static determinate fill under reduced motion", () => {
    reducedMotion.value = true;
    const { container } = render(<ActivityDivider state="plex-sync" value={4} max={8} />);
    expect(container.querySelector(".activity-rail-travel")).not.toBeInTheDocument();
    const fill = container.querySelector(".activity-rail-static");
    expect(fill).toBeInTheDocument();
    expect(fill).toHaveStyle({ "inline-size": "50%" });
  });
});
