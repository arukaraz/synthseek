import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { SetupScreen } from "../SetupScreen";
import { SETUP_LOADING_LABEL } from "../constants";
import type { SetupGate } from "@hooks/ui/types";

let gate: SetupGate;

vi.mock("@hooks/ui/useSetupRedirect", () => ({
  useSetupRedirect: () => gate,
}));

vi.mock("../components/SetupWizard", () => ({
  SetupWizard: () => <div data-testid="setup-wizard" />,
}));

const skeleton = () => screen.queryByText(SETUP_LOADING_LABEL);
const wizard = () => screen.queryByTestId("setup-wizard");

describe("SetupScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the skeleton and not the wizard while resolving", () => {
    gate = { status: "resolving" };
    render(<SetupScreen />);

    expect(skeleton()).toBeInTheDocument();
    expect(wizard()).not.toBeInTheDocument();
  });

  it("renders the skeleton and not the wizard while redirecting", () => {
    gate = { status: "redirecting" };
    render(<SetupScreen />);

    expect(skeleton()).toBeInTheDocument();
    expect(wizard()).not.toBeInTheDocument();
  });

  it("renders the skeleton and not the wizard on error", () => {
    gate = { status: "error" };
    render(<SetupScreen />);

    expect(skeleton()).toBeInTheDocument();
    expect(wizard()).not.toBeInTheDocument();
  });

  it("renders the wizard and not the skeleton when ready", () => {
    gate = { status: "ready" };
    render(<SetupScreen />);

    expect(wizard()).toBeInTheDocument();
    expect(skeleton()).not.toBeInTheDocument();
  });
});
