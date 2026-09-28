import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";
import type { ConnectionsSpotify } from "../types";

const updateSpotify = createMockMutation();

vi.mock("@hooks/api/mutations/settings/useUpdateConnections", () => ({
  useUpdateConnectionsSpotify: () => updateSpotify,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";

import { SpotifySourceCard } from "../SpotifySourceCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const disabledSpotify: ConnectionsSpotify = { enabled: false, clientId: "", publicBaseUrl: "" };
const spotifySettings = enSettings.metadata.librarySources.spotify;

describe("SpotifySourceCard", () => {
  it("is a card of its own, titled by the source, with the switch in its header", () => {
    render(<SpotifySourceCard spotify={disabledSpotify} />);

    expect(screen.getByText(spotifySettings.title)).toBeInTheDocument();
    expect(screen.getByText(spotifySettings.description)).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: spotifySettings.toggleAriaLabel })).toBeInTheDocument();
  });

  it("no longer carries the Songlink key, which lives with the metadata settings", () => {
    render(<SpotifySourceCard spotify={disabledSpotify} />);

    expect(screen.queryByText(enSettings.metadata.enrichment.songlinkKey.label)).not.toBeInTheDocument();
  });

  it("blocks the save and surfaces a validation message when spotify is enabled without required fields", async () => {
    render(<SpotifySourceCard spotify={disabledSpotify} />);

    await userEvent.click(screen.getByRole("switch", { name: spotifySettings.toggleAriaLabel }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    expect(await screen.findByText(spotifySettings.validationMissingFields)).toBeInTheDocument();
    expect(updateSpotify.mutateAsync).not.toHaveBeenCalled();
  });

  it("saves the spotify connection when enabled with the required fields", async () => {
    render(
      <SpotifySourceCard
        spotify={{ enabled: false, clientId: "client-123", publicBaseUrl: "https://app.example.com" }}
      />
    );

    await userEvent.click(screen.getByRole("switch", { name: spotifySettings.toggleAriaLabel }));
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
      <SpotifySourceCard
        spotify={{ enabled: true, clientId: "client-123", publicBaseUrl: "https://app.example.com" }}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: spotifySettings.copyAriaLabel }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("https://app.example.com/api/auth/spotify/callback");
      expect(toast.success).toHaveBeenCalledWith(spotifySettings.copied);
    });
  });

  it("toasts an error when copying the redirect uri fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.assign(navigator, { clipboard: { writeText } });

    render(
      <SpotifySourceCard
        spotify={{ enabled: true, clientId: "client-123", publicBaseUrl: "https://app.example.com" }}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: spotifySettings.copyAriaLabel }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(spotifySettings.copyFailed));
  });
});
