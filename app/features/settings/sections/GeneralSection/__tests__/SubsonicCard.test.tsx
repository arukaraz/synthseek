import { cleanup, render, screen, within } from "@testing-library/react";
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

let credentials: SubsonicCredentialSummary[] = [];
const revokeMutate = vi.fn();
const confirmMock = vi.fn();

vi.mock("@hooks/api/queries/useSubsonicCredentials", () => ({
  useSubsonicCredentials: () => createMockQuery(credentials),
}));

vi.mock("@utils/confirm", () => ({
  confirm: (...args: unknown[]) => confirmMock(...args),
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
  useRevokeSubsonicCredential: () => ({ mutate: revokeMutate, isPending: false }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { SETTINGS_SEARCH_ENTRIES } from "../../../components/SettingsSearch";
import { SubsonicCard } from "../SubsonicCard";
import type { SubsonicCredentialSummary } from "../types";

function searchAnchor(labelKey: string): string | undefined {
  return SETTINGS_SEARCH_ENTRIES.find((entry) => entry.labelKey === labelKey)?.anchor;
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  credentials = [];
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

describe("SubsonicCard credentials", () => {
  const used: SubsonicCredentialSummary = {
    id: "cred-1",
    name: "final-verification",
    prefix: "sub_a1b2",
    last_client: "Symfonium",
    last_used_at: new Date(),
    created_at: new Date("2026-08-26T12:00:00Z"),
  };
  const unused: SubsonicCredentialSummary = {
    ...used,
    id: "cred-2",
    name: "laptop",
    last_client: null,
    last_used_at: null,
  };

  it("lists each credential as a table row with the app that last used it", () => {
    credentials = [used, unused];
    render(<SubsonicCard />);

    const table = screen.getByRole("table");
    expect(within(table).getByRole("columnheader", { name: enSettings.credentialTable.columns.app })).toBeVisible();
    const usedRow = within(table).getByText("final-verification").closest("tr");
    const unusedRow = within(table).getByText("laptop").closest("tr");
    expect(usedRow).not.toBeNull();
    expect(unusedRow).not.toBeNull();
    if (usedRow === null || unusedRow === null) return;
    expect(within(usedRow).getByText("Symfonium")).toBeInTheDocument();
    expect(within(unusedRow).getByText(enSettings.credentialTable.neverUsed)).toBeInTheDocument();
  });

  it("revokes a credential only once the confirmation is accepted", async () => {
    credentials = [used];
    confirmMock.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    render(<SubsonicCard />);

    const button = screen.getByRole("button", { name: /Revoke final-verification/i });
    await userEvent.click(button);
    expect(confirmMock).toHaveBeenCalledWith(expect.objectContaining({ message: enSettings.subsonic.revoke.message }));
    expect(revokeMutate).not.toHaveBeenCalled();

    await userEvent.click(button);
    expect(revokeMutate).toHaveBeenCalledWith({ id: "cred-1" });
  });
});
