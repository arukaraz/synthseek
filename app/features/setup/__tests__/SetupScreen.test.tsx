import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SetupGate } from "@hooks/ui/types";
import enSetup from "@modules/i18n/messages/en/setup.json";

import { SetupScreen } from "../SetupScreen";

let gate: SetupGate;

vi.mock("@hooks/ui/useSetupRedirect", () => ({
  useSetupRedirect: () => gate,
}));

vi.mock("../components/SetupFlow", () => ({
  SetupFlow: () => <div data-testid="setup-flow" />,
}));

const skeleton = () => screen.queryByText(enSetup.shell.loading);
const flow = () => screen.queryByTestId("setup-flow");

describe("SetupScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the skeleton and not the flow while resolving", () => {
    gate = { status: "resolving" };
    render(<SetupScreen />);

    expect(skeleton()).toBeInTheDocument();
    expect(flow()).not.toBeInTheDocument();
  });

  it("shows the skeleton and not the flow while redirecting", () => {
    gate = { status: "redirecting" };
    render(<SetupScreen />);

    expect(skeleton()).toBeInTheDocument();
    expect(flow()).not.toBeInTheDocument();
  });

  it("offers a retry on a gate error and retries when asked", async () => {
    const retry = vi.fn();
    gate = { status: "error", retry };
    render(<SetupScreen />);

    expect(flow()).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: enSetup.shell.retry }));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("shows the flow and not the skeleton when ready", () => {
    gate = { status: "ready" };
    render(<SetupScreen />);

    expect(flow()).toBeInTheDocument();
    expect(skeleton()).not.toBeInTheDocument();
  });
});
