import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { APP_TITLE } from "@components/Player";

import { usePlayerDocumentTitle } from "../useDocumentTitle";

beforeEach(() => {
  document.title = "";
});

describe("usePlayerDocumentTitle", () => {
  it("puts what is playing in the tab title", () => {
    renderHook(() => usePlayerDocumentTitle("Digital Love - Daft Punk"));

    expect(document.title).toBe("Digital Love - Daft Punk");
  });

  it("falls back to the product name when nothing is playing", () => {
    renderHook(() => usePlayerDocumentTitle(null));

    expect(document.title).toBe(APP_TITLE);
  });

  it("follows the queue on to the next track", () => {
    const { rerender } = renderHook((title: string | null) => usePlayerDocumentTitle(title), {
      initialProps: "Digital Love - Daft Punk" as string | null,
    });

    rerender("One More Time - Daft Punk");

    expect(document.title).toBe("One More Time - Daft Punk");
  });

  it("gives the tab title back when the player goes away", () => {
    const { unmount } = renderHook(() => usePlayerDocumentTitle("Digital Love - Daft Punk"));

    unmount();

    expect(document.title).toBe(APP_TITLE);
  });
});
