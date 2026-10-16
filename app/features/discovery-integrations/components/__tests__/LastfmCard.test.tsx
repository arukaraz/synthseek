import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enLibrary from "@modules/i18n/messages/en/library.json";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { SECRET_SENTINEL } from "@features/settings/components/constants";

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
  reveal: vi.fn(async () => "real"),
  settings: undefined as { connections: { enrichment: Enrichment } } | undefined,
  settingsOptions: vi.fn(),
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

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: (options?: { enabled?: boolean }) => {
    api.settingsOptions(options);
    return { data: options?.enabled === false ? undefined : api.settings };
  },
}));

vi.mock("@modules/providers/AuthProvider", () => ({ useAuthContext: () => ({ isAdmin: api.isAdmin }) }));

vi.mock("@hooks/api/mutations/settings/useRevealSecret", () => ({ useRevealSettingsSecret: () => api.reveal }));

import { LastfmCard } from "../LastfmCard";

const lastfm = enLibrary.discoveryIntegrations.lastfm;

function config(overrides: { enabled?: boolean; username?: string | null } = {}) {
  return { enabled: false, username: null, ...overrides };
}

function renderCard(overrides: { enabled?: boolean; username?: string | null } = {}, apiKeyConfigured = true) {
  render(<LastfmCard config={config(overrides)} apiKeyConfigured={apiKeyConfigured} />);
  return { user: userEvent.setup() };
}

function inputOf(label: string): HTMLElement {
  const input = screen.getByText(label).parentElement?.querySelector("input");
  if (!input) throw new Error(`no input under ${label}`);
  return input;
}

beforeEach(() => {
  vi.clearAllMocks();
  api.updateLastfmPending = false;
  api.updateEnrichmentPending = false;
  api.isAdmin = true;
  api.settings = { connections: { enrichment: { lastfmApiKey: "", lastfmApiSecret: "", fanartApiKey: "fan" } } };
});

describe("what the card shows", () => {
  it("asks for the saved key and secret by their own fields when their eyes are clicked", async () => {
    api.settings = {
      connections: {
        enrichment: { lastfmApiKey: SECRET_SENTINEL, lastfmApiSecret: SECRET_SENTINEL, fanartApiKey: "" },
      },
    };
    const { user } = renderCard();

    for (const eye of screen.getAllByLabelText(enSettings.shell.secretInput.reveal)) await user.click(eye);

    expect(api.reveal.mock.calls.map((call) => call.at(0))).toEqual([
      { section: "connections.enrichment", field: "lastfmApiKey" },
      { section: "connections.enrichment", field: "lastfmApiSecret" },
    ]);
  });

  it("titles its panel as the discovery feeds and offers a switch for them", () => {
    renderCard();

    expect(screen.getByText(enLibrary.discoveryIntegrations.feedsTitle)).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: lastfm.enableAria })).toBeInTheDocument();
  });

  it("reads the server settings only for an administrator", () => {
    api.isAdmin = false;
    renderCard();
    expect(api.settingsOptions).toHaveBeenLastCalledWith({ enabled: false });
    cleanup();

    api.isAdmin = true;
    renderCard();
    expect(api.settingsOptions).toHaveBeenLastCalledWith({ enabled: true });
  });

  it("shows the switch in the state the server reported", () => {
    renderCard({ enabled: true });

    expect(screen.getByRole("switch", { name: lastfm.enableAria })).toBeChecked();
  });

  it("shows the username the server reported", () => {
    renderCard({ enabled: true, username: "arukaraz" });

    expect(screen.getByDisplayValue("arukaraz")).toBeInTheDocument();
  });

  it("offers an administrator the server credentials in a panel of their own", () => {
    renderCard();

    expect(screen.getByText(lastfm.credentialsTitle)).toBeInTheDocument();
    expect(screen.getByText(lastfm.adminBadge)).toBeInTheDocument();
    expect(screen.getByText(lastfm.apiKeyLabel)).toBeInTheDocument();
    expect(screen.getByText(lastfm.apiSecretLabel)).toBeInTheDocument();
  });

  it("keeps the server credentials panel away from an ordinary listener", () => {
    api.isAdmin = false;

    renderCard();

    expect(screen.queryByText(lastfm.credentialsTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(lastfm.apiKeyLabel)).not.toBeInTheDocument();
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

  it("does not warn an administrator, who can set the key right below", () => {
    renderCard({}, false);

    expect(screen.queryByText(lastfm.apiKeyWarning)).not.toBeInTheDocument();
    expect(screen.getByText(lastfm.credentialsTitle)).toBeInTheDocument();
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

    await user.type(inputOf(lastfm.apiKeyLabel), "new-key");
    await user.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() =>
      expect(api.updateEnrichment).toHaveBeenCalledWith({
        lastfmApiKey: "new-key",
        lastfmApiSecret: "",
        fanartApiKey: "fan",
      })
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
