import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { SetupWizard } from "../SetupWizard";
import type { AdminStepProps, SlskdStepProps } from "../../types";

interface AuthShape {
  currentUser: { id: string } | null;
}

let authState: AuthShape;

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => authState,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock("../../steps/AdminStep", () => ({
  AdminStep: ({ onComplete }: AdminStepProps) => (
    <div data-testid="admin-step">
      <button type="button" onClick={onComplete}>
        admin-complete
      </button>
    </div>
  ),
}));

vi.mock("../../steps/SlskdStep", () => ({
  SlskdStep: ({ onBack }: SlskdStepProps) => (
    <div data-testid="slskd-step">{onBack ? <button type="button">slskd-back</button> : null}</div>
  ),
}));

vi.mock("../../steps/PlexStep", () => ({ PlexStep: () => <div data-testid="plex-step" /> }));
vi.mock("../../steps/EnrichmentStep", () => ({ EnrichmentStep: () => <div data-testid="enrichment-step" /> }));
vi.mock("../../steps/DoneStep", () => ({ DoneStep: () => <div data-testid="done-step" /> }));

describe("SetupWizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts on the admin step when there is no current user", () => {
    authState = { currentUser: null };
    render(<SetupWizard />);

    expect(screen.getByTestId("admin-step")).toBeInTheDocument();
    expect(screen.queryByTestId("slskd-step")).not.toBeInTheDocument();
  });

  it("starts on the slskd step when a current user already exists", () => {
    authState = { currentUser: { id: "user_1" } };
    render(<SetupWizard />);

    expect(screen.getByTestId("slskd-step")).toBeInTheDocument();
    expect(screen.queryByTestId("admin-step")).not.toBeInTheDocument();
  });

  it("shows no Back on slskd when it is the initial step (existing user)", () => {
    authState = { currentUser: { id: "user_1" } };
    render(<SetupWizard />);

    expect(screen.queryByRole("button", { name: "slskd-back" })).not.toBeInTheDocument();
  });

  it("shows Back on slskd after advancing from the admin step", () => {
    authState = { currentUser: null };
    render(<SetupWizard />);

    fireEvent.click(screen.getByRole("button", { name: "admin-complete" }));

    expect(screen.getByTestId("slskd-step")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "slskd-back" })).toBeInTheDocument();
  });
});
