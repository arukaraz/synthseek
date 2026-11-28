import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

interface ModeState {
  providerFirst: boolean;
  autoRedirect: boolean;
  lastTestPassedAt: string | null;
  forcedLocal: boolean;
}

const api = vi.hoisted(() => {
  const state: {
    covers: boolean | undefined;
    pending: boolean;
    oidcEnabled: boolean;
    provisioning: boolean;
    mode: ModeState | undefined;
  } = { covers: false, pending: false, oidcEnabled: true, provisioning: false, mode: undefined };
  return { state, mutate: vi.fn(), mutateMode: vi.fn(), mutateProvisioning: vi.fn() };
});

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => ({
    data:
      api.state.covers === undefined
        ? undefined
        : {
            signIn: { libraryCovers: api.state.covers },
            connections: { oidc: { enabled: api.state.oidcEnabled } },
            accountProvisioning: { enabled: api.state.provisioning },
          },
  }),
}));

vi.mock("@hooks/api/queries/useOidcSignInMode", () => ({
  useOidcSignInMode: () => ({ data: api.state.mode }),
}));

vi.mock("@hooks/api/queries/useSignInMethods", () => ({
  useSignInMethods: () => ({ data: { localEscapeParam: "local" } }),
}));

vi.mock("@hooks/api/mutations/settings/useUpdateSignIn", () => ({
  useUpdateSignIn: () => ({ mutate: api.mutate, isPending: api.state.pending }),
}));

vi.mock("@hooks/api/mutations/settings/useOidcSettings", () => ({
  useUpdateOidcSignInMode: () => ({ mutate: api.mutateMode, isPending: false }),
  useUpdateAccountProvisioning: () => ({ mutate: api.mutateProvisioning, isPending: false }),
}));

import { SignInCard } from "../SignInCard";

const copy = enSettings.members.signIn;
const untested: ModeState = { providerFirst: false, autoRedirect: false, lastTestPassedAt: null, forcedLocal: false };
const tested: ModeState = { ...untested, lastTestPassedAt: "2026-11-27T10:00:00.000Z" };

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

describe("SignInCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.state.covers = false;
    api.state.pending = false;
    api.state.oidcEnabled = true;
    api.state.provisioning = false;
    api.state.mode = undefined;
  });

  it("shows the switch in the state the server holds", () => {
    api.state.covers = true;

    render(<SignInCard />);

    expect(screen.getByRole("switch", { name: copy.libraryCovers.label })).toBeChecked();
  });

  it("says plainly that anyone who can open the sign-in page sees the covers", () => {
    render(<SignInCard />);

    expect(screen.getByText(/Anyone who can open the sign-in page sees these covers/)).toBeInTheDocument();
  });

  it("saves the moment the administrator turns it on", async () => {
    render(<SignInCard />);

    await userEvent.click(screen.getByRole("switch", { name: copy.libraryCovers.label }));

    expect(api.mutate).toHaveBeenCalledWith({ libraryCovers: true });
  });

  it("saves the moment the administrator turns it off", async () => {
    api.state.covers = true;
    render(<SignInCard />);

    await userEvent.click(screen.getByRole("switch", { name: copy.libraryCovers.label }));

    expect(api.mutate).toHaveBeenCalledWith({ libraryCovers: false });
  });

  it("locks the switch while a save is in flight", () => {
    api.state.pending = true;

    render(<SignInCard />);

    expect(screen.getByRole("switch", { name: copy.libraryCovers.label })).toBeDisabled();
  });

  it("renders nothing until the settings have loaded", () => {
    api.state.covers = undefined;

    const { container } = render(<SignInCard />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("provider first and going straight to the provider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.state.covers = false;
    api.state.oidcEnabled = true;
    api.state.mode = untested;
  });

  it("stays disabled, with the reason tied to each switch, until a connection test has passed", () => {
    render(<SignInCard />);

    for (const label of [copy.providerFirst.label, copy.autoRedirect.label]) {
      const control = screen.getByRole("switch", { name: label });
      expect(control).toBeDisabled();
      expect(control).toHaveAccessibleDescription(copy.needsTest);
    }
  });

  it("stays disabled while the provider itself is turned off, even after a test", () => {
    api.state.mode = tested;
    api.state.oidcEnabled = false;

    render(<SignInCard />);

    expect(screen.getByRole("switch", { name: copy.providerFirst.label })).toBeDisabled();
  });

  it("can be turned on once tested, and sends both switches", async () => {
    api.state.mode = { ...tested, autoRedirect: true };

    render(<SignInCard />);
    await userEvent.click(screen.getByRole("switch", { name: copy.providerFirst.label }));

    expect(screen.queryByText(copy.needsTest)).not.toBeInTheDocument();
    expect(api.mutateMode).toHaveBeenCalledWith({ providerFirst: true, autoRedirect: true });
  });

  it("names the escape parameter and FORCE_LOCAL_SIGN_IN beside the switches that can lock an admin out", () => {
    api.state.mode = tested;

    render(<SignInCard />);

    expect(screen.getByText(/\?local/)).toHaveTextContent("FORCE_LOCAL_SIGN_IN=true");
  });

  it("warns when the server forces the password form", () => {
    api.state.mode = { ...untested, forcedLocal: true };

    render(<SignInCard />);

    expect(screen.getByText(copy.forcedLocal)).toBeInTheDocument();
  });
});

describe("account creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.state.covers = false;
    api.state.provisioning = false;
  });

  it("says new accounts wait for approval and saves the moment it is switched", async () => {
    render(<SignInCard />);

    expect(screen.getByText(copy.accountCreation.description)).toHaveTextContent(/approve/);
    await userEvent.click(screen.getByRole("switch", { name: copy.accountCreation.label }));

    expect(api.mutateProvisioning).toHaveBeenCalledWith({ enabled: true });
  });
});
