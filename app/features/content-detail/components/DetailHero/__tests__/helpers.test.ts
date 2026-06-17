import { describe, expect, it } from "vitest";

import { SHARE_FAN_STAGGER_MS } from "../constants";
import { buildSocialLinks, shareFanItemCss, shareFanItemStyle } from "../helpers";

describe("DetailHero helpers", () => {
  describe("buildSocialLinks", () => {
    it("returns an empty list when socials is null", () => {
      expect(buildSocialLinks(null)).toEqual([]);
    });

    it("keeps only the populated brands and orders them deterministically", () => {
      const links = buildSocialLinks({
        instagram: "https://instagram.com/x",
        youtube: null,
        appleMusic: "https://music.apple.com/x",
        spotify: "https://open.spotify.com/x",
      });

      expect(links).toEqual([
        { brand: "instagram", url: "https://instagram.com/x" },
        { brand: "appleMusic", url: "https://music.apple.com/x" },
        { brand: "spotify", url: "https://open.spotify.com/x" },
      ]);
    });
  });

  describe("shareFanItemStyle", () => {
    it("staggers the open delay forward and the close delay in reverse", () => {
      const total = 4;
      const first = shareFanItemStyle(0, total);
      const last = shareFanItemStyle(total - 1, total);

      expect(first.openDelay).toBe(0);
      expect(first.closeDelay).toBe((total - 1) * SHARE_FAN_STAGGER_MS);
      expect(last.openDelay).toBe((total - 1) * SHARE_FAN_STAGGER_MS);
      expect(last.closeDelay).toBe(0);
    });

    it("hugs the right rim of the avatar, top-right descending to lower-right", () => {
      const total = 4;
      const items = Array.from({ length: total }, (_, i) => shareFanItemStyle(i, total));

      for (const item of items) expect(item.tx).toBeGreaterThan(0);
      for (let i = 1; i < total; i++) expect(items[i].ty).toBeGreaterThan(items[i - 1].ty);
    });

    it("keeps the bottom-right corner clear for the share FAB", () => {
      const total = 4;
      const last = shareFanItemStyle(total - 1, total);

      expect(last.ty).toBeLessThan(60);
    });

    it("does not divide by zero for a single item", () => {
      const only = shareFanItemStyle(0, 1);
      expect(only.openDelay).toBe(0);
      expect(only.closeDelay).toBe(0);
    });
  });

  describe("shareFanItemCss", () => {
    it("emits the translation custom properties when open", () => {
      const geometry = shareFanItemStyle(1, 4);
      const css = shareFanItemCss(geometry, true);

      expect(css).toMatchObject({
        "--share-tx": `${geometry.tx}px`,
        "--share-ty": `${geometry.ty}px`,
        "--share-delay": `${geometry.openDelay}ms`,
      });
    });

    it("emits only the reverse delay when collapsed", () => {
      const geometry = shareFanItemStyle(1, 4);
      const css = shareFanItemCss(geometry, false);

      expect(css).toEqual({ "--share-delay": `${geometry.closeDelay}ms` });
    });
  });
});
