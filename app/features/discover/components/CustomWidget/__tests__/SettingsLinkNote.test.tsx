import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { FeedNeed } from "@hooks/api/queries/widgets/types";
import i18n from "@locale";
import { SUPPORTED_LOCALES } from "@modules/i18n/config";
import { render, screen } from "@test/test-utils";

const auth = vi.hoisted(() => ({ isAdmin: true }));

vi.mock("@modules/providers/AuthProvider", () => ({ useAuthContext: () => auth }));

import { SETTINGS_SEARCH_ENTRIES } from "../../../../settings/components/SettingsSearch/constants";
import { FEED_NEED_HREFS } from "../constants";
import { feedNeedNote } from "../helpers";
import { SettingsLinkNote } from "../SettingsLinkNote";
import type { SettingsLinkNoteProps } from "../types";

const NEEDS: FeedNeed[] = [
  "lastfm",
  "listenbrainz",
  "bandsintown",
  "mediaServer",
  "plex",
  "jellyfin",
  "navidrome",
  "lidarr",
];

const NOTES: SettingsLinkNoteProps[] = [
  ...NEEDS.map(feedNeedNote),
  { i18nKey: "customWidget.events.refused", href: FEED_NEED_HREFS.bandsintown },
];

beforeEach(async () => {
  auth.isAdmin = true;
  await i18n.changeLanguage("en");
});

afterAll(async () => {
  await i18n.changeLanguage("en");
});

describe("SettingsLinkNote", () => {
  it("knows a link for every need the widgets can report", () => {
    expect(Object.keys(FEED_NEED_HREFS).sort()).toEqual([...NEEDS].sort());
  });

  it.each(SUPPORTED_LOCALES)(
    "draws every setup note in %s with a link that has words and its target",
    async (locale) => {
      await i18n.changeLanguage(locale);

      for (const note of NOTES) {
        const { unmount } = render(<SettingsLinkNote {...note} />);
        const link = screen.getByRole("link");
        expect(link.textContent?.trim(), `${locale} ${note.i18nKey}`).not.toBe("");
        expect(link).toHaveAttribute("href", note.href);
        unmount();
      }
    }
  );

  it.each(NEEDS)("links %s to a place the settings search knows", (need) => {
    const target = new URL(FEED_NEED_HREFS[need], "http://synthseek.test");
    const anchor = target.hash.slice(1);

    expect(
      SETTINGS_SEARCH_ENTRIES.some(
        (entry) => entry.href === `${target.pathname}${target.search}` && (anchor === "" || entry.anchor === anchor)
      )
    ).toBe(true);
  });

  it("keeps the words but drops the link for a member who cannot open an admin page", () => {
    auth.isAdmin = false;
    const { container } = render(<SettingsLinkNote {...feedNeedNote("lidarr")} />);

    expect(screen.queryByRole("link")).toBeNull();
    expect(container).toHaveTextContent(/^Configure Lidarr to fill this widget\./);
  });

  it("still links a member to a page of their own", () => {
    auth.isAdmin = false;
    render(<SettingsLinkNote {...feedNeedNote("listenbrainz")} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", FEED_NEED_HREFS.listenbrainz);
  });
});
