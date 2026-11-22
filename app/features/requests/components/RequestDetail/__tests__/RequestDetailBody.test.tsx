import { RequestStatus, type TrackRequest } from "@api/__generated__/types";
import { render, screen, userEvent, waitFor, within } from "@test/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestWithTracks, makeRequestsTrack } from "../../../__tests__/factories";
import { RequestDetailBody } from "../RequestDetailBody";

const spies = vi.hoisted(() => ({
  runTrackAction: vi.fn(),
  runBulkAction: vi.fn(),
  progress: vi.fn(),
  kept: vi.fn(),
  canManage: true,
}));

vi.mock("@hooks/api/queries/useActiveReleases", () => ({
  useTrackRelease: () => null,
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: { id: "user-1" }, isAdmin: false }),
}));

vi.mock("@utils/authorization", () => ({
  isOwnerOrAdminFE: () => spies.canManage,
}));

vi.mock("../../../hooks/useTrackActionHandlers", () => ({
  useTrackActionHandlers: () => ({
    runTrackAction: spies.runTrackAction,
    runBulkAction: spies.runBulkAction,
    rejectCount: 0,
    closeReject: vi.fn(),
    confirmReject: vi.fn(),
  }),
}));

vi.mock("../RequestReleaseProgress", () => ({
  RequestReleaseProgress: (props: { tracks: TrackRequest[] }) => {
    spies.progress(props.tracks);
    return null;
  },
}));

vi.mock("../KeptReleaseNotice", () => ({
  KeptReleaseNotice: (props: { request: { id: string } }) => {
    spies.kept(props.request.id);
    return null;
  },
}));

const tracks = [
  makeRequestsTrack({ id: "done", title: "Done Song", status: RequestStatus.enum.complete }),
  makeRequestsTrack({ id: "broken", title: "Broken Song", status: RequestStatus.enum.failed }),
  makeRequestsTrack({ id: "stopped", title: "Stopped Song", status: RequestStatus.enum.cancelled }),
];

function renderBody(overrides: { isResolving?: boolean; hasFailed?: boolean; tracks?: TrackRequest[] } = {}) {
  const shown = overrides.tracks ?? tracks;
  const request = makeRequestWithTracks({ id: "req-1", tracks: shown });
  const onRetryLoad = vi.fn();
  render(
    <RequestDetailBody
      request={request}
      tracks={shown}
      isResolving={overrides.isResolving ?? false}
      hasFailed={overrides.hasFailed ?? false}
      onRetryLoad={onRetryLoad}
    />
  );
  return { onRetryLoad };
}

const bulkBar = () => {
  const bar = document.querySelector('[data-cy="request-bulk-bar"]');
  if (!(bar instanceof HTMLElement)) throw new Error("no bulk bar");
  return within(bar);
};

const titles = () =>
  Array.from(document.querySelectorAll("[data-track-id]")).map((row) => row.getAttribute("data-track-id"));

beforeEach(() => {
  vi.clearAllMocks();
  spies.canManage = true;
});

describe("RequestDetailBody loading states", () => {
  it("shows a loader instead of an empty table while the detail resolves", () => {
    renderBody({ isResolving: true, tracks: [] });

    expect(screen.getByText("Loading tracks...")).toBeInTheDocument();
    expect(screen.queryByText("No tracks")).not.toBeInTheDocument();
  });

  it("offers a retry when the detail could not load, and runs it", async () => {
    const { onRetryLoad } = renderBody({ hasFailed: true, isResolving: true, tracks: [] });

    expect(screen.queryByText("Loading tracks...")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(onRetryLoad).toHaveBeenCalledOnce();
  });

  it("hands the loaded tracks to the release progress and the request to what it keeps on disk", () => {
    renderBody();

    expect(spies.progress).toHaveBeenLastCalledWith(tracks);
    expect(spies.kept).toHaveBeenLastCalledWith("req-1");
  });
});

describe("RequestDetailBody filter", () => {
  it("shows only the tracks of the chip that was pressed, and all again once cleared", async () => {
    renderBody();

    await userEvent.click(screen.getByRole("button", { name: /Failed/ }));
    await waitFor(() => expect(titles()).toEqual(["broken"]));

    await userEvent.click(screen.getByRole("button", { name: "Show all" }));
    await waitFor(() => expect(titles()).toEqual(["done", "broken", "stopped"]));
  });

  it("drops the hidden tracks from the selection when the filter changes", async () => {
    renderBody();

    await userEvent.click(screen.getByRole("checkbox", { name: "Select Done Song" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Broken Song" }));
    expect(bulkBar().getByRole("status")).toHaveTextContent("2selected");

    await userEvent.click(screen.getByRole("button", { name: /Failed/ }));
    expect(bulkBar().getByRole("status")).toHaveTextContent("1selected");

    await userEvent.click(screen.getByRole("button", { name: "Show all" }));

    await waitFor(() => expect(screen.getByRole("checkbox", { name: "Select Done Song" })).not.toBeChecked());
    expect(screen.getByRole("checkbox", { name: "Select Broken Song" })).toBeChecked();
    expect(bulkBar().getByRole("status")).toHaveTextContent("1selected");
  });
});

describe("RequestDetailBody sort", () => {
  it("names the sort in effect and returns to the playlist order from it", async () => {
    renderBody();

    await userEvent.click(screen.getByRole("button", { name: /^Track/ }));
    expect(screen.getByText("Sorted by track, ascending")).toBeInTheDocument();
    expect(titles()).toEqual(["broken", "done", "stopped"]);

    await userEvent.click(screen.getByRole("button", { name: "Back to playlist order" }));

    expect(screen.queryByText(/Sorted by/)).not.toBeInTheDocument();
    expect(titles()).toEqual(["done", "broken", "stopped"]);
  });
});

describe("RequestDetailBody actions", () => {
  it("opens one track's details at a time, and closes them on a second click", async () => {
    renderBody();

    await userEvent.click(screen.getByRole("button", { name: "Show details of Broken Song" }));
    expect(screen.getAllByRole("region", { name: "Requested" })).toHaveLength(1);

    await userEvent.click(screen.getByRole("button", { name: "Hide details of Broken Song" }));
    expect(screen.queryByRole("region", { name: "Requested" })).not.toBeInTheDocument();
  });

  it("sends a row action to the handlers with its track", async () => {
    renderBody();

    await userEvent.click(screen.getByRole("button", { name: "Actions for Stopped Song" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Request again" }));

    expect(spies.runTrackAction).toHaveBeenCalledWith("requeue", tracks[2]);
  });

  it("sends a bulk action with only the selected tracks it applies to, failed and cancelled apart", async () => {
    renderBody();

    await userEvent.click(screen.getByRole("checkbox", { name: "Select every track shown" }));
    await userEvent.click(bulkBar().getByRole("button", { name: /Retry/ }));
    await userEvent.click(bulkBar().getByRole("button", { name: /Request again/ }));

    expect(spies.runBulkAction).toHaveBeenNthCalledWith(1, "retry", [tracks[1]]);
    expect(spies.runBulkAction).toHaveBeenNthCalledWith(2, "requeue", [tracks[2]]);
  });
});
