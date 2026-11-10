import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enLibrary from "@modules/i18n/messages/en/library.json";
import enSettings from "@modules/i18n/messages/en/settings.json";

const api = vi.hoisted(() => ({
  updateLastfm: vi.fn(async () => undefined),
  updateLastfmPending: false,
  isAdmin: true,
}));

vi.mock("@hooks/api/mutations/discovery/useUpdateLastfm", () => ({
  useUpdateLastfm: () => ({ mutateAsync: api.updateLastfm, isPending: api.updateLastfmPending }),
}));

vi.mock("@modules/providers/AuthProvider", () => ({ useAuthContext: () => ({ isAdmin: api.isAdmin }) }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings/connections/services",
}));

import { LastfmCard } from "../LastfmCard";

const lastfm = enLibrary.discoveryIntegrations.lastfm;
const metadataPage = enSettings.shell.pages.metadata.title;

function config(overrides: { enabled?: boolean; username?: string | null } = {}) {
  return { enabled: false, username: null, ...overrides };
}

function renderCard(overrides: { enabled?: boolean; username?: string | null } = {}, apiKeyConfigured = true) {
  render(<LastfmCard config={config(overrides)} apiKeyConfigured={apiKeyConfigured} />);
  return { user: userEvent.setup() };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.updateLastfmPending = false;
  api.isAdmin = true;
});

describe("what the card shows", () => {
  it("titles its panel as the discovery feeds and offers a switch for them", () => {
    renderCard();

    expect(screen.getByText(enLibrary.discoveryIntegrations.feedsTitle)).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: lastfm.enableAria })).toBeInTheDocument();
  });

  it("shows the switch in the state the server reported", () => {
    renderCard({ enabled: true });

    expect(screen.getByRole("switch", { name: lastfm.enableAria })).toBeChecked();
  });

  it("shows the username the server reported", () => {
    renderCard({ enabled: true, username: "arukaraz" });

    expect(screen.getByDisplayValue("arukaraz")).toBeInTheDocument();
  });

  it("points an administrator at the server credentials under Metadata", () => {
    renderCard();

    expect(screen.getByRole("link", { name: metadataPage })).toHaveAttribute(
      "href",
      "/settings/metadata#connections.enrichment.lastfmApiKey"
    );
  });

  it("keeps that pointer away from an ordinary listener", () => {
    api.isAdmin = false;

    renderCard();

    expect(screen.queryByRole("link", { name: metadataPage })).not.toBeInTheDocument();
  });

  it("tells an ordinary listener to ask the administrator when the server has no key", () => {
    api.isAdmin = false;

    renderCard({}, false);

    expect(screen.getByText(lastfm.apiKeyWarning)).toBeInTheDocument();
  });

  it("says nothing to an ordinary listener once the server reports the key is in place", () => {
    api.isAdmin = false;

    renderCard({}, true);

    expect(screen.queryByText(lastfm.apiKeyWarning)).not.toBeInTheDocument();
  });

  it("does not warn an administrator, who is pointed at the key instead", () => {
    renderCard({}, false);

    expect(screen.queryByText(lastfm.apiKeyWarning)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: metadataPage })).toBeInTheDocument();
  });
});

describe("saving the card", () => {
  it("offers nothing to save until something has changed", () => {
    renderCard();

    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).not.toBeInTheDocument();
  });

  it("saves the switch the listener flipped", async () => {
    const { user } = renderCard();

    await user.click(screen.getByRole("switch", { name: lastfm.enableAria }));
    await user.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    expect(api.updateLastfm).toHaveBeenCalledWith({ enabled: true, username: null });
  });

  it("saves the username the listener typed", async () => {
    const { user } = renderCard({ enabled: true });

    await user.type(screen.getByPlaceholderText(lastfm.usernamePlaceholder), "arukaraz");
    await user.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    expect(api.updateLastfm).toHaveBeenCalledWith({ enabled: true, username: "arukaraz" });
  });

  it("clears a username the listener emptied rather than saving a blank one", async () => {
    const { user } = renderCard({ enabled: true, username: "arukaraz" });

    await user.clear(screen.getByDisplayValue("arukaraz"));
    await user.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    expect(api.updateLastfm).toHaveBeenCalledWith({ enabled: true, username: null });
  });

  it("offers an ordinary listener nothing to save until they change their own feeds", () => {
    api.isAdmin = false;

    renderCard();

    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).not.toBeInTheDocument();
  });

  it("says it is saving rather than letting the button be pressed twice", async () => {
    api.updateLastfmPending = true;

    renderCard();

    expect(screen.getByRole("button", { name: enSettings.shell.saveBar.saving })).toBeDisabled();
  });

  it("puts everything back the way the server had it when the listener cancels", async () => {
    const { user } = renderCard({ enabled: true, username: "arukaraz" });

    await user.clear(screen.getByDisplayValue("arukaraz"));
    await user.type(screen.getByPlaceholderText(lastfm.usernamePlaceholder), "someone-else");
    await user.click(screen.getByRole("button", { name: enSettings.shell.saveBar.cancel }));

    expect(screen.getByDisplayValue("arukaraz")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).not.toBeInTheDocument();
  });
});
