import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import i18n from "@modules/i18n";
import enPlayer from "@modules/i18n/messages/en/player.json";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createPlayerActions, createPlayerView } from "@test/factories";

const player = vi.hoisted(() => ({ view: null as unknown, actions: null as unknown }));

vi.mock("@hooks/ui/player", () => ({
  usePlayerSettings: () => ({ view: player.view, actions: player.actions }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings/playback",
}));

import { PlaybackSection } from "../PlaybackSection";

const copy = enSettings.playback;

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
  i18n.addResourceBundle("en", "player", enPlayer, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderPage(overrides: Parameters<typeof createPlayerView>[0] = {}) {
  player.view = createPlayerView(overrides);
  player.actions = createPlayerActions();
  render(<PlaybackSection />);
}

function card(title: string): ReturnType<typeof within> {
  const section = screen.getByText(title).closest("section");
  if (section === null) throw new Error(`no card titled ${title}`);
  return within(section);
}

describe("PlaybackSection", () => {
  it("heads the page and splits it into the account card and the browser card", () => {
    renderPage();

    expect(screen.getByRole("heading", { level: 1, name: enSettings.shell.pages.playback.title })).toBeInTheDocument();
    expect(screen.getByText(copy.account.title).closest("section")).toHaveAttribute(
      "data-anchor-target",
      "playback.account"
    );
    expect(screen.getByText(copy.browser.title).closest("section")).toHaveAttribute(
      "data-anchor-target",
      "playback.browser"
    );
  });

  it("keeps the account-wide controls in the account card", () => {
    renderPage({ autoplay: true });

    const account = card(copy.account.title);
    expect(account.getByRole("switch", { name: enPlayer.settings.loudness.enabled })).toBeInTheDocument();
    expect(account.getByRole("switch", { name: enPlayer.settings.autoplay.enabled })).toBeChecked();
    const household = account.getByRole("link");
    expect(enSettings.playback.account.household).toContain(`<household>${household.textContent}</household>`);
    expect(household).toHaveAttribute("href", "/settings/account#household");
  });

  it("keeps the browser-only controls in the browser card", () => {
    renderPage();

    const browser = card(copy.browser.title);
    expect(browser.getByRole("region", { name: enPlayer.equalizer.caption })).toBeInTheDocument();
    expect(browser.getByRole("region", { name: enPlayer.settings.compressor.caption })).toBeInTheDocument();
    expect(browser.getByRole("region", { name: enPlayer.settings.transition.caption })).toBeInTheDocument();
    expect(browser.getByRole("region", { name: enPlayer.settings.conversion.caption })).toBeInTheDocument();
    expect(browser.queryByRole("switch", { name: enPlayer.settings.loudness.enabled })).not.toBeInTheDocument();
  });
});
