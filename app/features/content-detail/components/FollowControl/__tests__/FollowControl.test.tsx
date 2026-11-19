import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FakeFollowServer, FakeServerFailure } from "@test/follow-server";

const toasts = vi.hoisted(() => ({
  success: vi.fn<(message: string) => void>(),
  error: vi.fn<(message: string) => void>(),
  info: vi.fn<(message: string) => void>(),
}));

vi.mock("sonner", () => ({ toast: toasts }));

import { TooltipProvider } from "@components/ui/Tooltip";

import { FollowControl } from "../FollowControl";

const FOLLOWING = { followable: true, following: true, autoRequest: false, followedAt: new Date("2026-11-01") };
const IDLE = { followable: true, following: false, autoRequest: false, followedAt: null };

function serverWith(status: unknown): FakeFollowServer {
  return new FakeFollowServer()
    .on("artistFollow.status", () => status)
    .on("artistFollow.preferences", () => ({
      types: { album: true, ep: true, single: false },
      requiresApproval: false,
    }))
    .on("requests.myQuota", () => ({ exempt: true, tracks: { limit: null } }));
}

function renderControl(server: FakeFollowServer) {
  return render(
    <TooltipProvider>
      <FollowControl catalogArtistId="a1" artistName="Ada" />
    </TooltipProvider>,
    { wrapper: server.wrapper() }
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FollowControl", () => {
  it("stays inert while the follow status is loading", async () => {
    const server = new FakeFollowServer().on("artistFollow.status", () => new Promise(() => undefined));
    renderControl(server);

    const pill = screen.getByRole("button");
    expect(pill).toBeDisabled();
    expect(pill).toHaveAttribute("aria-busy", "true");
  });

  it("explains an artist the catalog cannot track instead of offering Follow", async () => {
    const user = userEvent.setup();
    renderControl(serverWith({ followable: false, following: false, autoRequest: false, followedAt: null }));

    const locked = await screen.findByRole("button", { name: "Follow Ada" });
    expect(locked).toHaveAttribute("aria-disabled", "true");
    await user.click(screen.getByText("Follow", { selector: "span.col-start-1:not(.invisible)" }));
    expect(toasts.info).toHaveBeenCalledWith(expect.stringContaining("isn't in the catalog"));
  });

  it("follows at once and opens the options for the new follow", async () => {
    const user = userEvent.setup();
    const server = serverWith(IDLE).on("artistFollow.follow", () => ({
      catalogArtistId: "a1",
      name: "Ada",
      followedAt: new Date(),
      autoRequest: false,
    }));
    renderControl(server);

    await user.click(await screen.findByRole("button", { name: "Follow Ada" }));

    expect(await screen.findByText("Request new releases")).toBeInTheDocument();
    await waitFor(() => expect(server.callsTo("artistFollow.follow")).toHaveLength(1));
    expect(server.callsTo("artistFollow.follow")[0]?.input).toEqual({ catalogArtistId: "a1", autoRequest: false });
  });

  it("names the followed state and the types the automatic requests cover", async () => {
    const user = userEvent.setup();
    renderControl(serverWith(FOLLOWING));

    await user.click(await screen.findByRole("button", { name: "Following Ada. Follow options" }));

    expect(await screen.findByText("Albums and EPs, when they come out.")).toBeInTheDocument();
  });

  it("puts the control back to Follow and says so when the server refuses", async () => {
    const user = userEvent.setup();
    let statusCalls = 0;
    const server = new FakeFollowServer()
      .on("artistFollow.status", () => {
        statusCalls += 1;
        return statusCalls === 1 ? IDLE : new Promise(() => undefined);
      })
      .on("artistFollow.preferences", () => ({
        types: { album: true, ep: true, single: false },
        requiresApproval: false,
      }))
      .on("requests.myQuota", () => ({ exempt: true, tracks: { limit: null } }))
      .on("artistFollow.follow", () => {
        throw new FakeServerFailure("boom");
      });
    renderControl(server);

    await user.click(await screen.findByRole("button", { name: "Follow Ada" }));

    await waitFor(() => expect(toasts.error).toHaveBeenCalledWith("Couldn't follow Ada. Try again."));
    await user.keyboard("{Escape}");
    expect(await screen.findByRole("button", { name: "Follow Ada" })).toBeInTheDocument();
  });
});
