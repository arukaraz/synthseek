import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SetupGate } from "@hooks/ui/types";

const gateMock = vi.fn<() => SetupGate>();

vi.mock("@hooks/ui/useSetupRedirect", () => ({
  useSetupRedirect: () => gateMock(),
}));

import { AuthGuard } from "../AuthGuard";

describe("AuthGuard", () => {
  it("renders the branded loader while the gate is resolving", () => {
    gateMock.mockReturnValue({ status: "resolving" });

    render(
      <AuthGuard>
        <div data-testid="protected">home</div>
      </AuthGuard>
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
  });

  it("renders nothing while redirecting", () => {
    gateMock.mockReturnValue({ status: "redirecting" });

    const { container } = render(
      <AuthGuard>
        <div data-testid="protected">home</div>
      </AuthGuard>
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });

  it("renders children once the gate is ready", () => {
    gateMock.mockReturnValue({ status: "ready" });

    render(
      <AuthGuard>
        <div data-testid="protected">home</div>
      </AuthGuard>
    );

    expect(screen.getByTestId("protected")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  describe("error state", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    it("renders the recovery panel instead of a blank page", () => {
      gateMock.mockReturnValue({ status: "error", retry: vi.fn() });

      render(
        <AuthGuard>
          <div data-testid="protected">home</div>
        </AuthGuard>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
    });

    it("auto-retries after a back-off delay", () => {
      const retry = vi.fn();
      gateMock.mockReturnValue({ status: "error", retry });

      render(
        <AuthGuard>
          <div data-testid="protected">home</div>
        </AuthGuard>
      );

      expect(retry).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(retry).toHaveBeenCalledTimes(1);
    });

    it("retries immediately when the user clicks retry", () => {
      const retry = vi.fn();
      gateMock.mockReturnValue({ status: "error", retry });

      render(
        <AuthGuard>
          <div data-testid="protected">home</div>
        </AuthGuard>
      );

      fireEvent.click(screen.getByRole("button", { name: /retry/i }));

      expect(retry).toHaveBeenCalledTimes(1);
    });
  });
});
