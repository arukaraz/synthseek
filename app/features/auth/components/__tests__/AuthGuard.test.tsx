import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
});
