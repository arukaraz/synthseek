import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enSetup from "@modules/i18n/messages/en/setup.json";

import type { SetupFlowState } from "../../types";
import { SetupFlow } from "../SetupFlow";

const flow = vi.hoisted(() => ({ state: { kind: "loading" } as unknown, go: vi.fn() }));

vi.mock("../../hooks/useSetupFlow", () => ({
  useSetupFlow: () => ({ state: flow.state, go: flow.go }),
}));

vi.mock("../../steps/AccountStep", () => ({ AccountStep: () => <p>account step</p> }));
vi.mock("../../steps/MediaStep", () => ({ MediaStep: () => <p>media choice</p> }));
vi.mock("../../steps/MediaConnectStep", () => ({
  MediaConnectStep: ({ server }: { server: string }) => <p>connect {server}</p>,
}));
vi.mock("../../steps/DownloadsStep", () => ({ DownloadsStep: () => <p>downloads step</p> }));
vi.mock("../../steps/MetadataStep", () => ({ MetadataStep: () => <p>metadata step</p> }));
vi.mock("../../steps/SummaryStep", () => ({ SummaryStep: () => <p>summary step</p> }));

function stateIs(state: SetupFlowState) {
  flow.state = state;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SetupFlow", () => {
  it("shows the skeleton while the progress loads", () => {
    stateIs({ kind: "loading" });
    render(<SetupFlow />);

    expect(screen.getByText(enSetup.shell.loading)).toBeInTheDocument();
  });

  it("offers a retry when the progress cannot be read", async () => {
    const retry = vi.fn();
    stateIs({ kind: "error", retry });
    render(<SetupFlow />);

    await userEvent.click(screen.getByRole("button", { name: enSetup.shell.retry }));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("shows the account question only", () => {
    stateIs({ kind: "step", step: "account", server: null });
    render(<SetupFlow />);

    expect(screen.getByText("account step")).toBeInTheDocument();
  });

  it("shows the media choice when no server is chosen and that server's form when one is", () => {
    stateIs({ kind: "step", step: "media", server: null });
    const choice = render(<SetupFlow />);
    expect(screen.getByText("media choice")).toBeInTheDocument();
    choice.unmount();

    stateIs({ kind: "step", step: "media", server: "jellyfin" });
    render(<SetupFlow />);

    expect(screen.getByText("connect jellyfin")).toBeInTheDocument();
    expect(screen.queryByText("media choice")).not.toBeInTheDocument();
  });

  it.each([
    ["downloads", "downloads step"],
    ["metadata", "metadata step"],
    ["summary", "summary step"],
  ] as const)("shows the %s question", (step, text) => {
    stateIs({ kind: "step", step, server: null });
    render(<SetupFlow />);

    expect(screen.getByText(text)).toBeInTheDocument();
  });
});
