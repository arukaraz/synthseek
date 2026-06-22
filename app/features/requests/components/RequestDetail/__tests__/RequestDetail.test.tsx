import { render, screen } from "@test/test-utils";
import { describe, expect, it, vi } from "vitest";

import { makeRequestWithTracks } from "../../../__tests__/factories";
import { RequestDetail } from "../RequestDetail";

vi.mock("../RequestDetailHero", () => ({
  RequestDetailHero: () => <div>hero</div>,
}));

vi.mock("../RequestDetailStats", () => ({
  RequestDetailStats: () => <div>stats</div>,
}));

vi.mock("../RequestDetailTracks", () => ({
  RequestDetailTracks: () => <div>tracks</div>,
}));

describe("RequestDetail", () => {
  it("shows the select-a-request empty state when no request is selected", () => {
    render(<RequestDetail request={null} onBack={vi.fn()} />);

    expect(screen.getByText("Select a request")).toBeInTheDocument();
    expect(screen.queryByText("hero")).not.toBeInTheDocument();
  });

  it("composes the hero, stats and tracks for a selected request", () => {
    render(<RequestDetail request={makeRequestWithTracks()} onBack={vi.fn()} />);

    expect(screen.getByText("hero")).toBeInTheDocument();
    expect(screen.getByText("stats")).toBeInTheDocument();
    expect(screen.getByText("tracks")).toBeInTheDocument();
  });
});
