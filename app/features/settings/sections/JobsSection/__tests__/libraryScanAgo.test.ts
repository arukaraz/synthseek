import { describe, expect, it } from "vitest";

import deCommon from "@modules/i18n/messages/de/common.json";
import deSettings from "@modules/i18n/messages/de/settings.json";
import enCommon from "@modules/i18n/messages/en/common.json";
import enSettings from "@modules/i18n/messages/en/settings.json";
import esCommon from "@modules/i18n/messages/es/common.json";
import esSettings from "@modules/i18n/messages/es/settings.json";
import frCommon from "@modules/i18n/messages/fr/common.json";
import frSettings from "@modules/i18n/messages/fr/settings.json";

const LOCALES = [
  { locale: "en", common: enCommon, settings: enSettings },
  { locale: "es", common: esCommon, settings: esSettings },
  { locale: "fr", common: frCommon, settings: frSettings },
  { locale: "de", common: deCommon, settings: deSettings },
];

describe("the library scan's last-run line", () => {
  it.each(LOCALES)("says the relative time's own preposition once in $locale", ({ common, settings }) => {
    const relative = common.relativeTime.minutesAgo.split("{{count}}").join("38");
    const line = settings.libraryScan.header.ago.split("{{ago}}").join(relative);
    const words = line.toLowerCase().split(" ");

    expect(words.filter((word, index) => index > 0 && word === words[index - 1])).toEqual([]);
  });
});
