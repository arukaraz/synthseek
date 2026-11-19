import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FakeFollowServer } from "@test/follow-server";

const toasts = vi.hoisted(() => ({
  success: vi.fn<(message: string, options?: { action: { onClick: () => void } }) => void>(),
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

const RUN = {
  running: false,
  total: 2,
  done: 0,
  followed: 0,
  notFound: 0,
  failed: 0,
  overLimit: 0,
  added: [] as Array<{ catalogArtistId: string; name: string }>,
};

const ADDED = [
  { catalogArtistId: "a1", name: "Ada" },
  { catalogArtistId: "b1", name: "Bea" },
];

function baseServer(): FakeFollowServer {
  return new FakeFollowServer()
    .on("artistFollow.mostPlayed", () => ({ candidates: CANDIDATES }))
    .on("artistFollow.preferences", () => ({
      types: { album: true, ep: true, single: false },
      requiresApproval: false,
    }))
    .on("requests.myQuota", () => ({ exempt: true, tracks: { limit: null } }))
    .on("artistFollow.followMostPlayedStatus", () => ({ ...RUN, total: 0 }))
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
    let started = false;
    const server = baseServer()
      .on("artistFollow.followMostPlayed", () => {
        started = true;
        return { ...RUN, running: true };
      })
      .on("artistFollow.followMostPlayedStatus", () => {
        if (!started) return { ...RUN, total: 0 };
        polls += 1;
        return polls < 3
          ? { ...RUN, running: true, done: 1, followed: 1 }
          : { ...RUN, done: 2, followed: 2, added: ADDED };
      })
      .on("artistFollow.unfollow", () => ({ unfollowed: [] }));
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

    toasts.success.mock.calls[0]?.[1]?.action.onClick();
    await waitFor(() => expect(server.callsTo("artistFollow.unfollow")).toHaveLength(1));
    expect(server.callsTo("artistFollow.unfollow")[0]?.input).toEqual({ catalogArtistIds: ["a1", "b1"] });
  });

  it("picks up a run that was already under way when the page opens, and reports it when it ends", async () => {
    let polls = 0;
    const server = baseServer().on("artistFollow.followMostPlayedStatus", () => {
      polls += 1;
      return polls < 3
        ? { ...RUN, running: true, done: 1, followed: 1 }
        : { ...RUN, done: 2, followed: 2, added: ADDED };
    });
    render(<MostPlayedDialog open={false} onOpenChange={vi.fn()} />, { wrapper: server.wrapper() });

    await waitFor(() => expect(toasts.success).toHaveBeenCalledWith("Following 2 artists", expect.anything()));
    expect(server.callsTo("artistFollow.followMostPlayed")).toHaveLength(0);
  });

  it("says nothing about a run that had already ended when the page opens", async () => {
    const server = baseServer().on("artistFollow.followMostPlayedStatus", () => ({
      ...RUN,
      done: 2,
      followed: 2,
      added: ADDED,
    }));
    render(<MostPlayedDialog open={false} onOpenChange={vi.fn()} />, { wrapper: server.wrapper() });

    await waitFor(() => expect(server.callsTo("artistFollow.followMostPlayedStatus").length).toBeGreaterThan(0));
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(toasts.success).not.toHaveBeenCalled();
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

  it("says how many were left unfollowed when the run stopped at the limit of followed artists", async () => {
    const user = userEvent.setup();
    const server = baseServer().on("artistFollow.followMostPlayed", () => ({
      ...RUN,
      done: 2,
      followed: 1,
      overLimit: 1,
    }));
    const onOpenChange = renderDialog(server);

    await user.click(await screen.findByRole("checkbox", { name: "Select Cy" }));
    await user.click(screen.getByRole("button", { name: "Follow 2" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    await waitFor(() =>
      expect(toasts.warning.mock.calls).toEqual([["1 wasn't followed. You follow the most artists an account can."]])
    );
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
