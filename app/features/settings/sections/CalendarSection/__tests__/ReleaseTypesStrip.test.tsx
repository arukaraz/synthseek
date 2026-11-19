import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FakeFollowServer } from "@test/follow-server";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

import { ReleaseTypesStrip } from "../components/ReleaseTypesStrip";

function serverWith(types: { album: boolean; ep: boolean; single: boolean }): FakeFollowServer {
  return new FakeFollowServer()
    .on("artistFollow.preferences", () => ({ types, requiresApproval: false }))
    .on("artistFollow.setPreferences", (input) => ({ types: input, requiresApproval: false }));
}

describe("ReleaseTypesStrip", () => {
  it("saves as soon as a type is toggled", async () => {
    const user = userEvent.setup();
    const server = serverWith({ album: true, ep: true, single: false });
    render(<ReleaseTypesStrip />, { wrapper: server.wrapper() });

    await user.click(await screen.findByRole("button", { name: "Singles" }));

    await waitFor(() => expect(server.callsTo("artistFollow.setPreferences")).toHaveLength(1));
    expect(server.callsTo("artistFollow.setPreferences")[0]?.input).toEqual({
      album: true,
      ep: true,
      single: true,
    });
  });

  it("refuses to switch off the last type and says why", async () => {
    const user = userEvent.setup();
    const server = serverWith({ album: true, ep: false, single: false });
    render(<ReleaseTypesStrip />, { wrapper: server.wrapper() });

    const albums = await screen.findByRole("button", { name: "Albums" });
    await user.click(albums);

    expect(albums).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Keep at least one type.")).toBeInTheDocument();
    expect(server.callsTo("artistFollow.setPreferences")).toHaveLength(0);
  });
});
