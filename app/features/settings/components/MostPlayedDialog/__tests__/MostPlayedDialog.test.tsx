import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FakeFollowServer } from "@test/follow-server";

const toasts = vi.hoisted(() => ({
  success: vi.fn<(message: string) => void>(),
  error: vi.fn<(message: string) => void>(),
  info: vi.fn<(message: string) => void>(),
  warning: vi.fn<(message: string) => void>(),
}));

vi.mock("sonner", () => ({ toast: toasts }));

vi.mock("@hooks/api/queries/artist-follow/constants", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@hooks/api/queries/artist-follow/constants")>()),
  FOLLOW_RUN_POLL_MS: 20,
}));

import { MostPlayedDialog } from "../MostPlayedDialog";

const CANDIDATES = [
  { name: "Ada", plays: 40, image: null },
  { name: "Bea", plays: 12, image: null },
  { name: "Cy", plays: 1, image: null },
];

const EMPTY_LIST = { items: [], matching: 0, total: 0, withAutoRequest: 0, page: 1, pageSize: 25 };

const RUN = { running: false, total: 2, done: 0, followed: 0, notFound: 0, failed: 0 };

function followed(catalogArtistId: string, name: string) {
  return {
    catalogArtistId,
    name,
    image: null,
    followedAt: new Date("2026-11-18T10:00:00Z"),
    autoRequest: true,
    latest: null,
    checked: false,
    unresolvable: false,
  };
}

const LIST_AFTER = { ...EMPTY_LIST, items: [followed("a1", "Ada"), followed("b1", "Bea")], matching: 2, total: 2 };

function baseServer(): FakeFollowServer {
  return new FakeFollowServer()
    .on("artistFollow.mostPlayed", () => ({ candidates: CANDIDATES }))
    .on("artistFollow.preferences", () => ({
      types: { album: true, ep: true, single: false },
      requiresApproval: false,
    }))
    .on("requests.myQuota", () => ({ exempt: true, tracks: { limit: null } }))
    .on("artistFollow.list", () => EMPTY_LIST);
}

function renderDialog(server: FakeFollowServer, onOpenChange = vi.fn<(open: boolean) => void>()) {
  render(<MostPlayedDialog open onOpenChange={onOpenChange} />, { wrapper: server.wrapper() });
  return onOpenChange;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("MostPlayedDialog", () => {
  it("starts with every artist chosen and counts them", async () => {
    renderDialog(baseServer());

    expect(await screen.findByText("3 of 3 selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Follow 3" })).toBeEnabled();
  });

  it("disables the confirm button and asks for a pick when select all is cleared", async () => {
    const user = userEvent.setup();
    renderDialog(baseServer());

    await user.click(await screen.findByRole("checkbox", { name: "Select all" }));

    expect(screen.getByText("0 of 3 selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Follow 0" })).toBeDisabled();
    expect(screen.getByText("Pick at least one artist.")).toBeInTheDocument();
  });

  it("sends the chosen names with the automatic-request switch and closes once the run finishes", async () => {
    const user = userEvent.setup();
    let polls = 0;
    const server = baseServer()
      .on("artistFollow.followMostPlayed", () => ({ ...RUN, running: true }))
      .on("artistFollow.followMostPlayedStatus", () => {
        polls += 1;
        return polls < 3 ? { ...RUN, running: true, done: 1, followed: 1 } : { ...RUN, done: 2, followed: 2 };
      })
      .on("artistFollow.list", () => (polls < 3 ? EMPTY_LIST : LIST_AFTER));
    const onOpenChange = renderDialog(server);

    await user.click(await screen.findByRole("checkbox", { name: "Select Cy" }));
    await user.click(screen.getByRole("switch", { name: "Request new releases automatically" }));
    await user.click(screen.getByRole("button", { name: "Follow 2" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(server.callsTo("artistFollow.followMostPlayed")[0]?.input).toEqual({
      names: ["Ada", "Bea"],
      autoRequest: true,
    });
    expect(polls).toBeGreaterThanOrEqual(3);
    expect(toasts.success).toHaveBeenCalledWith("Following 2 artists", expect.anything());
  });

  it("offers no Undo when nothing new shows up, and says how many the catalog could not answer for", async () => {
    const user = userEvent.setup();
    const server = baseServer().on("artistFollow.followMostPlayed", () => ({
      ...RUN,
      done: 2,
      followed: 1,
      failed: 1,
    }));
    const onOpenChange = renderDialog(server);

    await user.click(await screen.findByRole("checkbox", { name: "Select Cy" }));
    await user.click(screen.getByRole("button", { name: "Follow 2" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    await waitFor(() => expect(toasts.success.mock.calls).toEqual([["Following 1 artist"]]));
    expect(toasts.warning).toHaveBeenCalledWith("1 couldn't be followed right now. Try again later.");
    expect(toasts.info).not.toHaveBeenCalled();
  });

  it("keeps the dialog open and says so when the run cannot start", async () => {
    const user = userEvent.setup();
    const server = baseServer().on("artistFollow.followMostPlayed", () => {
      throw new Error("boom");
    });
    const onOpenChange = renderDialog(server);

    await user.click(await screen.findByRole("button", { name: "Follow 3" }));

    expect(await screen.findByText("Couldn't follow these artists. Try again.")).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
