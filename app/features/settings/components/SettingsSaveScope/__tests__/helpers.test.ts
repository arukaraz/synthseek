import { afterEach, describe, expect, it, vi } from "vitest";

import { dirtyLabels, internalHrefOf, leavesPage, saveEach, sameEntryState } from "../helpers";
import type { SaveEntry } from "../types";

function entry(overrides: Partial<SaveEntry> = {}): SaveEntry {
  return {
    label: "Card",
    isDirty: true,
    isSaving: false,
    saveDisabled: false,
    save: vi.fn(),
    cancel: vi.fn(),
    ...overrides,
  };
}

function hrefOfClick(target: EventTarget, init: MouseEventInit = {}, preventFirst = false): string | null {
  const seen: Array<string | null> = [];
  const listener = (event: MouseEvent) => {
    seen.push(internalHrefOf(event));
    event.preventDefault();
  };
  const blocker = (event: Event) => event.preventDefault();
  if (preventFirst) document.addEventListener("click", blocker, true);
  document.addEventListener("click", listener);
  target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init }));
  document.removeEventListener("click", listener);
  document.removeEventListener("click", blocker, true);
  expect(seen).toHaveLength(1);
  return seen[0];
}

function anchor(href: string, attributes: Record<string, string> = {}): HTMLAnchorElement {
  const element = document.createElement("a");
  element.setAttribute("href", href);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  element.textContent = "link";
  document.body.append(element);
  return element;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("sameEntryState", () => {
  it("treats a first registration as a change", () => {
    expect(sameEntryState(undefined, entry())).toBe(false);
  });

  it("ignores new handler identities when every visible field is equal", () => {
    expect(sameEntryState(entry(), entry())).toBe(true);
  });

  it.each([
    ["label", { label: "Other" }],
    ["label to null", { label: null }],
    ["isDirty", { isDirty: false }],
    ["isSaving", { isSaving: true }],
    ["saveDisabled", { saveDisabled: true }],
  ])("reports a change when %s differs", (_field, override) => {
    expect(sameEntryState(entry(), entry(override))).toBe(false);
  });
});

describe("leavesPage", () => {
  it("stays on the page for a hash or a query on the same path", () => {
    expect(leavesPage("/settings/account#password", "/settings/account")).toBe(false);
    expect(leavesPage("/settings/account?tab=1", "/settings/account")).toBe(false);
    expect(leavesPage(`${window.location.origin}/settings/account`, "/settings/account")).toBe(false);
  });

  it("leaves for another path, including a nested one", () => {
    expect(leavesPage("/settings/apps", "/settings/account")).toBe(true);
    expect(leavesPage("/settings/account/more", "/settings/account")).toBe(true);
  });
});

describe("internalHrefOf", () => {
  it("returns the path, query and hash of an internal link", () => {
    const link = anchor("/settings/apps?x=1#api-keys");
    expect(hrefOfClick(link)).toBe("/settings/apps?x=1#api-keys");
  });

  it("resolves a click on an element nested inside the link", () => {
    const link = anchor("/settings/media");
    const inner = document.createElement("span");
    link.append(inner);
    expect(hrefOfClick(inner)).toBe("/settings/media");
  });

  it("accepts a link that explicitly targets the same frame", () => {
    expect(hrefOfClick(anchor("/settings/media", { target: "_self" }))).toBe("/settings/media");
  });

  it.each([["metaKey"], ["ctrlKey"], ["shiftKey"], ["altKey"]])("lets the browser handle a %s click", (key) => {
    expect(hrefOfClick(anchor("/settings/apps"), { [key]: true })).toBeNull();
  });

  it("ignores a non primary button", () => {
    expect(hrefOfClick(anchor("/settings/apps"), { button: 1 })).toBeNull();
  });

  it("ignores a click another handler already prevented", () => {
    expect(hrefOfClick(anchor("/settings/apps"), {}, true)).toBeNull();
  });

  it("ignores a download link", () => {
    expect(hrefOfClick(anchor("/api/v1/logs/archive", { download: "" }))).toBeNull();
  });

  it("ignores a link that opens a new tab", () => {
    expect(hrefOfClick(anchor("/settings/apps", { target: "_blank" }))).toBeNull();
  });

  it("ignores a link to another origin", () => {
    expect(hrefOfClick(anchor("https://example.com/settings/apps"))).toBeNull();
  });

  it("ignores a click outside any link", () => {
    const button = document.createElement("button");
    document.body.append(button);
    expect(hrefOfClick(button)).toBeNull();
  });

  it("ignores a click whose target is not an element", () => {
    expect(hrefOfClick(document)).toBeNull();
  });
});

describe("dirtyLabels", () => {
  it("keeps the first occurrence of each label in order and drops unlabelled entries", () => {
    const labels = dirtyLabels([
      entry({ label: "Theme" }),
      entry({ label: null }),
      entry({ label: "Language" }),
      entry({ label: "Theme" }),
    ]);
    expect(labels).toEqual(["Theme", "Language"]);
  });
});

describe("saveEach", () => {
  it("saves every entry in order and reports success", async () => {
    const calls: string[] = [];
    const saved = await saveEach([
      entry({ save: () => calls.push("first") }),
      entry({ save: async () => calls.push("second") }),
    ]);
    expect(saved).toBe(true);
    expect(calls).toEqual(["first", "second"]);
  });

  it("keeps saving after a failure and reports that not everything saved", async () => {
    const calls: string[] = [];
    const saved = await saveEach([
      entry({
        save: () => {
          calls.push("throws");
          throw new Error("boom");
        },
      }),
      entry({
        save: async () => {
          calls.push("rejects");
          throw new Error("later");
        },
      }),
      entry({ save: () => calls.push("last") }),
    ]);
    expect(saved).toBe(false);
    expect(calls).toEqual(["throws", "rejects", "last"]);
  });

  it("waits for each save before starting the next", async () => {
    const calls: string[] = [];
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const pending = saveEach([
      entry({
        save: async () => {
          await gate;
          calls.push("first");
        },
      }),
      entry({ save: () => calls.push("second") }),
    ]);
    await Promise.resolve();
    expect(calls).toEqual([]);
    release();
    await pending;
    expect(calls).toEqual(["first", "second"]);
  });
});
