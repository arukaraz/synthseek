import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery } from "@test/mocks/trpc.mock";

const mutate = vi.fn();

vi.mock("@hooks/api/mutations/settings/useUpdateConnectApps", () => ({
  useUpdateConnectApps: () => ({ mutate, isPending: false }),
}));

vi.mock("@hooks/api/queries/usePublicConfig", () => ({
  usePublicConfig: () => createMockQuery({ publicBaseUrl: "https://example.test" }),
}));

vi.mock("@hooks/api/queries/useSubsonicCredentials", () => ({
  useSubsonicCredentials: () => createMockQuery([]),
}));

vi.mock("@hooks/api/queries/useSubsonicStatus", () => ({
  useSubsonicStatus: () =>
    createMockQuery({
      enabled: true,
      transcodingEnabled: true,
      basePath: "/api/v1/subsonic",
      streamableTracks: 10,
      unplayableTracks: 0,
      credentialsNeedingRotation: 0,
    }),
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: true, currentUser: { id: "u1", username: "arukaraz", role: "admin" } }),
}));

vi.mock("@hooks/api/mutations/subsonic/useCreateSubsonicCredential", () => ({
  useCreateSubsonicCredential: () => ({ mutate: vi.fn(), isPending: false, reset: vi.fn() }),
}));

vi.mock("@hooks/api/mutations/subsonic/useRevokeSubsonicCredential", () => ({
  useRevokeSubsonicCredential: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { SETTINGS_SEARCH_ENTRIES } from "../../../components/SettingsSearch";
import { SubsonicCard } from "../SubsonicCard";

function searchAnchor(labelKey: string): string | undefined {
  return SETTINGS_SEARCH_ENTRIES.find((entry) => entry.labelKey === labelKey)?.anchor;
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("SubsonicCard anchors", () => {
  it("lets the settings search scroll to the card and to its conversion row", () => {
    render(<SubsonicCard />);

    const cardAnchor = searchAnchor("subsonic.title");
    const transcodingAnchor = searchAnchor("subsonic.transcoding.label");
    expect(cardAnchor).toBeDefined();
    expect(transcodingAnchor).toBeDefined();

    const title = screen.getByRole("heading", { level: 2, name: enSettings.subsonic.title });
    expect(title.closest("section")).toHaveAttribute("data-anchor-target", cardAnchor);
    expect(screen.getByText(enSettings.subsonic.transcoding.label).closest("[data-anchor-target]")).toHaveAttribute(
      "data-anchor-target",
      transcodingAnchor
    );
  });
});

describe("SubsonicCard toggles", () => {
  it("offers a conversion toggle to an administrator once the surface is on", () => {
    render(<SubsonicCard />);

    expect(screen.getByLabelText(enSettings.subsonic.transcoding.ariaLabel)).toBeInTheDocument();
  });

  it("sends both fields when converting is switched, since the mutation replaces the whole section", async () => {
    render(<SubsonicCard />);

    await userEvent.click(screen.getByLabelText(enSettings.subsonic.transcoding.ariaLabel));

    expect(mutate).toHaveBeenCalledWith({ subsonicEnabled: true, subsonicTranscodingEnabled: false });
  });

  it("sends both fields when the surface itself is switched, so converting is not silently reset", async () => {
    render(<SubsonicCard />);

    await userEvent.click(screen.getByLabelText(enSettings.subsonic.enable.ariaLabel));

    expect(mutate).toHaveBeenCalledWith({ subsonicEnabled: false, subsonicTranscodingEnabled: true });
  });
});
