import { beforeAll, describe, expect, it } from "vitest";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import {
  comparableFolder,
  conditionFromDraft,
  defaultPathHint,
  draftForField,
  folderMessage,
  insertAtCursor,
  movedIds,
  percentDone,
  refuseExtensionTyping,
  ruleSummary,
  secondsRemaining,
  withExtension,
  withoutExtension,
} from "../helpers";
import type { ConditionDraft, OrganiseStatus, RuleCondition } from "../types";
import { makeOrganiseStatus, MEMBERS } from "./fixtures";

function status(overrides: Partial<OrganiseStatus> = {}): OrganiseStatus {
  return makeOrganiseStatus({
    running: true,
    processed: 1000,
    total: 7415,
    moved: 1000,
    startedAt: "2026-09-13T10:00:00.000Z",
    ...overrides,
  });
}

function draft(overrides: Partial<ConditionDraft>): ConditionDraft {
  return { key: "k", field: "genre", op: "contains", value: "Jazz", ...overrides };
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

const START = new Date("2026-09-13T10:00:00.000Z").getTime();

describe("keeping the file extension out of the reader's way", () => {
  it("hides it from what the reader edits, since it can only ever sit at the end", () => {
    expect(withoutExtension("{albumartist}/{album}/{track:02d} - {title}.{ext}")).toBe(
      "{albumartist}/{album}/{track:02d} - {title}"
    );
  });

  it("puts it back on whatever the reader typed", () => {
    expect(withExtension("{album}/{title}")).toBe("{album}/{title}.{ext}");
  });

  it("survives a round trip unchanged, which is what the stored value depends on", () => {
    const stored = "{albumartist}/{album}/<Disc {disc:02d}>/{track:02d} - {title}.{ext}";
    expect(withExtension(withoutExtension(stored))).toBe(stored);
  });

  it("does not double it up when a reader types the extension themselves", () => {
    expect(withExtension("{album}/{title}.{ext}")).toBe("{album}/{title}.{ext}");
  });

  it("leaves a template alone that never carried one, rather than cutting into it", () => {
    expect(withoutExtension("{album}/{title}")).toBe("{album}/{title}");
  });

  it("ignores a trailing space, so a stray keystroke does not land inside the name", () => {
    expect(withExtension("{album}/{title} ")).toBe("{album}/{title}.{ext}");
  });

  it("leaves an empty field as the extension alone, which the server then refuses as EMPTY_FILENAME", () => {
    expect(withExtension("")).toBe(".{ext}");
  });

  it("drops the dot the mask orphans, so pasting the format the docs publish does not double it", () => {
    const published = "{albumartist}/{album}/<Disc {disc:02d}>/{track:02d} - {title}.{ext}";

    expect(withExtension(refuseExtensionTyping(published))).toBe(published);
  });

  it("drops a run of dots and spaces, not just the one the mask left", () => {
    expect(withExtension("{album}/{title} . ")).toBe("{album}/{title}.{ext}");
  });

  it("refuses the extension token as it is typed, so it never reaches the field", () => {
    expect(refuseExtensionTyping("{album}/{ext}/{title}")).toBe("{album}//{title}");
  });

  it("refuses it wherever it was pasted, including several at once", () => {
    expect(refuseExtensionTyping("{ext}{album}{ext}")).toBe("{album}");
  });

  it("leaves everything else alone, so typing stays typing", () => {
    expect(refuseExtensionTyping("{albumartist}/{album} (2001)")).toBe("{albumartist}/{album} (2001)");
  });
});

describe("dropping a piece into the format", () => {
  it("puts it where the cursor is, not at the end", () => {
    expect(insertAtCursor("{album}/{title}.{ext}", "{year}", 8, 8)).toBe("{album}/{year}{title}.{ext}");
  });

  it("replaces whatever the reader had selected", () => {
    expect(insertAtCursor("{album}/{title}.{ext}", "{artist}", 8, 15)).toBe("{album}/{artist}.{ext}");
  });

  it("appends when the field has never been focused, since the cursor is then the end", () => {
    const value = "{album}";
    expect(insertAtCursor(value, "/{title}", value.length, value.length)).toBe("{album}/{title}");
  });
});

describe("saying how much longer the move will take", () => {
  it("reads the rate off what has happened so far", () => {
    const fiveMinutesIn = START + 5 * 60 * 1000;

    expect(secondsRemaining(status({ processed: 1000, total: 7415 }), fiveMinutesIn)).toBe(1925);
  });

  it("says nothing until it has seen enough to be worth saying", () => {
    expect(secondsRemaining(status({ processed: 3 }), START + 10_000)).toBeNull();
  });

  it("says nothing once every file is done, rather than claiming zero seconds forever", () => {
    expect(secondsRemaining(status({ processed: 7415, total: 7415 }), START + 60_000)).toBeNull();
  });

  it("says nothing when nothing is running", () => {
    expect(secondsRemaining(status({ running: false }), START + 60_000)).toBeNull();
  });

  it("says nothing when the run never recorded when it began", () => {
    expect(secondsRemaining(status({ startedAt: null }), START + 60_000)).toBeNull();
  });

  it("says nothing rather than a negative estimate if the clocks disagree", () => {
    expect(secondsRemaining(status(), START - 60_000)).toBeNull();
  });
});

describe("the percentage on the bar", () => {
  it("rounds to whole points, because a moving decimal reads as noise", () => {
    expect(percentDone(1204, 7415)).toBe(16);
  });

  it("never exceeds a hundred, even if more were processed than planned", () => {
    expect(percentDone(8000, 7415)).toBe(100);
  });

  it("is zero rather than a division by zero when there is nothing to do", () => {
    expect(percentDone(0, 0)).toBe(0);
  });
});

describe("reading a condition the reader typed", () => {
  it("keeps a text value, trimmed", () => {
    expect(conditionFromDraft(draft({ value: "  Jazz " }))).toEqual({ field: "genre", op: "contains", value: "Jazz" });
  });

  it("refuses an empty text value", () => {
    expect(conditionFromDraft(draft({ value: "   " }))).toBeNull();
  });

  it("refuses a text value longer than the server keeps", () => {
    expect(conditionFromDraft(draft({ field: "artist", op: "is", value: "x".repeat(129) }))).toBeNull();
  });

  it("refuses a comparison the field does not have", () => {
    expect(conditionFromDraft(draft({ field: "genre", op: "is" }))).toBeNull();
    expect(conditionFromDraft(draft({ field: "artist", op: "not_contains" }))).toBeNull();
  });

  it("turns a year into a number and refuses one outside four digits", () => {
    expect(conditionFromDraft(draft({ field: "year", op: "before", value: "1970" }))).toEqual({
      field: "year",
      op: "before",
      value: 1970,
    });
    expect(conditionFromDraft(draft({ field: "year", op: "before", value: "999" }))).toBeNull();
    expect(conditionFromDraft(draft({ field: "year", op: "before", value: "10000" }))).toBeNull();
    expect(conditionFromDraft(draft({ field: "year", op: "before", value: "1970.5" }))).toBeNull();
  });

  it("takes zero songs but not a negative count or more than a thousand", () => {
    expect(conditionFromDraft(draft({ field: "track_count", op: "more_than", value: "0" }))).toEqual({
      field: "track_count",
      op: "more_than",
      value: 0,
    });
    expect(conditionFromDraft(draft({ field: "track_count", op: "more_than", value: "-1" }))).toBeNull();
    expect(conditionFromDraft(draft({ field: "track_count", op: "more_than", value: "1001" }))).toBeNull();
  });

  it("only takes a known quality and request type", () => {
    expect(conditionFromDraft(draft({ field: "quality", op: "is", value: "lossless" }))).toEqual({
      field: "quality",
      op: "is",
      value: "lossless",
    });
    expect(conditionFromDraft(draft({ field: "quality", op: "is", value: "hifi" }))).toBeNull();
    expect(conditionFromDraft(draft({ field: "request_type", op: "is_not", value: "artist" }))).toEqual({
      field: "request_type",
      op: "is_not",
      value: "artist",
    });
    expect(conditionFromDraft(draft({ field: "request_type", op: "is", value: "single" }))).toBeNull();
  });

  it("needs a member for requested by", () => {
    expect(conditionFromDraft(draft({ field: "requested_by", op: "is", value: "" }))).toBeNull();
    expect(conditionFromDraft(draft({ field: "requested_by", op: "is", value: "user-ana" }))).toEqual({
      field: "requested_by",
      op: "is",
      value: "user-ana",
    });
  });
});

describe("a fresh condition for a field", () => {
  it("starts on the field's first comparison and a value it can use", () => {
    expect(draftForField("year", "k", null)).toEqual({ key: "k", field: "year", op: "before", value: "" });
    expect(draftForField("quality", "k", null)).toMatchObject({ op: "is", value: "lossless" });
    expect(draftForField("request_type", "k", null)).toMatchObject({ op: "is", value: "album" });
    expect(draftForField("requested_by", "k", "user-ana")).toMatchObject({ op: "is", value: "user-ana" });
  });
});

describe("a rule read out in words", () => {
  it("joins with and when every condition has to match, and or when any does", () => {
    const conditions: RuleCondition[] = [
      { field: "genre", op: "contains", value: "Jazz" },
      { field: "year", op: "after", value: 1990 },
      { field: "request_type", op: "is", value: "album" },
    ];

    expect(ruleSummary({ matchMode: "all", conditions }, MEMBERS)).toBe(
      "Genre contains Jazz and Release year after 1990 and Request type is Album"
    );
    expect(ruleSummary({ matchMode: "any", conditions }, MEMBERS)).toBe(
      "Genre contains Jazz or Release year after 1990 or Request type is Album"
    );
  });

  it("names the member, and says so when the member is gone", () => {
    expect(
      ruleSummary(
        { matchMode: "all", conditions: [{ field: "requested_by", op: "is_not", value: "user-ana" }] },
        MEMBERS
      )
    ).toBe("Requested by is not Ana");
    expect(
      ruleSummary({ matchMode: "all", conditions: [{ field: "requested_by", op: "is", value: "gone" }] }, MEMBERS)
    ).toBe(`Requested by is ${enSettings.libraryRules.unknownMember}`);
  });

  it("says a rule has no conditions rather than printing nothing", () => {
    expect(ruleSummary({ matchMode: "all", conditions: [] }, MEMBERS)).toBe(enSettings.libraryRules.summary.none);
  });
});

describe("moving a rule in the order", () => {
  it("swaps it with its neighbour in either direction", () => {
    expect(movedIds(["a", "b", "c"], 0, 1)).toEqual(["b", "a", "c"]);
    expect(movedIds(["a", "b", "c"], 2, -1)).toEqual(["a", "c", "b"]);
  });

  it("leaves the order alone at either end", () => {
    expect(movedIds(["a", "b", "c"], 0, -1)).toEqual(["a", "b", "c"]);
    expect(movedIds(["a", "b", "c"], 2, 1)).toEqual(["a", "b", "c"]);
  });
});

describe("the default path hint", () => {
  it("puts read-only first, since nothing else about the default applies to it", () => {
    expect(defaultPathHint({ readonly: true, isDefault: true, currentDefaultLabel: "Music" })).toBe(
      enSettings.libraryPaths.default.readonly
    );
  });

  it("names the current default when this path is not it", () => {
    expect(defaultPathHint({ readonly: false, isDefault: false, currentDefaultLabel: "Music" })).toBe(
      "Music that matches no rule is saved here. Right now that is Music."
    );
  });

  it("points to another path when this one is the default", () => {
    expect(defaultPathHint({ readonly: false, isDefault: true, currentDefaultLabel: "Music" })).toBe(
      enSettings.libraryPaths.default.isThis
    );
  });
});

describe("the folder message", () => {
  it("prefers the environment note over anything a check says", () => {
    expect(
      folderMessage({
        fromEnvironment: true,
        refusal: { outcome: "refused", folder: "/", problem: "system_folder" },
        judging: false,
        verdict: undefined,
      })
    ).toEqual({ tone: "neutral", text: enSettings.libraryPaths.folder.fromEnvironment });
  });

  it("reads a refusal out with the path it clashes with", () => {
    expect(
      folderMessage({
        fromEnvironment: false,
        refusal: { outcome: "refused", folder: "/music", problem: "same_as_path", label: "Music" },
        judging: false,
        verdict: undefined,
      })
    ).toEqual({ tone: "danger", text: "Music already uses this folder." });
  });

  it("says nothing before a folder has been typed", () => {
    expect(folderMessage({ fromEnvironment: false, refusal: null, judging: false, verdict: undefined })).toBeNull();
  });
});

describe("comparing folders", () => {
  it("ignores surrounding spaces and a trailing slash, but keeps the root", () => {
    expect(comparableFolder(" /music/ ")).toBe("/music");
    expect(comparableFolder("/music//")).toBe("/music");
    expect(comparableFolder("/")).toBe("/");
  });
});
