import type { ParseKeys } from "i18next";

import type { SetupPendingItem } from "./types";

export const SETUP_ITEM_TOTAL = 3;

export const SETUP_ITEM_TARGETS: Readonly<Record<SetupPendingItem, { href: string; labelKey: ParseKeys<"discover"> }>> =
  {
    mediaServer: { href: "/settings/library/sources?server=plex#plex", labelKey: "finishSetup.items.mediaServer" },
    downloadSource: {
      href: "/settings/download/sources?source=slskd#slskd",
      labelKey: "finishSetup.items.downloadSource",
    },
    musicbrainzContact: {
      href: "/settings/metadata#connections.enrichment.musicbrainzEmail",
      labelKey: "finishSetup.items.musicbrainzContact",
    },
  };
