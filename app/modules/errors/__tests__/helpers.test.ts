import { beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "@locale";
import enErrors from "@locale/messages/en/errors.json";
import enMutations from "@locale/messages/en/mutations.json";

import { GENERIC_FALLBACK_CODE } from "../constants";
import {
  emitFriendlyToast,
  errorToast,
  errorToastDetailed,
  readErrorMeta,
  resolveFriendlyError,
  resolveFriendlyErrorById,
} from "../helpers";

const toast = vi.hoisted(() => ({ error: vi.fn(), warning: vi.fn(), success: vi.fn() }));

vi.mock("sonner", () => ({ toast }));

function trpcError(appCode: string): { data: { appCode: string } } {
  return { data: { appCode } };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("resolveFriendlyError", () => {
  it("prefers the code the server sent over anything in the message", () => {
    const friendly = resolveFriendlyError(trpcError("SPOTIFY_NOT_CONFIGURED"));

    expect(friendly.title).toBe(enErrors.SPOTIFY_NOT_CONFIGURED.title);
    expect(friendly.severity).toBe("warning");
  });

  it("falls back to reading the message when the server sent no code", () => {
    const friendly = resolveFriendlyError(new Error("Spotify is not configured"));

    expect(friendly.title).toBe(enErrors.SPOTIFY_NOT_CONFIGURED.title);
  });

  it("reads the message off a plain string", () => {
    const friendly = resolveFriendlyError("Spotify is not configured");

    expect(friendly.title).toBe(enErrors.SPOTIFY_NOT_CONFIGURED.title);
  });

  it("reads the message off an object that merely carries one", () => {
    const friendly = resolveFriendlyError({ message: "Spotify is not configured" });

    expect(friendly.title).toBe(enErrors.SPOTIFY_NOT_CONFIGURED.title);
  });

  it("uses the caller's own wording when nothing else matched", () => {
    const friendly = resolveFriendlyError(new Error("something odd"), {
      fallback: { title: "Could not save the playlist" },
    });

    expect(friendly).toEqual({ title: "Could not save the playlist", severity: "error" });
  });

  it("shows the raw message rather than nothing when there is no fallback", () => {
    const friendly = resolveFriendlyError(new Error("something odd"));

    expect(friendly.title).toBe("something odd");
    expect(friendly.severity).toBe("error");
  });

  it("falls back to the generic apology when there is nothing to show at all", () => {
    const friendly = resolveFriendlyError(null);

    expect(friendly.title).toBe(i18n.t(`errors:${GENERIC_FALLBACK_CODE}.title`));
  });

  it("ignores an object whose message is not text", () => {
    const friendly = resolveFriendlyError({ message: 42 });

    expect(friendly.title).toBe(i18n.t(`errors:${GENERIC_FALLBACK_CODE}.title`));
  });
});

describe("resolveFriendlyErrorById", () => {
  it("turns the reason on a Spotify callback into something readable", () => {
    const friendly = resolveFriendlyErrorById("spotify", "not_configured");

    expect(friendly.title).toBe(enErrors.SPOTIFY_NOT_CONFIGURED.title);
  });

  it("uses the caller's wording for a reason it does not recognise", () => {
    const friendly = resolveFriendlyErrorById("spotify", "who_knows", { fallback: { title: "Sign-in failed" } });

    expect(friendly).toEqual({ title: "Sign-in failed", severity: "error" });
  });

  it("falls back to the generic apology for a category with no reasons of its own", () => {
    const friendly = resolveFriendlyErrorById("generic", "not_configured");

    expect(friendly.title).toBe(i18n.t(`errors:${GENERIC_FALLBACK_CODE}.title`));
  });
});

describe("emitFriendlyToast", () => {
  it("raises an error as an error, with its description", () => {
    emitFriendlyToast({ title: "Gone wrong", description: "Try again later", severity: "error" });

    expect(toast.error).toHaveBeenCalledWith("Gone wrong", { description: "Try again later", duration: undefined });
  });

  it("raises a warning as a warning", () => {
    emitFriendlyToast({ title: "Careful", severity: "warning" });

    expect(toast.warning).toHaveBeenCalledWith("Careful", undefined);
  });

  it("raises a success as a success", () => {
    emitFriendlyToast({ title: "Saved", severity: "success" });

    expect(toast.success).toHaveBeenCalledWith("Saved", undefined);
  });

  it("keeps a message that needs longer on screen for longer", () => {
    emitFriendlyToast({ title: "Careful", severity: "warning", duration: 12000 });

    expect(toast.warning).toHaveBeenCalledWith("Careful", { duration: 12000 });
  });
});

describe("errorToast", () => {
  it("shows the translated message for a code the server sent", () => {
    errorToast(trpcError("SPOTIFY_NOT_CONFIGURED"));

    expect(toast.warning).toHaveBeenCalledWith(enErrors.SPOTIFY_NOT_CONFIGURED.title, expect.anything());
  });

  it("falls back to the caller's key when the server sent no code", () => {
    errorToast(new Error("something odd"), "requests.downloadFailed");

    expect(toast.error).toHaveBeenCalledWith(enMutations.requests.downloadFailed);
  });

  it("falls back to the generic apology when the caller offered no key either", () => {
    errorToast(new Error("something odd"));

    expect(toast.error).toHaveBeenCalledWith(i18n.t(`errors:${GENERIC_FALLBACK_CODE}.title`), expect.anything());
  });
});

describe("errorToastDetailed", () => {
  it("shows the translated message for a code the server sent", () => {
    errorToastDetailed(trpcError("SPOTIFY_NOT_CONFIGURED"), "requests.downloadFailed");

    expect(toast.warning).toHaveBeenCalled();
  });

  it("keeps the raw message as the detail under the caller's wording", () => {
    errorToastDetailed(new Error("connect ECONNREFUSED"), "requests.downloadFailed");

    expect(toast.error).toHaveBeenCalledWith(enMutations.requests.downloadFailed, {
      description: "connect ECONNREFUSED",
    });
  });

  it("shows no detail when there is no message to show", () => {
    errorToastDetailed(null, "requests.downloadFailed");

    expect(toast.error).toHaveBeenCalledWith(enMutations.requests.downloadFailed, undefined);
  });
});

describe("readErrorMeta", () => {
  it("reads the category and the silence flag a query declared", () => {
    expect(readErrorMeta({ errorCategory: "spotify", silent: true })).toMatchObject({
      errorCategory: "spotify",
      silent: true,
    });
  });

  it("keeps anything else the query carried alongside", () => {
    expect(readErrorMeta({ errorCategory: "generic", trace: "abc" })).toMatchObject({ trace: "abc" });
  });

  it("reads nothing off a query that declared no meta", () => {
    expect(readErrorMeta(undefined)).toEqual({});
  });

  it("reads nothing off a meta whose category is not one the app has", () => {
    expect(readErrorMeta({ errorCategory: "weather" })).toEqual({});
  });
});
