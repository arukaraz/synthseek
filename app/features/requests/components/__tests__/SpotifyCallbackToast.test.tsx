import { render } from "@test/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SpotifyCallbackToast } from "../SpotifyCallbackToast";

const replace = vi.fn();
const searchParamsRef = { current: new URLSearchParams() };

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParamsRef.current,
}));

const notifySuccess = vi.fn();
const notifyById = vi.fn();

vi.mock("@modules/errors", () => ({
  useErrorBoundary: () => ({ notifySuccess, notifyById }),
}));

function setParams(params: Record<string, string>) {
  searchParamsRef.current = new URLSearchParams(params);
}

describe("SpotifyCallbackToast", () => {
  beforeEach(() => {
    setParams({});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when there is no spotify param", () => {
    render(<SpotifyCallbackToast />);

    expect(notifySuccess).not.toHaveBeenCalled();
    expect(notifyById).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it("notifies success and strips the param when connected", () => {
    setParams({ spotify: "connected" });

    render(<SpotifyCallbackToast />);

    expect(notifySuccess).toHaveBeenCalledWith("spotify", "connected");
    expect(replace).toHaveBeenCalledWith("?", { scroll: false });
  });

  it("notifies the error by reason and preserves unrelated params", () => {
    setParams({ spotify: "error", reason: "denied", keep: "1" });

    render(<SpotifyCallbackToast />);

    expect(notifyById).toHaveBeenCalledWith(
      "spotify",
      "denied",
      expect.objectContaining({ fallback: expect.objectContaining({ title: "Spotify connection failed" }) })
    );
    expect(replace).toHaveBeenCalledWith("?keep=1", { scroll: false });
  });

  it("falls back to exchange_failed when no reason is present on error", () => {
    setParams({ spotify: "error" });

    render(<SpotifyCallbackToast />);

    expect(notifyById).toHaveBeenCalledWith("spotify", "exchange_failed", expect.anything());
  });
});
