import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";
import { SECRET_SENTINEL } from "../../../components/constants";
import type { ConnectionsEnrichment } from "../types";

const update = createMockMutation();

const reveal = vi.hoisted(() => vi.fn());

vi.mock("@hooks/api/mutations/settings/useUpdateConnections", () => ({
  useUpdateConnectionsEnrichment: () => update,
}));

vi.mock("@hooks/api/mutations/settings/useRevealSecret", () => ({ useRevealSettingsSecret: () => reveal }));

import { EnrichmentCard } from "../EnrichmentCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const initial: ConnectionsEnrichment = {
  lastfmApiKey: "",
  lastfmApiSecret: "",
  fanartApiKey: "",
  songlinkApiKey: "",
  acoustidApiKey: "",
  musicbrainzEmail: "",
  discogsToken: "",
  bandsintownAppId: "",
};

function secretInputFor(label: string): HTMLInputElement {
  const input = screen.getByText(label).closest("[data-anchor-target]")?.querySelector("input");
  if (!input) throw new Error(`no secret input under the field labelled ${label}`);
  return input;
}

describe("EnrichmentCard", () => {
  it("asks for each saved key by its own field when its eye is clicked", async () => {
    reveal.mockResolvedValue("real");
    render(
      <EnrichmentCard
        initial={{
          ...initial,
          fanartApiKey: SECRET_SENTINEL,
          acoustidApiKey: SECRET_SENTINEL,
          songlinkApiKey: SECRET_SENTINEL,
          discogsToken: SECRET_SENTINEL,
          bandsintownAppId: SECRET_SENTINEL,
        }}
      />
    );

    for (const eye of screen.getAllByLabelText(enSettings.shell.secretInput.reveal)) await userEvent.click(eye);

    expect(reveal.mock.calls.map(([ref]) => ref)).toEqual([
      { section: "connections.enrichment", field: "fanartApiKey" },
      { section: "connections.enrichment", field: "acoustidApiKey" },
      { section: "connections.enrichment", field: "songlinkApiKey" },
      { section: "connections.enrichment", field: "discogsToken" },
      { section: "connections.enrichment", field: "bandsintownAppId" },
    ]);
  });

  it("renders the enrichment card title", () => {
    render(<EnrichmentCard initial={initial} />);
    expect(screen.getByText(enSettings.metadata.enrichment.title)).toBeInTheDocument();
  });

  it("keeps the save bar hidden while the form is pristine", () => {
    render(<EnrichmentCard initial={initial} />);
    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).not.toBeInTheDocument();
  });

  it("saves the edited musicbrainz email", async () => {
    render(<EnrichmentCard initial={initial} />);

    await userEvent.type(
      screen.getByPlaceholderText(enSettings.metadata.enrichment.musicbrainzEmail.placeholder),
      "me@example.com"
    );
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({ ...initial, musicbrainzEmail: "me@example.com" });
    });
  });

  it("carries the Songlink key and saves it with the rest of the enrichment settings", async () => {
    render(<EnrichmentCard initial={initial} />);

    await userEvent.type(secretInputFor(enSettings.metadata.enrichment.songlinkKey.label), "song-key");
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({ ...initial, songlinkApiKey: "song-key" });
    });
  });

  it("carries the Discogs token and saves it with the rest of the enrichment settings", async () => {
    render(<EnrichmentCard initial={initial} />);

    const discogsInput = secretInputFor(enSettings.metadata.enrichment.discogsToken.label);
    expect(discogsInput).toHaveAttribute("type", "password");
    await userEvent.type(discogsInput, "dg-token");
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({ ...initial, discogsToken: "dg-token" });
    });
  });

  it("reverts the draft when cancel is pressed", async () => {
    render(<EnrichmentCard initial={initial} />);

    await userEvent.type(
      screen.getByPlaceholderText(enSettings.metadata.enrichment.musicbrainzEmail.placeholder),
      "x@y.z"
    );
    expect(screen.getByRole("button", { name: enSettings.shell.saveBar.save })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.cancel }));

    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).not.toBeInTheDocument();
  });
});
