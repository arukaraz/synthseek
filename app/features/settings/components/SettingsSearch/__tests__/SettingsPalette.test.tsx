import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

const state = vi.hoisted(() => {
  const push = vi.fn();
  return { isAdmin: true, push, router: { push }, mutate: vi.fn() };
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings/account",
  useRouter: () => state.router,
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: state.isAdmin, currentUser: null, isLoading: false }),
}));

vi.mock("@hooks/api/mutations/jobs/useTriggerJob", () => ({
  useTriggerJob: () => ({ mutate: state.mutate }),
}));

import { SETTINGS_PAGES } from "../../../constants";
import { PALETTE_ACTION_LIMIT, SETTINGS_PALETTE_ACTIONS } from "../constants";
import { SettingsPalette } from "../SettingsPalette";

const t = i18n.getFixedT("en", "settings");
const copy = enSettings.shell.palette;

function renderPalette() {
  const onOpenChange = vi.fn();
  render(<SettingsPalette open onOpenChange={onOpenChange} />);
  const dialog = screen.getByRole("dialog", { name: copy.title });
  return { onOpenChange, dialog, input: within(dialog).getByRole("textbox", { name: copy.placeholder }) };
}

function itemTexts(dialog: HTMLElement): string[] {
  return within(dialog)
    .queryAllByRole("button")
    .map((button) => button.textContent ?? "");
}

beforeEach(() => {
  state.isAdmin = true;
  state.push.mockReset();
  state.mutate.mockReset();
});

describe("SettingsPalette with an empty query", () => {
  it("lists the first actions then every page for an admin", () => {
    const { dialog } = renderPalette();
    const expectedActions = SETTINGS_PALETTE_ACTIONS.slice(0, PALETTE_ACTION_LIMIT).map((action) => t(action.labelKey));
    const expectedPages = SETTINGS_PAGES.map((page) => `${t(page.labelKey)}${t(page.descriptionKey)}`);
    const texts = itemTexts(dialog);
    expect(texts.slice(0, PALETTE_ACTION_LIMIT).map((text, index) => text.startsWith(expectedActions[index]))).toEqual(
      expectedActions.map(() => true)
    );
    expect(texts.slice(PALETTE_ACTION_LIMIT)).toEqual(expectedPages);
    expect(within(dialog).getByText(copy.actions)).toBeInTheDocument();
    expect(within(dialog).getByText(copy.pages)).toBeInTheDocument();
  });

  it("opens a picked page", async () => {
    const { dialog, onOpenChange } = renderPalette();
    const media = within(dialog)
      .getAllByRole("button")
      .find((button) => button.textContent?.startsWith(t("shell.pages.media.title")));
    expect(media).toBeDefined();
    if (media) await userEvent.click(media);
    expect(state.push).toHaveBeenCalledWith("/settings/media");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("hides server pages and their actions from a member", () => {
    state.isAdmin = false;
    const { dialog } = renderPalette();
    const texts = itemTexts(dialog).join("\n");
    expect(texts).toContain(t("shell.pages.account.title"));
    expect(texts).toContain(t("shell.pages.about.title"));
    expect(texts).not.toContain(t("shell.pages.members.title"));
    expect(texts).not.toContain(t("shell.pages.overview.title"));
    expect(texts).not.toContain(t("shell.palette.actionLabels.runLibraryScan"));
    expect(texts).toContain(t("shell.palette.actionLabels.checkForUpdates"));
    expect(texts).toContain(t("shell.palette.actionLabels.newApiKey"));
  });
});

describe("SettingsPalette searching", () => {
  it("filters settings by the query and labels the group as settings", async () => {
    const { dialog, input } = renderPalette();
    await userEvent.type(input, "endpoint");
    const texts = itemTexts(dialog);
    expect(texts).toEqual([
      `${t("mcp.endpointLabel")}${i18n.t("settings:shell.search.place", {
        page: t("shell.pages.apps.title"),
        place: t("mcp.title"),
      })}`,
    ]);
    expect(within(dialog).getByText(copy.settings)).toBeInTheDocument();
    expect(within(dialog).queryByText(copy.actions)).not.toBeInTheDocument();
  });

  it("says nothing matched", async () => {
    const { dialog, input } = renderPalette();
    await userEvent.type(input, "qqqzzzx");
    expect(itemTexts(dialog)).toEqual([]);
    expect(within(dialog).getByText(i18n.t("settings:shell.palette.empty", { query: "qqqzzzx" }))).toBeInTheDocument();
  });

  it("navigates to the anchor of a picked setting and closes", async () => {
    const { dialog, input, onOpenChange } = renderPalette();
    await userEvent.type(input, "endpoint");
    await userEvent.click(within(dialog).getByRole("button"));
    expect(state.push).toHaveBeenCalledWith("/settings/apps#ai-assistants");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(state.mutate).not.toHaveBeenCalled();
  });
});

describe("SettingsPalette keyboard", () => {
  it("picks the first item on Enter", async () => {
    const { input } = renderPalette();
    input.focus();
    await userEvent.keyboard("{Enter}");
    expect(state.push).toHaveBeenCalledWith(SETTINGS_PALETTE_ACTIONS[0].href);
  });

  it("moves down and back up before picking", async () => {
    const { input } = renderPalette();
    input.focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowUp}{Enter}");
    expect(state.push).toHaveBeenCalledWith(SETTINGS_PALETTE_ACTIONS[1].href);
  });

  it("does not move above the first item", async () => {
    const { input } = renderPalette();
    input.focus();
    await userEvent.keyboard("{ArrowUp}{ArrowUp}{Enter}");
    expect(state.push).toHaveBeenCalledWith(SETTINGS_PALETTE_ACTIONS[0].href);
  });

  it("does not move past the last item", async () => {
    const { input } = renderPalette();
    await userEvent.type(input, "endpoint");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(state.push).toHaveBeenCalledWith("/settings/apps#ai-assistants");
  });

  it("does nothing on Enter when nothing matches", async () => {
    const { input, onOpenChange } = renderPalette();
    await userEvent.type(input, "qqqzzzx{Enter}");
    expect(state.push).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("follows the pointer", async () => {
    const { dialog, input } = renderPalette();
    const third = within(dialog).getAllByRole("button")[2];
    await userEvent.hover(third);
    input.focus();
    await userEvent.keyboard("{Enter}");
    expect(state.push).toHaveBeenCalledWith(SETTINGS_PALETTE_ACTIONS[2].href);
  });

  it("closes on Escape", async () => {
    const { input, onOpenChange } = renderPalette();
    input.focus();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(state.push).not.toHaveBeenCalled();
  });
});

describe("SettingsPalette actions", () => {
  it("navigates to the scan and starts the library scan job", async () => {
    const { dialog, onOpenChange } = renderPalette();
    const scan = within(dialog)
      .getAllByRole("button")
      .find((button) => button.textContent?.startsWith(t("shell.palette.actionLabels.runLibraryScan")));
    expect(scan).toBeDefined();
    if (scan) await userEvent.click(scan);
    expect(state.push).toHaveBeenCalledWith("/settings/library/scan#library-scan");
    expect(state.mutate).toHaveBeenCalledWith({ id: "library-scan" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("starts no job for an action that only navigates", async () => {
    const { input } = renderPalette();
    await userEvent.type(input, t("shell.palette.actionLabels.checkForUpdates"));
    await userEvent.keyboard("{Enter}");
    expect(state.push).toHaveBeenCalledWith("/settings/about");
    expect(state.mutate).not.toHaveBeenCalled();
  });
});
