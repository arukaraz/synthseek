import { describe, expect, it } from "vitest";

import { previewButton } from "@components/ui/PreviewButton/styles";
import { queueAddReveal } from "@components/ui/QueueAddButton/styles";
import { coverPlayVeil } from "@features/content-detail/components/TrackCoverPlay/styles";
import { primaryCellPlay } from "@features/library/components/LibraryTable/styles";
import { playlistRowHover } from "@features/content-detail/components/PlaylistTracklist/styles";
import { trackPlayButton, trackRetryButton } from "@features/content-detail/styles";
import { spotlightDismiss, spotlightPlay } from "@features/discover/components/ArtistSpotlight/styles";
import { cardAction, cardRequestAction, mosaicButton } from "@features/discover/components/CustomWidget/styles";
import { playButton } from "@features/discover/components/PlaySetCard/styles";
import { widgetRowCoverAction } from "@features/discover/components/WidgetRow/styles";
import { cardCoverActions, cardCoverScrim, cardSelectBox } from "@features/library/components/LibraryCard/styles";
import { galleryArrow } from "@features/settings/components/WhatsNew/styles";

interface Revealed {
  name: string;
  classes: string;
}

const REVEALED: Revealed[] = [
  { name: "queueAddReveal", classes: queueAddReveal() },
  { name: "trackRetryButton", classes: trackRetryButton() },
  { name: "trackPlayButton", classes: trackPlayButton({ current: false }) },
  { name: "playlistRowHover", classes: playlistRowHover() },
  { name: "cardSelectBox", classes: cardSelectBox({ shown: false }) },
  { name: "cardCoverActions", classes: cardCoverActions() },
  { name: "galleryArrow", classes: galleryArrow({ side: "previous" }) },
  { name: "spotlightDismiss", classes: spotlightDismiss() },
  { name: "spotlightPlay", classes: spotlightPlay() },
  { name: "cardRequestAction", classes: cardRequestAction({ placement: "card" }) },
  { name: "cardAction", classes: cardAction() },
  { name: "playButton", classes: playButton({ reveal: true }) },
  { name: "widgetRowCoverAction", classes: widgetRowCoverAction() },
];

function tokens(classes: string): string[] {
  return classes.split(/\s+/).filter((token) => token.length > 0);
}

const HIDES_AT_REST = /^(sm:)?opacity-0$|^\[@media\(hover:hover\)\]:opacity-0$/;
const SHOWS_FOR_KEYBOARD = /focus-visible:opacity-100$|focus-within:opacity-100$|has-\[:focus-visible\]:opacity-100$/;
const SHOWS_WITHOUT_HOVER = /\[@media\(hover:none\)\]:opacity-100$|^\[@media\(hover:hover\)\]:opacity-0$/;

describe.each(REVEALED)("$name, an action that waits for the pointer", ({ classes }) => {
  it("still hides at rest for a mouse, exactly as before", () => {
    expect(tokens(classes).some((token) => HIDES_AT_REST.test(token))).toBe(true);
  });

  it("shows when keyboard focus is on it or inside its row", () => {
    expect(tokens(classes).some((token) => SHOWS_FOR_KEYBOARD.test(token))).toBe(true);
  });

  it("shows on a device that has no hover", () => {
    expect(tokens(classes).some((token) => SHOWS_WITHOUT_HOVER.test(token))).toBe(true);
  });

  it("stays on view only inside the accessibility mode", () => {
    const always = tokens(classes).filter((token) => /^(max-)?(sm:)?opacity-100$/.test(token));

    expect(always).toEqual([]);
    expect(tokens(classes)).toContain(
      classes.includes("[@media(hover:hover)]:opacity-0")
        ? "[@media(hover:hover)]:a11y-mode:opacity-100"
        : "a11y-mode:opacity-100"
    );
  });
});

describe.each([
  { name: "previewButton cover", classes: previewButton({ tone: "cover", state: "ready" }) },
  { name: "primaryCellPlay", classes: primaryCellPlay() },
  { name: "coverPlayVeil", classes: coverPlayVeil() },
  { name: "mosaicButton", classes: mosaicButton() },
])("$name, a play control that waited for the pointer", ({ classes }) => {
  it("hides at rest for a mouse, and stays on view inside the mode", () => {
    expect(tokens(classes).some((token) => HIDES_AT_REST.test(token))).toBe(true);
    expect(tokens(classes)).toContain("a11y-mode:opacity-100");
  });
});

describe("the what's new gallery arrows, the only swipe surface that had no buttons on a phone", () => {
  it("stay hidden on a phone for everyone and appear there only in the accessibility mode", () => {
    const arrow = tokens(galleryArrow({ side: "next" }));

    expect(arrow).toContain("hidden");
    expect(arrow).toContain("sm:grid");
    expect(arrow).toContain("a11y-mode:grid");
    expect(arrow.filter((token) => token === "grid" || token === "max-sm:grid")).toEqual([]);
  });
});

describe("the cover scrim behind library card actions", () => {
  it("only gives up its darkening where the actions themselves stay on view, never on a phone", () => {
    const scrim = tokens(cardCoverScrim());

    expect(scrim).toContain("bg-veil/45");
    expect(scrim).toContain("sm:a11y-mode:bg-transparent");
    expect(scrim).toContain("sm:[@media(hover:none)]:bg-transparent");
    expect(scrim.filter((token) => token.includes("bg-transparent") && !token.startsWith("sm:"))).toEqual([]);
  });
});
