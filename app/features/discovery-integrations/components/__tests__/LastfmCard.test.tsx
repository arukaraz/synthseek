import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enLibrary from "@modules/i18n/messages/en/library.json";
import enSettings from "@modules/i18n/messages/en/settings.json";

interface Enrichment {
  lastfmApiKey: string;
  lastfmApiSecret: string;
  fanartApiKey: string;
}

const api = vi.hoisted(() => ({
  updateLastfm: vi.fn(async () => undefined),
  updateLastfmPending: false,
  updateEnrichment: vi.fn(async () => undefined),
  updateEnrichmentPending: false,
  settings: undefined as { connections: { enrichment: Enrichment } } | undefined,
  isAdmin: true,
}));

vi.mock("@hooks/api/mutations/discovery/useUpdateLastfm", () => ({
  useUpdateLastfm: () => ({ mutateAsync: api.updateLastfm, isPending: api.updateLastfmPending }),
}));

vi.mock("@hooks/api/mutations/settings/useUpdateConnections", () => ({
  useUpdateConnectionsEnrichment: () => ({
    mutateAsync: api.updateEnrichment,
    isPending: api.updateEnrichmentPending,
  }),
}));

vi.mock("@hooks/api/queries/useSettings", () => ({ useSettings: () => ({ data: api.settings }) }));

vi.mock("@modules/providers/AuthProvider", () => ({ useAuthContext: () => ({ isAdmin: api.isAdmin }) }));

import { LastfmCard } from "../LastfmCard";

const lastfm = enLibrary.discoveryIntegrations.lastfm;

function config(overrides: { enabled?: boolean; username?: string | null } = {}) {
  return { enabled: false, username: null, ...overrides };
}

function renderCard(overrides: { enabled?: boolean; username?: string | null } = {}) {
  render(<LastfmCard config={config(overrides)} />);
  return { user: userEvent.setup() };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.updateLastfmPending = false;
  api.updateEnrichmentPending = false;
  api.isAdmin = true;
  api.settings = { connections: { enrichment: { lastfmApiKey: "", lastfmApiSecret: "", fanartApiKey: "fan" } } };
});

describe("what the card shows", () => {
  it("names the integration and offers a switch for it", () => {
    renderCard();

    expect(screen.getByText("Last.fm")).toBeInTheDocument();
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

  it("offers the shared credentials to an administrator", () => {
    renderCard();

    expect(screen.getByText(lastfm.apiKeyLabel)).toBeInTheDocument();
    expect(screen.getByText(lastfm.apiSecretLabel)).toBeInTheDocument();
  });

  it("keeps the shared credentials away from an ordinary listener", () => {
    api.isAdmin = false;

    renderCard();

    expect(screen.queryByText(lastfm.apiKeyLabel)).not.toBeInTheDocument();
  });

  it("tells an ordinary listener to ask the administrator when no key has been set", () => {
    api.isAdmin = false;

    renderCard();

    expect(screen.getByText(lastfm.apiKeyWarning)).toBeInTheDocument();
  });

  it("says nothing to an ordinary listener once the key is in place", () => {
    api.isAdmin = false;
    api.settings = { connections: { enrichment: { lastfmApiKey: "key", lastfmApiSecret: "", fanartApiKey: "" } } };

    renderCard();

    expect(screen.queryByText(lastfm.apiKeyWarning)).not.toBeInTheDocument();
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

  it("saves a changed shared key alongside the rest of the enrichment settings", async () => {
    const { user } = renderCard();
    const boxes = screen.getAllByDisplayValue("");

    await user.type(boxes[0] ?? document.body, "new-key");
    await user.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() =>
      expect(api.updateEnrichment).toHaveBeenCalledWith(
        expect.objectContaining({ lastfmApiKey: "new-key", fanartApiKey: "fan" })
      )
    );
    expect(api.updateLastfm).not.toHaveBeenCalled();
  });

  it("does not offer to save a credential change an ordinary listener cannot make", () => {
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
