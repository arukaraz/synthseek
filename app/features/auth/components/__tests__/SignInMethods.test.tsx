import { StrictMode } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";
import { mockRouter, resetNextMocks } from "@test/mocks/next.mock";
import enAuth from "@modules/i18n/messages/en/auth.json";
import enErrors from "@modules/i18n/messages/en/errors.json";

import type { SignInMethod, SignInMethodsData } from "../../types";

interface StartOptions {
  onError?: (error: unknown) => void;
}

const query = vi.hoisted(() => ({ data: undefined as unknown, isPending: false, isError: false }));
const oidc = vi.hoisted(() => ({
  start: vi.fn<(input: { returnTo: string }, options?: StartOptions) => void>(),
  isPending: false,
  isSuccess: false,
}));

vi.mock("@hooks/api/queries/useSignInMethods", () => ({
  useSignInMethods: () => query,
}));

vi.mock("@hooks/api/mutations/auth/useOidcFlow", () => ({
  useOidcStart: () => ({ mutate: oidc.start, isPending: oidc.isPending, isSuccess: oidc.isSuccess }),
}));

vi.mock("../LoginForm", () => ({ LoginForm: () => <div>local-form</div> }));
vi.mock("../PlexLoginButton", () => ({ PlexLoginButton: () => <button type="button">plex-button</button> }));
vi.mock("../JellyfinSignInForm", () => ({ JellyfinSignInForm: () => <div>jellyfin-form</div> }));

import { SignInMethods } from "../SignInMethods";

const plex: SignInMethod = { id: "plex", label: "Plex" };
const local: SignInMethod = { id: "local", label: "Email" };
const sso: SignInMethod = { id: "oidc", label: "Authentik" };
const jellyfin: SignInMethod = { id: "jellyfin", label: "Jellyfin" };
const unknown = { id: "oidc-authentik", label: "Mystery" } as unknown as SignInMethod;

function respond(methods: SignInMethod[], extra: Partial<SignInMethodsData> = {}) {
  const data: SignInMethodsData = {
    methods,
    setupRequired: false,
    background: null,
    primary: null,
    autoRedirect: null,
    localEscapeParam: "local",
    ...extra,
  };
  query.data = data;
  query.isPending = false;
}

function visit(path: string) {
  window.history.replaceState({}, "", path);
}

const continueWith = (name: string) => new RegExp(`Continue with\\s*${name}`);

beforeEach(() => {
  vi.clearAllMocks();
  resetNextMocks();
  oidc.start.mockReset();
  query.data = undefined;
  query.isPending = false;
  query.isError = false;
  oidc.isPending = false;
  oidc.isSuccess = false;
});

afterEach(() => {
  visit("/");
});

describe("the methods the server lists", () => {
  it("shows the local form alone when it is the only method", () => {
    respond([local]);

    render(<SignInMethods />);

    expect(screen.getByText("local-form")).toBeInTheDocument();
    expect(screen.queryByText("plex-button")).not.toBeInTheDocument();
    expect(screen.queryByText(enAuth.auth.login.dividerLabel)).not.toBeInTheDocument();
  });

  it("puts Plex first, then the divider, then the local form", () => {
    respond([local, plex]);

    const { container } = render(<SignInMethods />);

    const text = container.textContent ?? "";
    const order = ["plex-button", enAuth.auth.login.dividerLabel, "local-form"].map((part) => text.indexOf(part));
    expect(order.every((index) => index >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("shows Plex without a divider when there is no local form", () => {
    respond([plex]);

    render(<SignInMethods />);

    expect(screen.getByText("plex-button")).toBeInTheDocument();
    expect(screen.queryByText("local-form")).not.toBeInTheDocument();
    expect(screen.queryByText(enAuth.auth.login.dividerLabel)).not.toBeInTheDocument();
  });

  it("ignores a method id it does not know and still shows every other one", () => {
    respond([sso, unknown, plex, jellyfin, local]);

    render(<SignInMethods />);

    expect(screen.queryByText(/Mystery/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: continueWith("Authentik") })).toBeInTheDocument();
    expect(screen.getByText("plex-button")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: continueWith("Jellyfin") })).toBeInTheDocument();
    expect(screen.getByText("local-form")).toBeInTheDocument();
  });

  it("says there is no sign-in method when the server lists none", () => {
    respond([]);

    render(<SignInMethods />);

    expect(screen.getByText(enAuth.auth.login.noMethods)).toBeInTheDocument();
    expect(screen.queryByText("local-form")).not.toBeInTheDocument();
  });

  it("says there is no sign-in method when the only one is unknown", () => {
    respond([unknown]);

    render(<SignInMethods />);

    expect(screen.getByText(enAuth.auth.login.noMethods)).toBeInTheDocument();
  });
});

describe("while the methods load", () => {
  it("shows a loader and no form, so a redirect never flashes the form first", () => {
    query.isPending = true;

    render(<SignInMethods />);

    expect(screen.getByRole("status")).toHaveTextContent(enAuth.auth.methods.loading);
    expect(screen.queryByText("local-form")).not.toBeInTheDocument();
  });

  it("falls back to the local form when the query failed", () => {
    query.isError = true;

    render(<SignInMethods />);

    expect(screen.getByText("local-form")).toBeInTheDocument();
    expect(screen.queryByText(enAuth.auth.login.noMethods)).not.toBeInTheDocument();
  });
});

describe("single sign-on", () => {
  it("labels the button with the name the server gives and starts with the validated return path", async () => {
    visit("/login?next=%2Flibrary");
    respond([sso, local]);

    render(<SignInMethods />);
    await userEvent.click(screen.getByRole("button", { name: continueWith("Authentik") }));

    expect(oidc.start).toHaveBeenCalledTimes(1);
    expect(oidc.start.mock.calls[0]?.[0]).toEqual({ returnTo: "/library" });
  });

  it("never hands an unsafe return path to the provider", async () => {
    visit("/login?next=https%3A%2F%2Fevil.example");
    respond([sso, local]);

    render(<SignInMethods />);
    await userEvent.click(screen.getByRole("button", { name: continueWith("Authentik") }));

    expect(oidc.start.mock.calls[0]?.[0]).toEqual({ returnTo: "/" });
  });

  it("says why the start failed, beside the button", async () => {
    respond([sso, local]);
    oidc.start.mockImplementation((_input, options) =>
      options?.onError?.({ data: { appCode: "OIDC_PROVIDER_UNREACHABLE" } })
    );

    render(<SignInMethods />);
    await userEvent.click(screen.getByRole("button", { name: continueWith("Authentik") }));

    expect(screen.getByRole("alert")).toHaveTextContent(enErrors.OIDC_PROVIDER_UNREACHABLE.title);
  });
});

describe("provider first", () => {
  it("makes the provider the main action and folds the password form behind a quiet link", async () => {
    respond([sso, plex, local], { primary: "oidc" });

    render(<SignInMethods />);

    expect(screen.getByRole("button", { name: continueWith("Authentik") })).toBeInTheDocument();
    expect(screen.getByText("plex-button")).toBeInTheDocument();
    expect(screen.queryByText("local-form")).not.toBeInTheDocument();
    expect(screen.queryByText(enAuth.auth.login.dividerLabel)).not.toBeInTheDocument();

    const fold = screen.getByRole("button", { name: enAuth.auth.methods.passwordFold });
    expect(fold).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(fold);

    expect(fold).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("local-form")).toBeInTheDocument();
  });
});

describe("going straight to the provider", () => {
  it("starts once, says where it is going, and never shows the form on the way", () => {
    query.isPending = true;
    const { rerender } = render(<SignInMethods />);
    expect(screen.queryByText("local-form")).not.toBeInTheDocument();

    respond([sso, local], { primary: "oidc", autoRedirect: "oidc" });
    rerender(<SignInMethods />);

    expect(oidc.start).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Taking you to Authentik");
    expect(screen.queryByText("local-form")).not.toBeInTheDocument();

    respond([sso, local], { primary: "oidc", autoRedirect: "oidc" });
    rerender(<SignInMethods />);

    expect(oidc.start).toHaveBeenCalledTimes(1);
  });

  it("starts once even when development mode runs every effect twice", () => {
    respond([sso, local], { autoRedirect: "oidc" });

    render(
      <StrictMode>
        <SignInMethods />
      </StrictMode>
    );

    expect(oidc.start).toHaveBeenCalledTimes(1);
  });

  it("offers a way to stay that keeps the return path", () => {
    visit("/login?next=%2Flibrary");
    respond([sso, local], { autoRedirect: "oidc" });

    render(<SignInMethods />);

    expect(screen.getByRole("link", { name: enAuth.auth.redirect.escape })).toHaveAttribute(
      "href",
      "/login?next=%2Flibrary&local="
    );
  });

  it("stops after a failed start, shows the error and the other ways in, and does not try again", () => {
    oidc.start.mockImplementation((_input, options) =>
      options?.onError?.({ data: { appCode: "OIDC_PROVIDER_UNREACHABLE" } })
    );
    respond([sso, local], { autoRedirect: "oidc" });

    const { rerender } = render(<SignInMethods />);
    respond([sso, local], { autoRedirect: "oidc" });
    rerender(<SignInMethods />);

    expect(oidc.start).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alert")).toHaveTextContent(enErrors.OIDC_PROVIDER_UNREACHABLE.title);
    expect(screen.getByText("local-form")).toBeInTheDocument();
  });

  it("does not leave later when a refetch starts asking for the redirect", () => {
    respond([sso, local]);
    const { rerender } = render(<SignInMethods />);

    respond([sso, local], { autoRedirect: "oidc" });
    rerender(<SignInMethods />);

    expect(oidc.start).not.toHaveBeenCalled();
    expect(screen.getByText("local-form")).toBeInTheDocument();
  });
});

describe("the error a failed callback puts in the address", () => {
  it("shows it inline once and removes it from the address, keeping the return path", () => {
    visit("/login?error=OIDC_PROVIDER_REFUSED&next=%2Flibrary");
    respond([sso, local]);

    render(<SignInMethods />);

    expect(screen.getByRole("alert")).toHaveTextContent(enErrors.OIDC_PROVIDER_REFUSED.title);
    expect(mockRouter.replace).toHaveBeenCalledWith("/login?next=%2Flibrary", { scroll: false });
  });

  it("gives an account waiting for approval its own calm message", () => {
    visit("/login?error=ACCOUNT_PENDING_APPROVAL");
    respond([sso, local]);

    render(<SignInMethods />);

    const notice = screen.getByRole("status");
    expect(within(notice).getByText(enErrors.ACCOUNT_PENDING_APPROVAL.title)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows nothing for a code the callback never sends, and still cleans the address", () => {
    visit("/login?error=SOMETHING_MADE_UP");
    respond([local]);

    render(<SignInMethods />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(mockRouter.replace).toHaveBeenCalledWith("/login", { scroll: false });
  });

  it("leaves a clean address alone", () => {
    visit("/login?local");
    respond([local]);

    render(<SignInMethods />);

    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});

describe("Jellyfin", () => {
  it("opens its form from its button", async () => {
    respond([jellyfin, local]);

    render(<SignInMethods />);
    const button = screen.getByRole("button", { name: continueWith("Jellyfin") });
    expect(screen.queryByText("jellyfin-form")).not.toBeInTheDocument();

    await userEvent.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("jellyfin-form")).toBeInTheDocument();
  });

  it("shows its form at once when it is the only way in", () => {
    respond([jellyfin]);

    render(<SignInMethods />);

    expect(screen.getByText("jellyfin-form")).toBeInTheDocument();
  });
});
