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

import { ContentDetailCloseProvider } from "../../../ContentDetailCloseContext";
import { FollowControl } from "../FollowControl";

const closeDetail = vi.fn<() => void>();

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
      <ContentDetailCloseProvider onClose={closeDetail}>
        <FollowControl catalogArtistId="a1" artistName="Ada" />
      </ContentDetailCloseProvider>
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

  it("anchors the options to the button, so they open beside it rather than off screen", async () => {
    const user = userEvent.setup();
    renderControl(serverWith(FOLLOWING));

    await user.click(await screen.findByRole("button", { name: "Following Ada. Follow options" }));
    const body = await screen.findByText("Albums and EPs, when they come out.");
    const wrapper = body.closest<HTMLElement>("[data-radix-popper-content-wrapper]");

    await waitFor(() => expect(wrapper?.style.transform).not.toContain("-200%"));
  });

  it("names the followed state and the types the automatic requests cover", async () => {
    const user = userEvent.setup();
    renderControl(serverWith(FOLLOWING));

    await user.click(await screen.findByRole("button", { name: "Following Ada. Follow options" }));

    expect(await screen.findByText("Albums and EPs, when they come out.")).toBeInTheDocument();
  });

  it("names the options panel after the followed artist", async () => {
    const user = userEvent.setup();
    renderControl(serverWith(FOLLOWING));

    await user.click(await screen.findByRole("button", { name: "Following Ada. Follow options" }));

    expect(await screen.findByRole("dialog", { name: "Following Ada" })).toBeInTheDocument();
  });

  it("closes the artist window when the calendar link is followed", async () => {
    const user = userEvent.setup();
    renderControl(serverWith(FOLLOWING));

    await user.click(await screen.findByRole("button", { name: "Following Ada. Follow options" }));
    const link = await screen.findByRole("link", { name: "See calendar" });
    link.addEventListener("click", (event) => event.preventDefault());
    await user.click(link);

    expect(closeDetail).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("link", { name: "See calendar" })).not.toBeInTheDocument());
  });

  it("leaves the artist window open when the options are dismissed with Done", async () => {
    const user = userEvent.setup();
    renderControl(serverWith(FOLLOWING));

    await user.click(await screen.findByRole("button", { name: "Following Ada. Follow options" }));
    await user.click(await screen.findByRole("button", { name: "Done" }));

    expect(closeDetail).not.toHaveBeenCalled();
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
    await waitFor(() => expect(screen.queryByText("Request new releases")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Follow Ada" })).toBeInTheDocument();
  });
});
