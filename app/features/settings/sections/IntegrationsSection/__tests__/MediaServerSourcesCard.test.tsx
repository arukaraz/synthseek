import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import enSettings from "@modules/i18n/messages/en/settings.json";

const state = vi.hoisted(() => {
  const push = vi.fn();
  return { push, router: { push } };
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings/library/sources",
  useRouter: () => state.router,
}));

import { MediaServerSourcesCard } from "../MediaServerSourcesCard";

const copy = enSettings.library.mediaServerSources;

function serverRow(name: string): HTMLElement {
  const title = screen.getByText(name);
  const row = title.parentElement?.parentElement;
  expect(row).toBeDefined();
  return row ?? title;
}

beforeEach(() => {
  state.push.mockReset();
});

describe("MediaServerSourcesCard", () => {
  it("shows each server as available or not configured", () => {
    render(<MediaServerSourcesCard connected={{ plex: true, navidrome: false, jellyfin: true }} />);
    expect(screen.getByRole("heading", { name: copy.title })).toBeInTheDocument();
    expect(serverRow("Plex")).toHaveTextContent(`Plex${copy.available}${copy.open}`);
    expect(serverRow("Navidrome")).toHaveTextContent(`Navidrome${copy.notConfigured}${copy.setUp}`);
    expect(serverRow("Jellyfin")).toHaveTextContent(`Jellyfin${copy.available}${copy.open}`);
  });

  it("opens a connected server in the media settings", async () => {
    render(<MediaServerSourcesCard connected={{ plex: true, navidrome: false, jellyfin: false }} />);
    await userEvent.click(screen.getByRole("button", { name: copy.open }));
    expect(state.push).toHaveBeenCalledWith("/settings/media?server=plex");
  });

  it("sends a server that is not set up to its media settings", async () => {
    render(<MediaServerSourcesCard connected={{ plex: true, navidrome: false, jellyfin: true }} />);
    await userEvent.click(screen.getByRole("button", { name: copy.setUp }));
    expect(state.push).toHaveBeenCalledWith("/settings/media?server=navidrome");
  });
});
