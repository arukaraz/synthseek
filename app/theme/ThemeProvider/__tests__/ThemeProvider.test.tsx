import { cleanup, fireEvent, render } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { THEME_ATTRIBUTE, THEME_BASE_ATTRIBUTE, THEME_DRAFT_ID, THEME_SHEET_ID } from "../constants";
import { sheetHref } from "../helpers";
import type { CustomThemeSummary, Theme, ThemeBoot } from "../types";

interface Session {
  currentUser: { id: string } | null;
  isLoading: boolean;
  isError: boolean;
}

const mutate = vi.fn();
const forget = vi.fn();
let stateData: { theme: Theme; custom: CustomThemeSummary | null } | undefined;
let session: Session;

vi.mock("@hooks/api/queries/theme", () => ({
  useThemeState: () => ({ data: stateData }),
  useForgetTheme: () => forget,
}));

vi.mock("@hooks/api/mutations/theme", () => ({
  useSelectTheme: () => ({ mutate, isPending: false, variables: undefined }),
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => session,
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

const SIGNED_OUT: Session = { currentUser: null, isLoading: false, isError: false };

function signedInAs(id: string): Session {
  return { currentUser: { id }, isLoading: false, isError: false };
}

function paintedTheme(): string | null {
  return document.documentElement.getAttribute(THEME_ATTRIBUTE);
}

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
  session = signedInAs("u1");
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

  it("paints the factory theme and drops the custom sheet once the account signs out in the tab", () => {
    serverSheet();
    stateData = { theme: "custom", custom: CUSTOM };
    const { rerender } = render(<ThemeProvider boot={CUSTOM_BOOT}>page</ThemeProvider>);

    session = SIGNED_OUT;
    rerender(<ThemeProvider boot={CUSTOM_BOOT}>page</ThemeProvider>);

    expect(sheets()).toHaveLength(0);
    expect(paintedTheme()).toBe("dark");
    expect(document.documentElement.hasAttribute(THEME_BASE_ATTRIBUTE)).toBe(false);
    expect(forget).toHaveBeenCalledTimes(1);
  });

  it("never paints an account's unsaved draft for the next account that signs in on the tab", () => {
    serverSheet();
    stateData = { theme: "custom", custom: CUSTOM };
    const page = () => (
      <ThemeProvider boot={CUSTOM_BOOT}>
        <DraftHolder />
      </ThemeProvider>
    );
    const { getByRole, rerender } = render(page());
    fireEvent.click(getByRole("button", { name: "edit" }));
    expect(document.getElementById(THEME_DRAFT_ID)).not.toBeNull();

    session = SIGNED_OUT;
    rerender(page());
    session = signedInAs("u2");
    rerender(page());

    expect(document.getElementById(THEME_DRAFT_ID)).toBeNull();
  });

  it("never paints the previous account's theme for the next account that signs in on the tab", () => {
    serverSheet();
    stateData = { theme: "custom", custom: CUSTOM };
    const { rerender } = render(<ThemeProvider boot={CUSTOM_BOOT}>page</ThemeProvider>);
    session = SIGNED_OUT;
    stateData = undefined;
    rerender(<ThemeProvider boot={CUSTOM_BOOT}>page</ThemeProvider>);

    session = signedInAs("u2");
    rerender(<ThemeProvider boot={CUSTOM_BOOT}>page</ThemeProvider>);

    expect(sheets()).toHaveLength(0);
    expect(paintedTheme()).toBe("dark");

    stateData = { theme: "ocean", custom: null };
    rerender(<ThemeProvider boot={CUSTOM_BOOT}>page</ThemeProvider>);

    expect(paintedTheme()).toBe("ocean");
  });

  it("forgets the theme it holds when the account changes without a sign-out", () => {
    serverSheet();
    stateData = { theme: "custom", custom: CUSTOM };
    const { rerender } = render(<ThemeProvider boot={CUSTOM_BOOT}>page</ThemeProvider>);
    forget.mockImplementationOnce(() => {
      stateData = undefined;
    });

    session = signedInAs("u2");
    rerender(<ThemeProvider boot={CUSTOM_BOOT}>page</ThemeProvider>);
    rerender(<ThemeProvider boot={CUSTOM_BOOT}>page</ThemeProvider>);

    expect(forget).toHaveBeenCalledTimes(1);
    expect(sheets()).toHaveLength(0);
    expect(paintedTheme()).toBe("dark");
  });

  it("paints the factory theme on a page that arrives signed out with a leftover theme cookie", () => {
    serverSheet();
    session = SIGNED_OUT;
    render(<ThemeProvider boot={CUSTOM_BOOT}>page</ThemeProvider>);

    expect(sheets()).toHaveLength(0);
    expect(paintedTheme()).toBe("dark");
  });

  it("keeps the server's first paint while the session is still being read", () => {
    serverSheet();
    session = { currentUser: null, isLoading: true, isError: false };
    render(<ThemeProvider boot={CUSTOM_BOOT}>page</ThemeProvider>);

    expect(sheets().map((sheet) => sheet.getAttribute("href"))).toEqual([sheetHref(FINGERPRINT)]);
    expect(paintedTheme()).toBe("custom");
    expect(forget).not.toHaveBeenCalled();
  });

  it("keeps the server's first paint when the session could not be read", () => {
    serverSheet();
    session = { currentUser: null, isLoading: false, isError: true };
    render(<ThemeProvider boot={CUSTOM_BOOT}>page</ThemeProvider>);

    expect(sheets().map((sheet) => sheet.getAttribute("href"))).toEqual([sheetHref(FINGERPRINT)]);
    expect(paintedTheme()).toBe("custom");
    expect(forget).not.toHaveBeenCalled();
  });

  it("keeps the server's first paint for the account the page was loaded for until its theme arrives", () => {
    serverSheet();
    render(<ThemeProvider boot={CUSTOM_BOOT}>page</ThemeProvider>);

    expect(sheets().map((sheet) => sheet.getAttribute("href"))).toEqual([sheetHref(FINGERPRINT)]);
    expect(paintedTheme()).toBe("custom");
    expect(forget).not.toHaveBeenCalled();
  });

  it("reads the same account twice without taking it for a change of account", () => {
    serverSheet();
    render(
      <StrictMode>
        <ThemeProvider boot={CUSTOM_BOOT}>page</ThemeProvider>
      </StrictMode>
    );

    expect(sheets().map((sheet) => sheet.getAttribute("href"))).toEqual([sheetHref(FINGERPRINT)]);
    expect(paintedTheme()).toBe("custom");
    expect(forget).not.toHaveBeenCalled();
  });
});
