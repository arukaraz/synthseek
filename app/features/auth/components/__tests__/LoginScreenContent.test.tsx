import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useAuthTransition } from "../../hooks/useAuthTransition";

vi.mock("../LoginForm", () => ({
  LoginForm: () => {
    const { markNavigating } = useAuthTransition();
    return (
      <button type="button" onClick={markNavigating}>
        mock-sign-in
      </button>
    );
  },
}));

vi.mock("../PlexLoginButton", () => ({
  PlexLoginButton: () => <div>mock-plex</div>,
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
  it("shows the login card before navigation begins", () => {
    renderContent();

    expect(screen.getByText("mock-sign-in")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("swaps the card for the branded loader once navigation is marked", () => {
    renderContent();

    fireEvent.click(screen.getByText("mock-sign-in"));

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("mock-sign-in")).not.toBeInTheDocument();
  });
});
