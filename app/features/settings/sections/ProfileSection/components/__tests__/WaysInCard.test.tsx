import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import "@test/mocks/next.mock";
import { mockRouter, resetNextMocks } from "@test/mocks/next.mock";
import i18n from "@modules/i18n";
import enErrors from "@modules/i18n/messages/en/errors.json";
import enSettings from "@modules/i18n/messages/en/settings.json";

interface Identity {
  id: string;
  provider: "plex" | "jellyfin" | "oidc";
  username: string | null;
  email: string | null;
  createdAt: Date;
  lastUsedAt: Date | null;
}

const api = vi.hoisted(() => ({
  identities: [] as Identity[],
  hasPassword: true,
  methods: [] as { id: string; label: string }[],
  servers: [] as { server: string }[],
  linkOidc: vi.fn(),
  unlink: vi.fn(),
  confirm: vi.fn(),
}));

vi.mock("@hooks/api/queries/useSignInIdentities", () => ({
  useSignInIdentities: () => ({ data: { identities: api.identities, hasPassword: api.hasPassword } }),
}));

vi.mock("@hooks/api/queries/useSignInMethods", () => ({
  useSignInMethods: () => ({ data: { methods: api.methods } }),
}));

vi.mock("@hooks/api", () => ({
  usePlaybackSourceAccounts: () => ({ data: api.servers }),
}));

vi.mock("@hooks/api/mutations/auth/useOidcFlow", () => ({
  useOidcLinkStart: () => ({ mutate: api.linkOidc, isPending: false, isSuccess: false }),
}));

vi.mock("@hooks/api/mutations/auth/useSignInIdentityMutations", () => ({
  useUnlinkIdentity: () => ({ mutate: api.unlink, isPending: false, error: null }),
}));

vi.mock("@utils/confirm", () => ({
  confirm: (...args: unknown[]) => api.confirm(...args),
}));

vi.mock("../LinkJellyfinDialog", () => ({
  LinkJellyfinDialog: ({ open }: { open: boolean }) => (open ? <div data-testid="jellyfin-dialog" /> : null),
}));

import { WaysInCard } from "../WaysInCard";

const copy = enSettings.profile.waysIn;
const sso = { id: "oidc", label: "Authentik" };

function identity(provider: Identity["provider"], id: string = provider): Identity {
  return { id, provider, username: `${provider}-ana`, email: null, createdAt: new Date(), lastUsedAt: null };
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

beforeEach(() => {
  resetNextMocks();
  api.identities = [];
  api.hasPassword = true;
  api.methods = [];
  api.servers = [];
  api.confirm.mockResolvedValue(true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.history.replaceState({}, "", "/");
});

describe("WaysInCard", () => {
  it("shows what is linked, by provider", () => {
    api.methods = [sso];
    api.identities = [identity("oidc")];

    render(<WaysInCard />);

    expect(screen.getByText(copy.passwordSet)).toBeInTheDocument();
    expect(screen.getByText("Authentik")).toBeInTheDocument();
    expect(screen.getByText("Linked as oidc-ana")).toBeInTheDocument();
  });

  it("links the provider through the server, coming back to this page", async () => {
    api.methods = [sso];

    render(<WaysInCard />);
    await userEvent.click(screen.getByRole("button", { name: copy.link }));

    expect(api.linkOidc).toHaveBeenCalledWith({ returnTo: "/settings/account" });
  });

  it("offers no provider row when the server offers no provider and nothing is linked", () => {
    render(<WaysInCard />);

    expect(screen.queryByText("Authentik")).not.toBeInTheDocument();
    expect(screen.queryByText(enSettings.members.signsIn.jellyfin)).not.toBeInTheDocument();
  });

  it("opens the Jellyfin link form when Jellyfin is connected to the server", async () => {
    api.servers = [{ server: "jellyfin" }];

    render(<WaysInCard />);
    await userEvent.click(screen.getByRole("button", { name: copy.link }));

    expect(screen.getByTestId("jellyfin-dialog")).toBeInTheDocument();
  });

  it("unlinks an outside account after confirming", async () => {
    api.methods = [sso];
    api.identities = [identity("oidc", "i1")];

    render(<WaysInCard />);
    await userEvent.click(screen.getByRole("button", { name: "Unlink Authentik" }));

    await waitFor(() => expect(api.unlink).toHaveBeenCalledWith({ identityId: "i1" }));
  });

  it("refuses to remove the last way in and explains it", () => {
    api.methods = [sso];
    api.hasPassword = false;
    api.identities = [identity("oidc")];

    render(<WaysInCard />);

    expect(screen.queryByRole("button", { name: "Unlink Authentik" })).not.toBeInTheDocument();
    expect(screen.getByText(copy.lastWayIn)).toBeInTheDocument();
  });

  it("confirms a link made at the provider, once, and cleans the address", () => {
    window.history.replaceState({}, "", "/settings/account?linked=oidc");
    api.methods = [sso];
    api.identities = [identity("oidc")];

    render(<WaysInCard />);

    expect(screen.getByText("Authentik is linked. You can sign in with it now.")).toBeInTheDocument();
    expect(mockRouter.replace).toHaveBeenCalledWith("/settings/account", { scroll: false });
  });

  it("explains a link the provider sent back with an error", () => {
    window.history.replaceState({}, "", "/settings/account?error=OIDC_ALREADY_LINKED");
    api.methods = [sso];

    render(<WaysInCard />);

    expect(screen.getByText(enErrors.OIDC_ALREADY_LINKED.title)).toBeInTheDocument();
    expect(mockRouter.replace).toHaveBeenCalledWith("/settings/account", { scroll: false });
  });
});
