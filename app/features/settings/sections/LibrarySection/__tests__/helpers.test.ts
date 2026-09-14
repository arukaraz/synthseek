import { describe, expect, it } from "vitest";

import {
  insertAtCursor,
  percentDone,
  refuseExtensionTyping,
  secondsRemaining,
  withExtension,
  withoutExtension,
} from "../helpers";
import type { OrganiseStatus } from "../types";

function status(overrides: Partial<OrganiseStatus> = {}): OrganiseStatus {
  return {
    running: true,
    processed: 1000,
    total: 7415,
    moved: 1000,
    failed: 0,
    companionsMoved: 0,
    companionsFailed: 0,
    cancelling: false,
    startedAt: "2026-09-13T10:00:00.000Z",
    finishedAt: null,
    failures: [],
    ...overrides,
  } as OrganiseStatus;
}

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
