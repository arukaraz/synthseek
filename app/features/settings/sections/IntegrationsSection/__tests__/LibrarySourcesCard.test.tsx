import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";
import type { ConnectionsEnrichment, ConnectionsSpotify } from "../types";

const updateSpotify = createMockMutation();
const updateEnrichment = createMockMutation();

vi.mock("@hooks/api/mutations/settings/useUpdateConnections", () => ({
  useUpdateConnectionsSpotify: () => updateSpotify,
  useUpdateConnectionsEnrichment: () => updateEnrichment,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";

import { LibrarySourcesCard } from "../LibrarySourcesCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const enrichment: ConnectionsEnrichment = {
  lastfmApiKey: "",
  fanartApiKey: "",
  songlinkApiKey: "",
  acoustidApiKey: "",
  musicbrainzEmail: "",
};

const disabledSpotify: ConnectionsSpotify = { enabled: false, clientId: "", publicBaseUrl: "" };

describe("LibrarySourcesCard", () => {
  it("renders the card and spotify subsection titles", () => {
    render(<LibrarySourcesCard spotify={disabledSpotify} enrichment={enrichment} />);
    expect(screen.getByText(enSettings.metadata.librarySources.title)).toBeInTheDocument();
    expect(screen.getByText(enSettings.metadata.librarySources.spotify.title)).toBeInTheDocument();
  });

  it("blocks the save and surfaces a validation message when spotify is enabled without required fields", async () => {
    render(<LibrarySourcesCard spotify={disabledSpotify} enrichment={enrichment} />);

    await userEvent.click(
      screen.getByRole("switch", { name: enSettings.metadata.librarySources.spotify.toggleAriaLabel })
    );
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    expect(
      await screen.findByText(enSettings.metadata.librarySources.spotify.validationMissingFields)
    ).toBeInTheDocument();
    expect(updateSpotify.mutateAsync).not.toHaveBeenCalled();
  });

  it("saves the spotify connection when enabled with the required fields", async () => {
    render(
      <LibrarySourcesCard
        spotify={{ enabled: false, clientId: "client-123", publicBaseUrl: "https://app.example.com" }}
        enrichment={enrichment}
      />
    );

    await userEvent.click(
      screen.getByRole("switch", { name: enSettings.metadata.librarySources.spotify.toggleAriaLabel })
    );
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(updateSpotify.mutateAsync).toHaveBeenCalledWith({
        enabled: true,
        clientId: "client-123",
        publicBaseUrl: "https://app.example.com",
      });
    });
  });

  it("copies the derived redirect uri and toasts success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(
      <LibrarySourcesCard
        spotify={{ enabled: true, clientId: "client-123", publicBaseUrl: "https://app.example.com" }}
        enrichment={enrichment}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: enSettings.metadata.librarySources.spotify.copyAriaLabel })
    );

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("https://app.example.com/api/auth/spotify/callback");
      expect(toast.success).toHaveBeenCalledWith(enSettings.metadata.librarySources.spotify.copied);
    });
  });

  it("toasts an error when copying the redirect uri fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.assign(navigator, { clipboard: { writeText } });

    render(
      <LibrarySourcesCard
        spotify={{ enabled: true, clientId: "client-123", publicBaseUrl: "https://app.example.com" }}
        enrichment={enrichment}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: enSettings.metadata.librarySources.spotify.copyAriaLabel })
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(enSettings.metadata.librarySources.spotify.copyFailed)
    );
  });

  it("saves only the enrichment songlink key when it is the sole edit", async () => {
    render(<LibrarySourcesCard spotify={disabledSpotify} enrichment={enrichment} />);

    const songlinkInput = document.querySelector<HTMLInputElement>('input[type="password"]');
    if (!songlinkInput) throw new Error("songlink secret input not found");
    await userEvent.type(songlinkInput, "song-key");
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(updateEnrichment.mutateAsync).toHaveBeenCalledWith({ ...enrichment, songlinkApiKey: "song-key" });
      expect(updateSpotify.mutateAsync).not.toHaveBeenCalled();
    });
  });

  it("reverts edits when cancel is pressed", async () => {
    render(<LibrarySourcesCard spotify={disabledSpotify} enrichment={enrichment} />);

    const songlinkInput = document.querySelector<HTMLInputElement>('input[type="password"]');
    if (!songlinkInput) throw new Error("songlink secret input not found");
    await userEvent.type(songlinkInput, "song-key");
    expect(screen.getByRole("button", { name: enSettings.shell.saveBar.save })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.cancel }));

    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).not.toBeInTheDocument();
  });
});
