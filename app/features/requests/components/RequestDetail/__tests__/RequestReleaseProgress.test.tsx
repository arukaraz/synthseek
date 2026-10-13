import type { ActiveRelease } from "@api/__generated__/types";
import { render, screen } from "@test/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestsTrack } from "../../../__tests__/factories";
import { RequestReleaseProgress } from "../RequestReleaseProgress";

const releaseState = vi.hoisted(() => ({ current: [] as ActiveRelease[], askedFor: [] as string[][] }));

vi.mock("@hooks/api/queries/useActiveReleases", () => ({
  useRequestReleases: (trackIds: readonly string[]) => {
    releaseState.askedFor.push([...trackIds]);
    return releaseState.current;
  },
}));

function release(releaseKey: string, state: ActiveRelease["state"]): ActiveRelease {
  return {
    userId: "user-1",
    source: "torrent",
    releaseKey,
    title: releaseKey,
    state,
    percent: 30,
    doneBytes: 30,
    totalBytes: 100,
    etaMinutes: null,
    albumIds: ["album-1"],
    trackRequestIds: ["t1"],
  };
}

beforeEach(() => {
  releaseState.current = [];
  releaseState.askedFor = [];
});

describe("RequestReleaseProgress", () => {
  it("asks for the releases of this request's tracks and shows one card per release", () => {
    releaseState.current = [release("album-a", "fetching"), release("album-b", "queued")];

    render(<RequestReleaseProgress tracks={[makeRequestsTrack({ id: "t1" }), makeRequestsTrack({ id: "t2" })]} />);

    expect(releaseState.askedFor.at(-1)).toEqual(["t1", "t2"]);
    expect(screen.getAllByTestId("release-progress").map((card) => card.getAttribute("data-state"))).toEqual([
      "fetching",
      "queued",
    ]);
  });

  it("renders nothing while no release of the request is in flight", () => {
    const { container } = render(<RequestReleaseProgress tracks={[makeRequestsTrack({ id: "t1" })]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
