import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useAuthTransition } from "../../hooks/useAuthTransition";

vi.mock("../SignInPanel", () => ({
  SignInPanel: () => {
    const { markNavigating } = useAuthTransition();
    return (
      <button type="button" onClick={markNavigating}>
        mock-panel
      </button>
    );
  },
}));

vi.mock("../SignInBackdrop", () => ({
  SignInBackdrop: () => <div>mock-backdrop</div>,
}));

import { AuthTransitionProvider } from "../../hooks/useAuthTransition";
import { LoginScreenContent } from "../LoginScreenContent";

function renderContent() {
  return render(
    <AuthTransitionProvider>
      <LoginScreenContent />
    </AuthTransitionProvider>
  );
}

describe("LoginScreenContent", () => {
  it("shows the backdrop and the panel before navigation begins", () => {
    renderContent();

    expect(screen.getByText("mock-backdrop")).toBeInTheDocument();
    expect(screen.getByText("mock-panel")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("swaps both for the branded loader once navigation is marked", () => {
    renderContent();

    fireEvent.click(screen.getByText("mock-panel"));

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("mock-panel")).not.toBeInTheDocument();
    expect(screen.queryByText("mock-backdrop")).not.toBeInTheDocument();
  });
});
