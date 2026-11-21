import { afterEach, describe, expect, it } from "vitest";

import {
  FACTORY_BOOT,
  THEME_ATTRIBUTE,
  THEME_BASE_ATTRIBUTE,
  THEME_BOOT_SCRIPT,
  THEME_CHANGE_EVENT,
  THEME_DRAFT_ID,
  THEME_SHEET_ID,
  THEME_SHEET_PENDING_ATTRIBUTE,
} from "../constants";
import {
  asksForFactoryTheme,
  bootOf,
  paintTheme,
  parseThemeCookie,
  sheetHref,
  withoutFactoryThemeParam,
} from "../helpers";
import type { CustomThemeSummary } from "../types";

const FINGERPRINT = "0123456789abcdef";
const OTHER_FINGERPRINT = "fedcba9876543210";

const CUSTOM: CustomThemeSummary = {
  name: "Mine",
  scheme: "light",
  startedFrom: "ocean",
  follows: [],
  fingerprint: FINGERPRINT,
  folder: "alex",
};

function sheets(): HTMLLinkElement[] {
  return Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'));
}

function settle(link: HTMLLinkElement): void {
  link.dispatchEvent(new Event("load"));
}

function serverSheet(): HTMLLinkElement {
  const sheet = document.createElement("link");
  sheet.id = THEME_SHEET_ID;
  sheet.rel = "stylesheet";
  sheet.href = sheetHref(FINGERPRINT);
  document.head.appendChild(sheet);
  return sheet;
}

function heardPaints(): { count: () => number; stop: () => void } {
  let heard = 0;
  const listener = () => {
    heard += 1;
  };
  document.addEventListener(THEME_CHANGE_EVENT, listener);
  return { count: () => heard, stop: () => document.removeEventListener(THEME_CHANGE_EVENT, listener) };
}

afterEach(() => {
  window.history.replaceState(null, "", "/");
  document.head.innerHTML = "";
  document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  document.documentElement.removeAttribute(THEME_BASE_ATTRIBUTE);
});

describe("parseThemeCookie", () => {
  it("paints the factory theme when there is no cookie", () => {
    expect(parseThemeCookie(undefined)).toEqual(FACTORY_BOOT);
  });

  it("reads a preset", () => {
    expect(parseThemeCookie("midnight")).toEqual({
      theme: "midnight",
      base: "midnight",
      scheme: "dark",
      fingerprint: null,
    });
  });

  it("reads a custom theme with its preset, scheme and sheet", () => {
    expect(parseThemeCookie(`custom.ocean.light.${FINGERPRINT}`)).toEqual({
      theme: "custom",
      base: "ocean",
      scheme: "light",
      fingerprint: FINGERPRINT,
    });
  });

  it.each([
    "custom",
    "custom.ocean.light",
    `custom.neon.light.${FINGERPRINT}`,
    `custom.ocean.sepia.${FINGERPRINT}`,
    "custom.ocean.light.0123456789abcdeg",
    "custom.ocean.light.0123",
    `custom.ocean.light.${FINGERPRINT}/../x`,
    '"><script>',
    "neon",
  ])("falls back to the factory theme for the malformed value %s", (value) => {
    expect(parseThemeCookie(value)).toEqual(FACTORY_BOOT);
  });
});

describe("bootOf", () => {
  it("links no custom sheet under a preset, so nothing of it applies there", () => {
    expect(bootOf("midnight", CUSTOM)).toEqual({
      theme: "midnight",
      base: "midnight",
      scheme: "dark",
      fingerprint: null,
    });
  });

  it("takes the preset and the scheme of the custom theme", () => {
    expect(bootOf("custom", CUSTOM)).toEqual({
      theme: "custom",
      base: "ocean",
      scheme: "light",
      fingerprint: FINGERPRINT,
    });
  });

  it("paints the factory theme when custom is chosen but no custom theme exists", () => {
    expect(bootOf("custom", null)).toEqual(FACTORY_BOOT);
  });
});

describe("the factory theme parameter", () => {
  it("is asked only by its exact value", () => {
    expect(asksForFactoryTheme("?setTheme=default")).toBe(true);
    expect(asksForFactoryTheme("?a=1&setTheme=default")).toBe(true);
    expect(asksForFactoryTheme("?setTheme=dark")).toBe(false);
    expect(asksForFactoryTheme("")).toBe(false);
  });

  it("is stripped from the address without touching the rest", () => {
    expect(withoutFactoryThemeParam("https://app.example/library?view=grid&setTheme=default#top")).toBe(
      "/library?view=grid#top"
    );
    expect(withoutFactoryThemeParam("https://app.example/?setTheme=default")).toBe("/");
  });

  it("is honoured by the script that runs before the first paint", () => {
    const root = document.documentElement;
    root.setAttribute(THEME_ATTRIBUTE, "custom");
    root.setAttribute(THEME_BASE_ATTRIBUTE, "ocean");
    window.history.replaceState(null, "", "/?setTheme=default");
    new Function(THEME_BOOT_SCRIPT)();
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    expect(root.hasAttribute(THEME_BASE_ATTRIBUTE)).toBe(false);
  });

  it("silences the custom sheet the server linked, before the first paint", () => {
    const sheet = serverSheet();
    window.history.replaceState(null, "", "/?setTheme=default");
    new Function(THEME_BOOT_SCRIPT)();
    expect(sheet.media).toBe("not all");
  });

  it("leaves the theme and its sheet alone without the parameter", () => {
    const root = document.documentElement;
    const sheet = serverSheet();
    root.setAttribute(THEME_ATTRIBUTE, "custom");
    root.setAttribute(THEME_BASE_ATTRIBUTE, "ocean");
    new Function(THEME_BOOT_SCRIPT)();
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("custom");
    expect(root.getAttribute(THEME_BASE_ATTRIBUTE)).toBe("ocean");
    expect(sheet.media).toBe("");
  });
});

describe("paintTheme", () => {
  it("sets the theme and its preset on the root and drops the preset under a preset theme", () => {
    paintTheme(document, { theme: "custom", base: "ocean", scheme: "dark", fingerprint: null }, null);
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("custom");
    expect(document.documentElement.getAttribute(THEME_BASE_ATTRIBUTE)).toBe("ocean");
    paintTheme(document, { theme: "midnight", base: "midnight", scheme: "dark", fingerprint: null }, null);
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("midnight");
    expect(document.documentElement.hasAttribute(THEME_BASE_ATTRIBUTE)).toBe(false);
  });

  it("keeps the old sheet until the new one has loaded, then leaves exactly one", () => {
    paintTheme(document, { theme: "custom", base: "dark", scheme: "dark", fingerprint: FINGERPRINT }, null);
    settle(sheets()[0]);
    paintTheme(document, { theme: "custom", base: "dark", scheme: "dark", fingerprint: OTHER_FINGERPRINT }, null);
    expect(sheets().map((sheet) => sheet.getAttribute("href"))).toEqual([
      sheetHref(FINGERPRINT),
      sheetHref(OTHER_FINGERPRINT),
    ]);
    settle(sheets()[1]);
    expect(sheets().map((sheet) => sheet.getAttribute("href"))).toEqual([sheetHref(OTHER_FINGERPRINT)]);
    expect(sheets()[0].id).toBe(THEME_SHEET_ID);
    expect(sheets()[0].hasAttribute(THEME_SHEET_PENDING_ATTRIBUTE)).toBe(false);
  });

  it("does not link the same sheet twice when painted again before it loaded", () => {
    const boot = { theme: "custom", base: "dark", scheme: "dark", fingerprint: FINGERPRINT } as const;
    paintTheme(document, boot, null);
    paintTheme(document, boot, null);
    expect(sheets()).toHaveLength(1);
  });

  it("abandons a sheet that was still loading when a newer one is asked", () => {
    paintTheme(document, { theme: "custom", base: "dark", scheme: "dark", fingerprint: FINGERPRINT }, null);
    paintTheme(document, { theme: "custom", base: "dark", scheme: "dark", fingerprint: OTHER_FINGERPRINT }, null);
    expect(sheets().map((sheet) => sheet.getAttribute("href"))).toEqual([sheetHref(OTHER_FINGERPRINT)]);
  });

  it("removes the sheet when the account has no custom theme", () => {
    paintTheme(document, { theme: "custom", base: "dark", scheme: "dark", fingerprint: FINGERPRINT }, null);
    settle(sheets()[0]);
    paintTheme(document, FACTORY_BOOT, null);
    expect(sheets()).toHaveLength(0);
  });

  it("paints a draft in its own style element and silences the saved sheet meanwhile", () => {
    const boot = { theme: "custom", base: "dark", scheme: "dark", fingerprint: FINGERPRINT } as const;
    paintTheme(document, boot, null);
    settle(sheets()[0]);
    paintTheme(document, boot, '[data-theme="custom"]{--ring:red}');
    expect(document.getElementById(THEME_DRAFT_ID)?.textContent).toBe('[data-theme="custom"]{--ring:red}');
    expect(sheets()[0].disabled).toBe(true);
    paintTheme(document, boot, '[data-theme="custom"]{--ring:blue}');
    expect(document.head.querySelectorAll(`#${THEME_DRAFT_ID}`)).toHaveLength(1);
    expect(document.getElementById(THEME_DRAFT_ID)?.textContent).toBe('[data-theme="custom"]{--ring:blue}');
    paintTheme(document, boot, null);
    expect(document.getElementById(THEME_DRAFT_ID)).toBeNull();
    expect(sheets()[0].disabled).toBe(false);
  });

  it("writes draft text as text, so markup inside it stays inert", () => {
    paintTheme(document, FACTORY_BOOT, "</style><img id=leak src=x>");
    expect(document.getElementById("leak")).toBeNull();
    expect(document.getElementById(THEME_DRAFT_ID)?.textContent).toBe("</style><img id=leak src=x>");
  });

  it("silences a sheet that finishes loading while a draft is painted", () => {
    const boot = { theme: "custom", base: "dark", scheme: "dark", fingerprint: FINGERPRINT } as const;
    paintTheme(document, boot, "a{}");
    settle(sheets()[0]);
    expect(sheets()[0].disabled).toBe(true);
  });

  it("announces every paint so other windows can follow", () => {
    const paints = heardPaints();
    paintTheme(document, FACTORY_BOOT, null);
    paints.stop();
    expect(paints.count()).toBe(1);
  });

  it("keeps the current theme painted until the custom sheet has loaded, then switches once", () => {
    const root = document.documentElement;
    paintTheme(document, { theme: "ocean", base: "ocean", scheme: "dark", fingerprint: null }, null);
    const paints = heardPaints();
    paintTheme(document, { theme: "custom", base: "midnight", scheme: "light", fingerprint: FINGERPRINT }, null);
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("ocean");
    expect(root.hasAttribute(THEME_BASE_ATTRIBUTE)).toBe(false);
    expect(paints.count()).toBe(0);
    settle(sheets()[0]);
    paints.stop();
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("custom");
    expect(root.getAttribute(THEME_BASE_ATTRIBUTE)).toBe("midnight");
    expect(paints.count()).toBe(1);
  });

  it("paints a draft at once, without waiting for the saved sheet", () => {
    paintTheme(document, { theme: "custom", base: "dark", scheme: "dark", fingerprint: FINGERPRINT }, "a{}");
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("custom");
    expect(document.getElementById(THEME_DRAFT_ID)?.textContent).toBe("a{}");
  });

  it("keeps a saved draft on screen until the sheet that replaces it has loaded", () => {
    const boot = { theme: "custom", base: "dark", scheme: "dark", fingerprint: FINGERPRINT } as const;
    paintTheme(document, boot, null);
    settle(sheets()[0]);
    paintTheme(document, boot, "a{}");
    paintTheme(document, { ...boot, fingerprint: OTHER_FINGERPRINT }, null);
    expect(document.getElementById(THEME_DRAFT_ID)?.textContent).toBe("a{}");
    expect(sheets()[0].disabled).toBe(true);
    settle(sheets()[1]);
    expect(document.getElementById(THEME_DRAFT_ID)).toBeNull();
    expect(sheets().map((sheet) => sheet.getAttribute("href"))).toEqual([sheetHref(OTHER_FINGERPRINT)]);
    expect(sheets()[0].disabled).toBe(false);
  });

  it("paints the latest request, not the one that asked for the sheet, when it loads", () => {
    const boot = { theme: "custom", base: "dark", scheme: "dark", fingerprint: FINGERPRINT } as const;
    paintTheme(document, boot, null);
    paintTheme(document, boot, "a{}");
    settle(sheets()[0]);
    expect(document.getElementById(THEME_DRAFT_ID)?.textContent).toBe("a{}");
    expect(sheets()[0].disabled).toBe(true);
  });

  it("never paints a theme whose sheet was abandoned for a preset", () => {
    const root = document.documentElement;
    paintTheme(document, { theme: "custom", base: "dark", scheme: "dark", fingerprint: FINGERPRINT }, null);
    const abandoned = sheets()[0];
    paintTheme(document, { theme: "ocean", base: "ocean", scheme: "dark", fingerprint: null }, null);
    settle(abandoned);
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("ocean");
    expect(sheets()).toHaveLength(0);
  });
});
