import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";
import type { ConnectionsEnrichment } from "../types";

const update = createMockMutation();

vi.mock("@hooks/api/mutations/settings/useUpdateConnections", () => ({
  useUpdateConnectionsEnrichment: () => update,
}));

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
  fanartApiKey: "",
  songlinkApiKey: "",
  acoustidApiKey: "",
  musicbrainzEmail: "",
};

describe("EnrichmentCard", () => {
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
