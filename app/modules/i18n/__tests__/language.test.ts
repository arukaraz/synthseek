import { afterEach, describe, expect, it } from "vitest";

import i18n from "@locale";

afterEach(async () => {
  await i18n.changeLanguage("en");
});

describe("document language", () => {
  it("follows an in-place language switch", async () => {
    await i18n.changeLanguage("es");
    expect(document.documentElement.lang).toBe("es");

    await i18n.changeLanguage("de");
    expect(document.documentElement.lang).toBe("de");
  });

  it("returns to the default language with the switch back", async () => {
    await i18n.changeLanguage("fr");
    await i18n.changeLanguage("en");

    expect(document.documentElement.lang).toBe("en");
  });
});
