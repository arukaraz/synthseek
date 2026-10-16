import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";

const replace = vi.fn();
const auth = { isAdmin: true, isLoading: false };

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ ...auth, currentUser: null }),
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
  auth.isAdmin = true;
  auth.isLoading = false;
});

describe("SettingsIndexScreen", () => {
  it("redirects an administrator to the server overview on desktop widths", () => {
    stubMatchMedia(true);
    render(<SettingsIndexScreen />);

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/settings/overview");
  });

  it("redirects a member to their account on desktop widths", () => {
    auth.isAdmin = false;
    stubMatchMedia(true);
    render(<SettingsIndexScreen />);

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/settings/account");
  });

  it("waits for the session to load before choosing where to redirect", () => {
    auth.isLoading = true;
    auth.isAdmin = false;
    stubMatchMedia(true);
    const { rerender } = render(<SettingsIndexScreen />);

    expect(replace).not.toHaveBeenCalled();

    auth.isLoading = false;
    auth.isAdmin = true;
    rerender(<SettingsIndexScreen />);

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/settings/overview");
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
