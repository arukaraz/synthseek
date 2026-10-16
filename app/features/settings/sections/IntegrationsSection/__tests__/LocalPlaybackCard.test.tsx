import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import enSettings from "@modules/i18n/messages/en/settings.json";

const state = vi.hoisted(() => {
  const push = vi.fn();
  return { push, router: { push } };
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings/media",
  useRouter: () => state.router,
}));

import { LocalPlaybackCard } from "../LocalPlaybackCard";

beforeEach(() => {
  state.push.mockReset();
});

describe("LocalPlaybackCard", () => {
  it("explains there is nothing to set up for local playback", () => {
    render(<LocalPlaybackCard />);
    expect(screen.getByRole("heading", { name: enSettings.mediaServers.order.local })).toBeInTheDocument();
    expect(screen.getByText(enSettings.mediaServers.local.nothingToSet)).toBeInTheDocument();
  });

  it("opens the library paths", async () => {
    render(<LocalPlaybackCard />);
    await userEvent.click(screen.getByRole("button", { name: enSettings.mediaServers.local.openLibrary }));
    expect(state.push).toHaveBeenCalledWith("/settings/library/paths");
  });
});
