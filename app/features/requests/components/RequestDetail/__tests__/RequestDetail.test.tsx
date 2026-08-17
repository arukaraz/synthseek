import type { TrackRequest } from "@api/__generated__/types";
import { render, screen } from "@test/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestListItem, makeRequestsTrack } from "../../../__tests__/factories";
import { RequestDetail } from "../RequestDetail";

const { detailQuery, heroSpy, tracksSpy, statsSpy, detailArgs } = vi.hoisted(() => ({
  detailQuery: { data: undefined as unknown, isLoading: false, isError: false },
  heroSpy: vi.fn(),
  tracksSpy: vi.fn(),
  statsSpy: vi.fn(),
  detailArgs: vi.fn(),
}));

vi.mock("@hooks/api", () => ({
  useRequestDetail: (args: unknown) => {
    detailArgs(args);
    return { ...detailQuery, refetch: vi.fn() };
  },
}));

vi.mock("../RequestDetailHero", () => ({
  RequestDetailHero: (props: { tracks: TrackRequest[] }) => {
    heroSpy(props.tracks);
    return <div>hero</div>;
  },
}));

vi.mock("../RequestDetailStats", () => ({
  RequestDetailStats: (props: { isResolving: boolean }) => {
    statsSpy(props);
    return <div>stats</div>;
  },
}));

vi.mock("../RequestDetailTracks", () => ({
  RequestDetailTracks: (props: { tracks: TrackRequest[]; isResolving: boolean; hasFailed: boolean }) => {
    tracksSpy(props);
    return <div>tracks</div>;
  },
}));

beforeEach(() => {
  detailQuery.data = undefined;
  detailQuery.isLoading = false;
  detailQuery.isError = false;
  heroSpy.mockReset();
  tracksSpy.mockReset();
  statsSpy.mockReset();
  detailArgs.mockReset();
});

describe("RequestDetail", () => {
  it("shows the select-a-request empty state when no request is selected", () => {
    render(<RequestDetail request={null} onBack={vi.fn()} />);

    expect(screen.getByText("Select a request")).toBeInTheDocument();
    expect(screen.queryByText("hero")).not.toBeInTheDocument();
  });

  it("composes the hero, stats and tracks for a selected request", () => {
    const request = makeRequestListItem({ id: "req-1" });
    detailQuery.data = { ...request, tracks: [makeRequestsTrack({ id: "t1" })] };

    render(<RequestDetail request={request} onBack={vi.fn()} />);

    expect(screen.getByText("hero")).toBeInTheDocument();
    expect(screen.getByText("stats")).toBeInTheDocument();
    expect(screen.getByText("tracks")).toBeInTheDocument();
  });

  it("hands the loaded tracks to the hero, which derives the approve and prioritize actions from them", () => {
    const request = makeRequestListItem({ id: "req-1" });
    const track = makeRequestsTrack({ id: "t1" });
    detailQuery.data = { ...request, tracks: [track] };

    render(<RequestDetail request={request} onBack={vi.fn()} />);

    expect(heroSpy).toHaveBeenCalledWith([track]);
  });

  it("renders the hero straight away while the tracks are still loading", () => {
    detailQuery.isLoading = true;

    render(<RequestDetail request={makeRequestListItem({ id: "req-1" })} onBack={vi.fn()} />);

    expect(screen.getByText("hero")).toBeInTheDocument();
    expect(tracksSpy).toHaveBeenCalledWith(expect.objectContaining({ isResolving: true, tracks: [] }));
  });

  it("never hands the previously selected request's tracks to a newly selected one", () => {
    detailQuery.data = { ...makeRequestListItem({ id: "previous" }), tracks: [makeRequestsTrack({ id: "stale" })] };

    render(<RequestDetail request={makeRequestListItem({ id: "current" })} onBack={vi.fn()} />);

    expect(heroSpy).toHaveBeenCalledWith([]);
    expect(tracksSpy).toHaveBeenCalledWith(expect.objectContaining({ isResolving: true, tracks: [] }));
  });

  it("tells the stats not to render its track-derived counts while they are unknown", () => {
    detailQuery.isLoading = true;

    render(<RequestDetail request={makeRequestListItem({ id: "req-1" })} onBack={vi.fn()} />);

    expect(statsSpy).toHaveBeenCalledWith(expect.objectContaining({ isResolving: true }));
  });

  it("lets the stats render their counts once the detail for THIS request has landed", () => {
    const request = makeRequestListItem({ id: "req-1" });
    detailQuery.data = { ...request, tracks: [makeRequestsTrack({ id: "t1" })] };

    render(<RequestDetail request={request} onBack={vi.fn()} />);

    expect(statsSpy).toHaveBeenCalledWith(expect.objectContaining({ isResolving: false }));
  });

  it("keeps showing a valid cached detail when a BACKGROUND refetch fails, instead of discarding it", () => {
    const request = makeRequestListItem({ id: "req-1" });
    const track = makeRequestsTrack({ id: "t1" });
    detailQuery.data = { ...request, tracks: [track] };
    detailQuery.isError = true;

    render(<RequestDetail request={request} onBack={vi.fn()} />);

    expect(tracksSpy).toHaveBeenCalledWith(expect.objectContaining({ hasFailed: false, tracks: [track] }));
  });

  it("surfaces a failed detail query instead of spinning forever", () => {
    detailQuery.isError = true;

    render(<RequestDetail request={makeRequestListItem({ id: "req-1" })} onBack={vi.fn()} />);

    expect(screen.getByText("hero")).toBeInTheDocument();
    expect(tracksSpy).toHaveBeenCalledWith(expect.objectContaining({ hasFailed: true, isResolving: false }));
    expect(statsSpy).toHaveBeenCalledWith(expect.objectContaining({ isResolving: true }));
  });

  it("asks for the SELECTED container by its own id and content type", () => {
    const request = makeRequestListItem({ id: "pl_7", external_id: "ext-7", contentType: "playlist" });

    render(<RequestDetail request={request} onBack={vi.fn()} />);

    expect(detailArgs).toHaveBeenCalledWith({ id: "pl_7", contentType: "playlist" });
  });

  it("treats a container the server no longer returns as failed, not as loading", () => {
    detailQuery.data = null;

    render(<RequestDetail request={makeRequestListItem({ id: "req-1" })} onBack={vi.fn()} />);

    expect(tracksSpy).toHaveBeenCalledWith(expect.objectContaining({ hasFailed: true, isResolving: false }));
  });
});
