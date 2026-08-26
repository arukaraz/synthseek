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
      tracksWithoutPath: 0,
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

import { SubsonicSubsection } from "../SubsonicSubsection";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("SubsonicSubsection toggles", () => {
  it("offers a conversion toggle to an administrator once the surface is on", () => {
    render(<SubsonicSubsection />);

    expect(screen.getByLabelText(enSettings.subsonic.transcoding.ariaLabel)).toBeInTheDocument();
  });

  it("sends both fields when converting is switched, since the mutation replaces the whole section", async () => {
    render(<SubsonicSubsection />);

    await userEvent.click(screen.getByLabelText(enSettings.subsonic.transcoding.ariaLabel));

    expect(mutate).toHaveBeenCalledWith({ subsonicEnabled: true, subsonicTranscodingEnabled: false });
  });

  it("sends both fields when the surface itself is switched, so converting is not silently reset", async () => {
    render(<SubsonicSubsection />);

    await userEvent.click(screen.getByLabelText(enSettings.subsonic.enable.ariaLabel));

    expect(mutate).toHaveBeenCalledWith({ subsonicEnabled: false, subsonicTranscodingEnabled: true });
  });
});
