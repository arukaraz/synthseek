import { describe, expect, it } from "vitest";

import enSetup from "@modules/i18n/messages/en/setup.json";

import {
  accountErrorsOf,
  connectionStateOf,
  isHttpUrl,
  isPlexTimeoutMessage,
  isValidEmail,
  progressPercentOf,
  resumeStepOf,
  setupFailureOf,
  stepNumberOf,
  summaryRowsOf,
} from "../helpers";
import type { AccountDraft, SetupProgress, SetupStepId } from "../types";

function refusal(appCode: string, appParams: Record<string, string | number> = {}) {
  return Object.assign(new Error("refused"), { data: { appCode, appParams } });
}

function progressOf(
  resumeAt: SetupProgress["resumeAt"],
  outcomes: Record<"media" | "downloads" | "metadata", "answered" | "skipped" | null>
): SetupProgress {
  return {
    questions: [
      { id: "account", outcome: "answered" },
      { id: "media", outcome: outcomes.media },
      { id: "downloads", outcome: outcomes.downloads },
      { id: "metadata", outcome: outcomes.metadata },
    ],
    resumeAt,
    finished: resumeAt === null,
  };
}

const NONE = { media: null, downloads: null, metadata: null } as const;

const validDraft: AccountDraft = {
  email: "admin@example.com",
  username: "admin",
  password: "hunter2hunter2",
  token: "",
};

describe("resumeStepOf", () => {
  it("never sends a signed-in visitor back to the account question", () => {
    expect(resumeStepOf(progressOf("account", NONE))).toBe("media");
  });

  it("goes to the first question the server has not recorded", () => {
    expect(resumeStepOf(progressOf("downloads", { ...NONE, media: "answered" }))).toBe("downloads");
  });

  it("goes to the summary when the server has nothing left to ask", () => {
    expect(resumeStepOf(progressOf(null, { media: "answered", downloads: "skipped", metadata: "answered" }))).toBe(
      "summary"
    );
  });
});

describe("stepNumberOf and progressPercentOf", () => {
  it("numbers the four questions from one", () => {
    const questions: SetupStepId[] = ["account", "media", "downloads", "metadata"];

    expect(questions.map(stepNumberOf)).toEqual([1, 2, 3, 4]);
  });

  it("never numbers the summary past the last question", () => {
    expect(stepNumberOf("summary")).toBe(4);
  });

  it("fills a quarter of the track per question and all of it on the summary", () => {
    expect(progressPercentOf("account")).toBe(25);
    expect(progressPercentOf("downloads")).toBe(75);
    expect(progressPercentOf("summary")).toBe(100);
  });
});

describe("accountErrorsOf", () => {
  it("accepts a complete account", () => {
    expect(accountErrorsOf(validDraft, false)).toEqual({});
  });

  it("flags each field that is wrong, in the visitor's language", () => {
    const errors = accountErrorsOf({ email: "nope", username: "ab", password: "short", token: "" }, false);

    expect(errors).toEqual({
      email: enSetup.account.emailError,
      username: enSetup.account.usernameError,
      password: enSetup.account.passwordError,
    });
  });

  it("asks for the token only when the server requires one", () => {
    expect(accountErrorsOf(validDraft, false).token).toBeUndefined();
    expect(accountErrorsOf(validDraft, true).token).toBe(enSetup.account.tokenMissing);
    expect(accountErrorsOf({ ...validDraft, token: "  " }, true).token).toBe(enSetup.account.tokenMissing);
    expect(accountErrorsOf({ ...validDraft, token: "abc" }, true).token).toBeUndefined();
  });

  it("measures the username without its surrounding spaces", () => {
    expect(accountErrorsOf({ ...validDraft, username: "  ab  " }, false).username).toBe(enSetup.account.usernameError);
  });
});

describe("isValidEmail", () => {
  it("accepts an address with surrounding spaces and rejects text without a domain", () => {
    expect(isValidEmail(" a@b.co ")).toBe(true);
    expect(isValidEmail("a@")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isHttpUrl", () => {
  it("accepts http and https and nothing else", () => {
    expect(isHttpUrl("http://navidrome:4533")).toBe(true);
    expect(isHttpUrl(" https://host ")).toBe(true);
    expect(isHttpUrl("ftp://host")).toBe(false);
    expect(isHttpUrl("host:4533")).toBe(false);
    expect(isHttpUrl("")).toBe(false);
  });
});

describe("isPlexTimeoutMessage", () => {
  it("recognises the timeout wording whatever its case", () => {
    expect(isPlexTimeoutMessage("Plex sign-in Timed Out")).toBe(true);
    expect(isPlexTimeoutMessage("denied")).toBe(false);
  });
});

describe("setupFailureOf", () => {
  it("turns a throttle into a wait the server chose", () => {
    expect(setupFailureOf(refusal("TOO_MANY_LOGIN_ATTEMPTS", { retryAfterSeconds: 12.2 }))).toEqual({
      kind: "throttled",
      retryAfterSeconds: 13,
    });
  });

  it("falls back to a minute when the server gives no usable wait", () => {
    expect(setupFailureOf(refusal("TOO_MANY_LOGIN_ATTEMPTS", { retryAfterSeconds: 0 }))).toEqual({
      kind: "throttled",
      retryAfterSeconds: 60,
    });
  });

  it("marks a rejected setup token so the field can show it", () => {
    expect(setupFailureOf(refusal("SETUP_TOKEN_INVALID")).kind).toBe("token");
  });

  it("reads the refusal's title and its advice as two sentences", () => {
    expect(setupFailureOf(refusal("SETUP_TOKEN_INVALID"))).toHaveProperty(
      "text",
      "Setup token missing or wrong. Copy the setup token from the server log and try again."
    );
  });

  it("keeps any other refusal as a message with the fallback wording when the error has no better one", () => {
    const failure = setupFailureOf("boom");

    expect(failure.kind).toBe("message");
    expect(failure).toHaveProperty("text", expect.stringContaining(enSetup.account.createError));
  });
});

describe("connectionStateOf", () => {
  it("passes on ok", () => {
    expect(connectionStateOf("ok", "Navidrome")).toEqual({ kind: "passed" });
  });

  it("says the server could not be reached for a failure", () => {
    expect(connectionStateOf("failed", "Navidrome")).toEqual({
      kind: "failed",
      reason: "Could not reach Navidrome at that address. Check the URL and that the server is up.",
    });
  });

  it("says the credentials were refused for an unauthorized answer", () => {
    expect(connectionStateOf("unauthorized", "Jellyfin")).toEqual({
      kind: "failed",
      reason: "Jellyfin refused those credentials. Check them and try again.",
    });
  });
});

describe("summaryRowsOf", () => {
  it("shows the admin's name and each question's outcome in words", () => {
    const rows = summaryRowsOf(progressOf(null, { media: "answered", downloads: "skipped", metadata: null }), "ana");

    expect(rows.map((row) => [row.key, row.label, row.value])).toEqual([
      ["account", enSetup.summary.questions.account, "ana"],
      ["media", enSetup.summary.questions.media, enSetup.summary.answered],
      ["downloads", enSetup.summary.questions.downloads, enSetup.summary.skipped],
      ["metadata", enSetup.summary.questions.metadata, enSetup.summary.open],
    ]);
  });
});
