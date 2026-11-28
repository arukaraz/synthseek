import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { publishNowPlayingTitle, readNowPlayingTitle } from "@utils/nowPlayingTitle";

import { usePlayerDocumentTitle } from "../useDocumentTitle";

beforeEach(() => {
  publishNowPlayingTitle(null);
});

describe("usePlayerDocumentTitle", () => {
  it("hands what is playing to the owner of the tab title", () => {
    renderHook(() => usePlayerDocumentTitle("Digital Love - Daft Punk"));

    expect(readNowPlayingTitle()).toBe("Digital Love - Daft Punk");
  });

  it("publishes nothing when nothing is playing", () => {
    renderHook(() => usePlayerDocumentTitle(null));

    expect(readNowPlayingTitle()).toBeNull();
  });

  it("follows the queue on to the next track", () => {
    const { rerender } = renderHook((title: string | null) => usePlayerDocumentTitle(title), {
      initialProps: "Digital Love - Daft Punk" as string | null,
    });

    rerender("One More Time - Daft Punk");

    expect(readNowPlayingTitle()).toBe("One More Time - Daft Punk");
  });

  it("gives the tab title back when the player goes away", () => {
    const { unmount } = renderHook(() => usePlayerDocumentTitle("Digital Love - Daft Punk"));

    unmount();

    expect(readNowPlayingTitle()).toBeNull();
  });
});
