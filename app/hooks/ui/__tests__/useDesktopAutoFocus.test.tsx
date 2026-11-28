import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useRef } from "react";

import { DESKTOP_AUTOFOCUS_QUERY } from "../constants";
import { useDesktopAutoFocus } from "../useDesktopAutoFocus";

function Field() {
  const ref = useRef<HTMLInputElement>(null);
  useDesktopAutoFocus(ref);
  return <input ref={ref} aria-label="first field" />;
}

function stubMatchMedia(matching: (query: string) => boolean) {
  const matchMedia = vi.fn((query: string) => ({ matches: matching(query), media: query }));
  vi.stubGlobal("matchMedia", matchMedia);
  return matchMedia;
}

describe("useDesktopAutoFocus", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("focuses the field on a wide screen with a mouse", () => {
    stubMatchMedia(() => true);

    render(<Field />);

    expect(screen.getByLabelText("first field")).toHaveFocus();
  });

  it("asks for a wide screen with a real pointer, so a phone is not matched", () => {
    const matchMedia = stubMatchMedia(() => false);

    render(<Field />);

    expect(matchMedia).toHaveBeenCalledWith(DESKTOP_AUTOFOCUS_QUERY);
    expect(DESKTOP_AUTOFOCUS_QUERY).toContain("min-width: 640px");
    expect(DESKTOP_AUTOFOCUS_QUERY).toContain("pointer: fine");
  });

  it("leaves focus alone on a phone, where it would open the keyboard over the sheet", () => {
    stubMatchMedia(() => false);

    render(<Field />);

    expect(screen.getByLabelText("first field")).not.toHaveFocus();
  });

  it("leaves focus alone where the browser cannot answer media queries", () => {
    vi.stubGlobal("matchMedia", undefined);

    render(<Field />);

    expect(screen.getByLabelText("first field")).not.toHaveFocus();
  });
});
