import { describe, expect, it } from "vitest";

import {
  categorySelection,
  draftOf,
  isDraftComplete,
  sameDraft,
  saveInputOf,
  withCategory,
  withKind,
} from "../helpers";
import type { DestinationDraft, NotificationKind } from "../types";
import { makeDestination } from "./fixtures";

describe("draftOf", () => {
  it("starts an unset ntfy destination enabled, on the public server, with nothing selected", () => {
    expect(draftOf("ntfy", undefined)).toEqual({
      enabled: true,
      config: { serverUrl: "https://ntfy.sh", topic: "", accessToken: "" },
      kinds: [],
      allRequests: false,
    });
  });

  it("leaves the other channels' fields blank", () => {
    expect(draftOf("discord", undefined).config).toEqual({ webhookUrl: "" });
  });

  it("copies a saved destination, keeping it disabled when it was switched off", () => {
    const destination = makeDestination({
      enabled: false,
      config: { serverUrl: "https://push.example.org", topic: "mine", accessToken: "••••••••" },
      kinds: ["album_failed"],
      allRequests: true,
    });

    expect(draftOf("ntfy", destination)).toEqual({
      enabled: false,
      config: { serverUrl: "https://push.example.org", topic: "mine", accessToken: "••••••••" },
      kinds: ["album_failed"],
      allRequests: true,
    });
  });

  it("treats an unconfigured entry as a fresh one, enabled", () => {
    expect(draftOf("ntfy", makeDestination({ configured: false, enabled: false, config: {} })).enabled).toBe(true);
  });
});

describe("sameDraft", () => {
  const base = draftOf("ntfy", makeDestination({ kinds: ["track_completed", "album_failed"] }));

  it("ignores the order the kinds were picked in", () => {
    expect(sameDraft(base, { ...base, kinds: ["album_failed", "track_completed"] })).toBe(true);
  });

  it.each([
    ["enabled", { ...base, enabled: false }],
    ["allRequests", { ...base, allRequests: true }],
    ["a missing kind", { ...base, kinds: ["track_completed"] }],
    ["a swapped kind", { ...base, kinds: ["track_completed", "review_new"] }],
    ["a field", { ...base, config: { ...base.config, topic: "other" } }],
  ] satisfies ReadonlyArray<readonly [string, DestinationDraft]>)("notices a change to %s", (_label, changed) => {
    expect(sameDraft(base, changed)).toBe(false);
  });
});

describe("isDraftComplete", () => {
  it("needs every required field filled with more than spaces", () => {
    const draft = draftOf("ntfy", undefined);

    expect(isDraftComplete("ntfy", draft)).toBe(false);
    expect(isDraftComplete("ntfy", { ...draft, config: { ...draft.config, topic: "   " } })).toBe(false);
    expect(isDraftComplete("ntfy", { ...draft, config: { ...draft.config, topic: "mine" } })).toBe(true);
  });

  it("counts a field the draft never had as empty", () => {
    expect(isDraftComplete("telegram", { ...draftOf("telegram", undefined), config: { botToken: "1:AA" } })).toBe(
      false
    );
  });
});

describe("saveInputOf", () => {
  it("trims every field and carries the rest of the draft", () => {
    const draft: DestinationDraft = {
      enabled: false,
      config: { serverUrl: " https://ntfy.sh ", topic: " mine\n", accessToken: "" },
      kinds: ["review_new"],
      allRequests: true,
    };

    expect(saveInputOf("ntfy", draft)).toEqual({
      channel: "ntfy",
      enabled: false,
      config: { serverUrl: "https://ntfy.sh", topic: "mine", accessToken: "" },
      kinds: ["review_new"],
      allRequests: true,
    });
  });
});

const kinds: NotificationKind[] = ["track_completed", "album_failed"];

describe("categorySelection", () => {
  it("is unchecked, partly checked or checked by how many of the category are chosen", () => {
    expect(categorySelection(kinds, ["review_new"])).toBe(false);
    expect(categorySelection(kinds, ["album_failed", "review_new"])).toBe("indeterminate");
    expect(categorySelection(kinds, ["album_failed", "track_completed"])).toBe(true);
  });
});

describe("withCategory", () => {
  it("adds the whole category once, keeping other categories", () => {
    expect(withCategory(kinds, ["album_failed", "review_new"], true)).toEqual([
      "review_new",
      "track_completed",
      "album_failed",
    ]);
  });

  it("removes the whole category, keeping other categories", () => {
    expect(withCategory(kinds, ["album_failed", "review_new", "track_completed"], false)).toEqual(["review_new"]);
  });
});

describe("withKind", () => {
  it("adds a kind once and removes it again", () => {
    const added = withKind(["review_new", "album_failed"], "album_failed", true);

    expect(added).toEqual(["review_new", "album_failed"]);
    expect(withKind(added, "album_failed", false)).toEqual(["review_new"]);
  });
});
