import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

import { SettingsIndexScreen } from "../SettingsIndexScreen";

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches,
      media: "(min-width: 768px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("SettingsIndexScreen", () => {
  it("redirects to the general page on desktop widths", () => {
    stubMatchMedia(true);
    render(<SettingsIndexScreen />);

    expect(replace).toHaveBeenCalledWith("/settings/general");
  });

  it("does not redirect on narrow viewports", () => {
    stubMatchMedia(false);
    render(<SettingsIndexScreen />);

    expect(replace).not.toHaveBeenCalled();
  });

  it("renders nothing", () => {
    stubMatchMedia(false);
    const { container } = render(<SettingsIndexScreen />);

    expect(container).toBeEmptyDOMElement();
  });
});
