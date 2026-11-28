import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { SECRET_SENTINEL } from "../../../../components/constants";

const LEAKED_SECRET = "a-secret-that-must-never-reach-the-page";

interface TestResult {
  ok: boolean;
  failure: string | null;
  message: string | null;
  testedAt: string;
  lastPassedAt: string | null;
}

const api = vi.hoisted(() => ({
  oidc: {
    enabled: true,
    issuerUrl: "https://auth.example.com/application/o/synthseek/",
    clientId: "synthseek",
    clientSecret: "",
    scopes: "openid profile email",
    buttonLabel: "Authentik",
    lastTestPassedAt: null as string | null,
    providerFirst: false,
    autoRedirect: false,
  },
  publicBaseUrl: "https://music.example.com/",
  update: vi.fn(),
  test: vi.fn(),
  testResult: undefined as TestResult | undefined,
}));

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => ({ data: { connections: { oidc: api.oidc } } }),
}));

vi.mock("@hooks/api/queries/usePublicConfig", () => ({
  usePublicConfig: () => ({ data: { publicBaseUrl: api.publicBaseUrl } }),
}));

vi.mock("@hooks/api/mutations/settings/useOidcSettings", () => ({
  useUpdateConnectionsOidc: () => ({ mutateAsync: api.update, isPending: false }),
  useTestOidc: () => ({ mutate: api.test, isPending: false, data: api.testResult }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { OidcProviderCard } from "../OidcProviderCard";

const copy = enSettings.members.oidc;
const baseOidc = { ...api.oidc };

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

beforeEach(() => {
  api.oidc = { ...baseOidc };
  api.publicBaseUrl = "https://music.example.com/";
  api.testResult = undefined;
  api.update.mockResolvedValue({ ok: true });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function secretInput(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('input[autocomplete="new-password"]');
  if (input === null) throw new Error("no secret input");
  return input;
}

describe("the client secret", () => {
  it("is never put on the page, even when the server sends more than its mask", () => {
    api.oidc = { ...baseOidc, clientSecret: LEAKED_SECRET };

    render(<OidcProviderCard />);

    expect(document.body.innerHTML).not.toContain(LEAKED_SECRET);
    expect(secretInput()).toHaveValue("");
    expect(secretInput()).toHaveAttribute("placeholder", copy.clientSecret.storedPlaceholder);
  });

  it("keeps the stored secret when the administrator saves without typing one", async () => {
    api.oidc = { ...baseOidc, clientSecret: SECRET_SENTINEL };
    render(<OidcProviderCard />);

    await userEvent.clear(screen.getByPlaceholderText(copy.buttonLabel.placeholder));
    await userEvent.type(screen.getByPlaceholderText(copy.buttonLabel.placeholder), "Sign in with Authentik");
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => expect(api.update).toHaveBeenCalledTimes(1));
    expect(api.update.mock.calls[0]?.[0]).toMatchObject({
      clientSecret: SECRET_SENTINEL,
      buttonLabel: "Sign in with Authentik",
    });
  });

  it("sends a typed secret, then empties the field again", async () => {
    render(<OidcProviderCard />);

    await userEvent.type(secretInput(), "brand-new");
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => expect(api.update).toHaveBeenCalledTimes(1));
    expect(api.update.mock.calls[0]?.[0]).toMatchObject({ clientSecret: "brand-new" });
    await waitFor(() => expect(secretInput()).toHaveValue(""));
  });

  it("sends only the provider fields, not the switches another card owns", async () => {
    render(<OidcProviderCard />);

    await userEvent.type(secretInput(), "x");
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => expect(api.update).toHaveBeenCalledTimes(1));
    expect(Object.keys(api.update.mock.calls[0]?.[0] ?? {}).sort()).toEqual(
      ["buttonLabel", "clientId", "clientSecret", "enabled", "issuerUrl", "scopes"].sort()
    );
  });
});

describe("the callback address", () => {
  it("is the public address the provider must send people back to, with a copy button", () => {
    render(<OidcProviderCard />);

    expect(screen.getByDisplayValue("https://music.example.com/api/v1/auth/oidc/callback")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.callback.copyAriaLabel })).toBeInTheDocument();
  });

  it("asks for PUBLIC_BASE_URL instead of guessing one", () => {
    api.publicBaseUrl = "";

    render(<OidcProviderCard />);

    expect(screen.getByText(copy.callback.missing)).toBeInTheDocument();
    expect(screen.queryByDisplayValue(/oidc\/callback/)).not.toBeInTheDocument();
  });
});

describe("Test connection", () => {
  it("tests the saved provider and says when it last passed", async () => {
    api.oidc = { ...baseOidc, lastTestPassedAt: "2026-11-27T10:00:00.000Z" };
    render(<OidcProviderCard />);

    await userEvent.click(screen.getByRole("button", { name: copy.test.action }));

    expect(api.test).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/^Last passed/)).toBeInTheDocument();
  });

  it("says it has never passed", () => {
    render(<OidcProviderCard />);

    expect(screen.getByText(copy.test.neverPassed)).toBeInTheDocument();
  });

  it("waits for unsaved changes to be saved, and says why", async () => {
    render(<OidcProviderCard />);

    await userEvent.type(screen.getByPlaceholderText(copy.buttonLabel.placeholder), "!");

    expect(screen.getByRole("button", { name: copy.test.action })).toBeDisabled();
    expect(screen.getByText(copy.test.saveFirst)).toBeInTheDocument();
  });

  it("explains a failed test in the administrator's language", () => {
    api.testResult = {
      ok: false,
      failure: "issuerMismatch",
      message: "server text",
      testedAt: "2026-11-27T10:00:00.000Z",
      lastPassedAt: null,
    };

    render(<OidcProviderCard />);

    expect(screen.getByText(copy.test.failed)).toBeInTheDocument();
    expect(screen.getByText(copy.failures.issuerMismatch)).toBeInTheDocument();
    expect(screen.queryByText("server text")).not.toBeInTheDocument();
  });

  it("says a passed test passed", () => {
    api.testResult = {
      ok: true,
      failure: null,
      message: null,
      testedAt: "2026-11-27T10:00:00.000Z",
      lastPassedAt: "2026-11-27T10:00:00.000Z",
    };

    render(<OidcProviderCard />);

    expect(screen.getByText(copy.test.passed)).toBeInTheDocument();
  });
});
