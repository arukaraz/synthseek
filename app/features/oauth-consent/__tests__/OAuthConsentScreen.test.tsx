import { describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";

const search = vi.hoisted(() => ({ grant: null as string | null }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(search.grant === null ? "" : `grant=${search.grant}`),
}));

vi.mock("@hooks/api/queries/useOAuthPending", () => ({
  useOAuthPending: () => ({
    isLoading: false,
    error: null,
    data: { clientName: "Claude", scopes: [] },
  }),
}));

vi.mock("@hooks/api/mutations/oauth/useApproveOAuth", () => ({
  useApproveOAuth: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@hooks/api/mutations/oauth/useDenyOAuth", () => ({
  useDenyOAuth: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: { username: "nexus" } }),
}));

import { OAuthConsentScreen } from "../OAuthConsentScreen";

describe("OAuthConsentScreen", () => {
  it("holds the consent card inside the main landmark", () => {
    search.grant = "grant-1";
    renderWithProviders(<OAuthConsentScreen />);

    expect(screen.getByRole("main")).toContainElement(screen.getByRole("button", { name: "Allow" }));
  });

  it("keeps the landmark when the grant is missing", () => {
    search.grant = null;
    renderWithProviders(<OAuthConsentScreen />);

    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
