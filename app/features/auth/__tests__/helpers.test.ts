import { describe, expect, it } from "vitest";

import enAuth from "@modules/i18n/messages/en/auth.json";
import enErrors from "@modules/i18n/messages/en/errors.json";

import { DEFAULT_RETRY_AFTER_SECONDS } from "../constants";
import {
  callbackFailureFrom,
  clockOf,
  escapeHrefOf,
  plexFailureOf,
  signInFailureOf,
  signInPlanOf,
  spokenDurationOf,
} from "../helpers";
import type { SignInMethod, SignInMethodsData } from "../types";

const plex: SignInMethod = { id: "plex", label: "Plex" };
const local: SignInMethod = { id: "local", label: "Email" };
const authentik = { id: "oidc-authentik", label: "Authentik" } as unknown as SignInMethod;
const oidc: SignInMethod = { id: "oidc", label: "Authentik" };
const jellyfin: SignInMethod = { id: "jellyfin", label: "Jellyfin" };

function dataOf(methods: SignInMethod[]): SignInMethodsData {
  return {
    methods,
    setupRequired: false,
    background: null,
    primary: null,
    autoRedirect: null,
    localEscapeParam: "local",
  };
}

function refusal(appCode: string, appParams: Record<string, string | number> = {}) {
  return { message: "refused", data: { appCode, appParams } };
}

const plain = { primary: null, autoRedirect: null };

describe("signInPlanOf", () => {
  it("offers the local form alone while the methods are still loading or failed to load", () => {
    expect(signInPlanOf(undefined)).toEqual({ external: [], local: true, usable: true, ...plain });
  });

  it("offers only the local form when that is the only method", () => {
    expect(signInPlanOf(dataOf([local]))).toEqual({ external: [], local: true, usable: true, ...plain });
  });

  it("puts Plex in the external methods beside the local form", () => {
    const plan = signInPlanOf(dataOf([plex, local]));

    expect(plan.external.map((method) => method.id)).toEqual(["plex"]);
    expect(plan.local).toBe(true);
  });

  it("is usable with Plex alone", () => {
    expect(signInPlanOf(dataOf([plex]))).toEqual({ external: [plex], local: false, usable: true, ...plain });
  });

  it("is not usable when the server lists no method", () => {
    expect(signInPlanOf(dataOf([]))).toEqual({ external: [], local: false, usable: false, ...plain });
  });

  it("leaves out a method it has no way to start, and says nothing is usable when that was the only one", () => {
    expect(signInPlanOf(dataOf([authentik]))).toEqual({ external: [], local: false, usable: false, ...plain });
  });

  it("keeps the local form when an unknown method comes beside it", () => {
    expect(signInPlanOf(dataOf([authentik, local]))).toEqual({ external: [], local: true, usable: true, ...plain });
  });

  it("keeps the server's order for single sign-on, Plex and Jellyfin and drops an unknown id between them", () => {
    const plan = signInPlanOf(dataOf([oidc, authentik, plex, jellyfin, local]));

    expect(plan.external.map((method) => method.id)).toEqual(["oidc", "plex", "jellyfin"]);
    expect(plan.local).toBe(true);
  });

  it("names the provider that goes first and the one to go to at once", () => {
    const plan = signInPlanOf({ ...dataOf([oidc, local]), primary: "oidc", autoRedirect: "oidc" });

    expect(plan.primary).toEqual(oidc);
    expect(plan.autoRedirect).toEqual(oidc);
  });

  it("ignores a primary or redirect target the list does not offer", () => {
    const plan = signInPlanOf({ ...dataOf([local]), primary: "oidc", autoRedirect: "oidc" });

    expect(plan.primary).toBeNull();
    expect(plan.autoRedirect).toBeNull();
  });
});

describe("callbackFailureFrom", () => {
  it("reads a code the callback is known to send", () => {
    expect(callbackFailureFrom("?error=OIDC_PROVIDER_REFUSED")).toEqual({
      kind: "message",
      title: enErrors.OIDC_PROVIDER_REFUSED.title,
      description: enErrors.OIDC_PROVIDER_REFUSED.description,
    });
  });

  it("gives an account waiting for approval its own outcome", () => {
    expect(callbackFailureFrom("?error=ACCOUNT_PENDING_APPROVAL")).toEqual({ kind: "pendingApproval" });
  });

  it.each(["?error=INVALID_CREDENTIALS", "?error=<script>", "?error=", "", "?next=%2Flibrary"])(
    "shows nothing for %s",
    (search) => {
      expect(callbackFailureFrom(search)).toBeNull();
    }
  );
});

describe("escapeHrefOf", () => {
  it("keeps the return path and adds the escape", () => {
    expect(escapeHrefOf("?next=%2Flibrary", "local")).toBe("/login?next=%2Flibrary&local=");
  });
});

describe("signInFailureOf", () => {
  it("reads the wait out of a throttled refusal", () => {
    expect(signInFailureOf(refusal("TOO_MANY_LOGIN_ATTEMPTS", { retryAfterSeconds: 42 }))).toEqual({
      kind: "throttled",
      retryAfterSeconds: 42,
    });
  });

  it("rounds a fractional wait up so the form never re-enables early", () => {
    expect(signInFailureOf(refusal("TOO_MANY_LOGIN_ATTEMPTS", { retryAfterSeconds: 41.2 }))).toEqual({
      kind: "throttled",
      retryAfterSeconds: 42,
    });
  });

  it.each([0, -5])("falls back to the default wait when the server sends %s", (seconds) => {
    expect(signInFailureOf(refusal("TOO_MANY_LOGIN_ATTEMPTS", { retryAfterSeconds: seconds }))).toEqual({
      kind: "throttled",
      retryAfterSeconds: DEFAULT_RETRY_AFTER_SECONDS,
    });
  });

  it("falls back to the default wait when the server sends none", () => {
    expect(signInFailureOf(refusal("TOO_MANY_LOGIN_ATTEMPTS"))).toEqual({
      kind: "throttled",
      retryAfterSeconds: DEFAULT_RETRY_AFTER_SECONDS,
    });
  });

  it("tells an account waiting for approval apart from a refusal", () => {
    expect(signInFailureOf(refusal("ACCOUNT_PENDING_APPROVAL"))).toEqual({ kind: "pendingApproval" });
  });

  it("uses the words the caller gives for invalid credentials", () => {
    expect(signInFailureOf(refusal("INVALID_CREDENTIALS"), "Jellyfin said no")).toEqual({
      kind: "message",
      title: "Jellyfin said no",
    });
  });

  it("sends the visitor to setup when Plex says the server has no administrator", () => {
    expect(signInFailureOf(refusal("PLEX_SIGN_IN_NEEDS_SETUP"))).toEqual({ kind: "needsSetup" });
  });

  it("says the email and password do not match for invalid credentials", () => {
    expect(signInFailureOf(refusal("INVALID_CREDENTIALS"))).toEqual({
      kind: "message",
      title: enAuth.auth.login.errors.invalidCredentials,
    });
  });

  it("uses the catalog words for any other coded refusal", () => {
    expect(signInFailureOf(refusal("PLEX_USER_NOT_LINKED"))).toEqual({
      kind: "message",
      title: enErrors.PLEX_USER_NOT_LINKED.title,
      description: enErrors.PLEX_USER_NOT_LINKED.description,
    });
  });

  it("never shows a raw network message, only the plain fallback", () => {
    expect(signInFailureOf(new Error("Failed to fetch"))).toEqual({
      kind: "message",
      title: enAuth.auth.login.errors.generic,
    });
  });
});

describe("plexFailureOf", () => {
  it("explains a blocked popup", () => {
    expect(plexFailureOf({ kind: "popupBlocked" })).toEqual({ kind: "message", title: enAuth.auth.plex.popupBlocked });
  });

  it("explains a timeout", () => {
    expect(plexFailureOf({ kind: "timeout" })).toEqual({ kind: "message", title: enAuth.auth.plex.timeout });
  });

  it("sends the visitor to setup when the failure says the server has no administrator", () => {
    expect(plexFailureOf({ kind: "failed", error: refusal("PLEX_SIGN_IN_NEEDS_SETUP") })).toEqual({
      kind: "needsSetup",
    });
  });

  it("shows a throttled refusal as the catalog message, since Plex has no form to count down", () => {
    expect(
      plexFailureOf({ kind: "failed", error: refusal("TOO_MANY_LOGIN_ATTEMPTS", { retryAfterSeconds: 30 }) })
    ).toEqual({
      kind: "message",
      title: enErrors.TOO_MANY_LOGIN_ATTEMPTS.title,
      description: enErrors.TOO_MANY_LOGIN_ATTEMPTS.description,
    });
  });
});

describe("clockOf", () => {
  it.each([
    [0, "0:00"],
    [9, "0:09"],
    [59, "0:59"],
    [60, "1:00"],
    [125, "2:05"],
    [900, "15:00"],
    [-3, "0:00"],
  ])("writes %s seconds as %s", (seconds, text) => {
    expect(clockOf(seconds)).toBe(text);
  });
});

describe("spokenDurationOf", () => {
  it("speaks a short wait in seconds", () => {
    expect(spokenDurationOf(42, "en")).toBe("42 seconds");
  });

  it("speaks a long wait in minutes, rounded up", () => {
    expect(spokenDurationOf(61, "en")).toBe("2 minutes");
    expect(spokenDurationOf(900, "en")).toBe("15 minutes");
  });

  it("follows the language", () => {
    expect(spokenDurationOf(42, "es")).toBe("42 segundos");
  });
});
