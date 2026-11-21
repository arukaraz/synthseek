import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { THEME_ATTRIBUTE, THEME_BASE_ATTRIBUTE, THEME_DRAFT_ID, THEME_SHEET_ID } from "../constants";
import { sheetHref } from "../helpers";
import type { CustomThemeSummary, Theme, ThemeBoot } from "../types";

const mutate = vi.fn();
let stateData: { theme: Theme; custom: CustomThemeSummary | null } | undefined;

vi.mock("@hooks/api/queries/theme", () => ({
  useThemeState: () => ({ data: stateData }),
}));

vi.mock("@hooks/api/mutations/theme", () => ({
  useSelectTheme: () => ({ mutate, isPending: false, variables: undefined }),
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: { id: "u1" } }),
}));

vi.mock("../ThemeFavicon", () => ({ ThemeFavicon: () => null }));

import { ThemeProvider, useThemeContext } from "../ThemeProvider";

const FINGERPRINT = "0123456789abcdef";

const CUSTOM: CustomThemeSummary = {
  name: "Mine",
  scheme: "dark",
  startedFrom: "ocean",
  follows: [],
  fingerprint: FINGERPRINT,
  folder: "alex",
};

const CUSTOM_BOOT: ThemeBoot = { theme: "custom", base: "ocean", scheme: "dark", fingerprint: FINGERPRINT };
const DRAFT = { css: "@keyframes spin{to{opacity:0}}", base: "ocean", scheme: "dark", unsaved: true } as const;

function serverSheet(): HTMLLinkElement {
  const sheet = document.createElement("link");
  sheet.id = THEME_SHEET_ID;
  sheet.rel = "stylesheet";
  sheet.href = sheetHref(FINGERPRINT);
  document.head.appendChild(sheet);
  return sheet;
}

function sheets(): HTMLLinkElement[] {
  return Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'));
}

function DraftHolder() {
  const { applyDraft } = useThemeContext();
  return (
    <button type="button" onClick={() => applyDraft(DRAFT)}>
      edit
    </button>
  );
}

beforeEach(() => {
  stateData = undefined;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.history.replaceState(null, "", "/");
  document.head.innerHTML = "";
  document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  document.documentElement.removeAttribute(THEME_BASE_ATTRIBUTE);
});

describe("ThemeProvider", () => {
  it("keeps the custom sheet on the page while Custom is the account's theme", () => {
    serverSheet();
    stateData = { theme: "custom", custom: CUSTOM };
    render(<ThemeProvider boot={CUSTOM_BOOT}>page</ThemeProvider>);

    expect(sheets().map((sheet) => sheet.getAttribute("href"))).toEqual([sheetHref(FINGERPRINT)]);
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("custom");
  });

  it("takes the custom sheet off the page once the account's theme is a preset", () => {
    serverSheet();
    stateData = { theme: "custom", custom: CUSTOM };
    const { rerender } = render(<ThemeProvider boot={CUSTOM_BOOT}>page</ThemeProvider>);

    stateData = { theme: "midnight", custom: CUSTOM };
    rerender(<ThemeProvider boot={CUSTOM_BOOT}>page</ThemeProvider>);

    expect(sheets()).toHaveLength(0);
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("midnight");
  });

  it("never links the custom sheet for an account whose theme is a preset", () => {
    stateData = { theme: "ocean", custom: CUSTOM };
    render(
      <ThemeProvider boot={{ theme: "ocean", base: "ocean", scheme: "dark", fingerprint: null }}>page</ThemeProvider>
    );

    expect(sheets()).toHaveLength(0);
  });

  it("takes the custom sheet and an unsaved draft off the page when the factory theme is asked by address", () => {
    window.history.replaceState(null, "", "/settings?setTheme=default");
    serverSheet();
    stateData = { theme: "custom", custom: CUSTOM };
    const { getByRole } = render(
      <ThemeProvider boot={CUSTOM_BOOT}>
        <DraftHolder />
      </ThemeProvider>
    );
    fireEvent.click(getByRole("button", { name: "edit" }));

    expect(sheets()).toHaveLength(0);
    expect(document.getElementById(THEME_DRAFT_ID)).toBeNull();
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    expect(mutate).toHaveBeenCalledWith({ theme: "dark" }, expect.anything());
  });
});
