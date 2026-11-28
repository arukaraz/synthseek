import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enSetup from "@modules/i18n/messages/en/setup.json";

import { PlexConnectStep } from "../PlexConnectStep";

interface PlexServer {
  name: string;
  clientIdentifier: string;
  uri: string;
  local: boolean;
}

type PlexState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "picking"; token: string; servers: PlexServer[] }
  | { kind: "saving" }
  | { kind: "done" }
  | { kind: "error"; message: string };

const api = vi.hoisted(() => ({
  record: vi.fn(),
  start: vi.fn(),
  saveServer: vi.fn(),
  options: vi.fn(),
  state: { value: { kind: "idle" } as unknown },
}));

vi.mock("@hooks/api/mutations/setup/useRecordSetupOutcome", () => ({
  useRecordSetupOutcome: () => ({ mutateAsync: api.record, isPending: false }),
}));

vi.mock("@hooks/api/mutations/settings/usePlexConnect", () => ({
  usePlexConnect: (options: unknown) => {
    api.options(options);
    return { state: api.state.value, start: api.start, saveServer: api.saveServer, reset: vi.fn() };
  },
}));

vi.mock("@components/AccessibilityPanel", () => ({
  AccessibilityPanel: () => <button type="button">Accessibility</button>,
}));

const onGo = vi.fn();
const continueName = enSetup.actions.continue;

function stateIs(state: PlexState) {
  api.state.value = state;
}

beforeEach(() => {
  vi.clearAllMocks();
  stateIs({ kind: "idle" });
  api.record.mockResolvedValue({ questions: [], resumeAt: null, finished: false });
});

describe("before connecting", () => {
  it("explains the popup, starts the sign-in on click, and talks quietly", async () => {
    render(<PlexConnectStep onGo={onGo} />);

    expect(screen.getByRole("heading", { level: 1, name: "Connect Plex." })).toHaveFocus();
    expect(screen.getByText(enSetup.plex.intro)).toBeInTheDocument();
    expect(api.options).toHaveBeenCalledWith({ silent: true });
    expect(screen.getByRole("button", { name: continueName })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Login with Plex" }));

    expect(api.start).toHaveBeenCalledTimes(1);
  });

  it("shows the wait and holds the button while Plex answers", () => {
    stateIs({ kind: "pending" });
    render(<PlexConnectStep onGo={onGo} />);

    expect(screen.getByRole("button", { name: enSetup.plex.connecting })).toBeDisabled();
  });

  it("explains a timeout and offers the button again", () => {
    stateIs({ kind: "error", message: "Plex sign-in timed out" });
    render(<PlexConnectStep onGo={onGo} />);

    expect(screen.getByText(enSetup.plex.timeout)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login with Plex" })).toBeEnabled();
  });

  it("explains an unfinished sign-in in other words", () => {
    stateIs({ kind: "error", message: "denied" });
    render(<PlexConnectStep onGo={onGo} />);

    expect(screen.getByText(enSetup.plex.popupUnfinished)).toBeInTheDocument();
  });
});

describe("choosing the server", () => {
  it("lists the servers found and saves the one picked", async () => {
    stateIs({
      kind: "picking",
      token: "t",
      servers: [
        { name: "Home", clientIdentifier: "a", uri: "http://home:32400", local: true },
        { name: "Cloud", clientIdentifier: "b", uri: "https://cloud", local: false },
      ],
    });
    render(<PlexConnectStep onGo={onGo} />);

    expect(screen.getByText(enSetup.plex.serverPickerIntro)).toBeInTheDocument();
    await userEvent.click(screen.getByText("Cloud"));

    expect(api.saveServer).toHaveBeenCalledWith("https://cloud");
  });

  it("says when the account has no servers", () => {
    stateIs({ kind: "picking", token: "t", servers: [] });
    render(<PlexConnectStep onGo={onGo} />);

    expect(screen.getByText(enSetup.plex.noServers)).toBeInTheDocument();
  });
});

describe("once connected", () => {
  beforeEach(() => stateIs({ kind: "done" }));

  it("confirms and records the answer before moving on", async () => {
    render(<PlexConnectStep onGo={onGo} />);

    expect(screen.getByText(enSetup.plex.connected)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: continueName }));

    expect(api.record).toHaveBeenCalledWith({ question: "media", outcome: "answered" });
    expect(onGo).toHaveBeenCalledWith("downloads");
  });

  it("stays when the answer cannot be recorded", async () => {
    api.record.mockRejectedValueOnce(new Error("offline"));
    render(<PlexConnectStep onGo={onGo} />);

    await userEvent.click(screen.getByRole("button", { name: continueName }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(onGo).not.toHaveBeenCalled();
  });
});

describe("leaving without connecting", () => {
  it("skips by recording a skip", async () => {
    render(<PlexConnectStep onGo={onGo} />);

    await userEvent.click(screen.getByRole("button", { name: enSetup.actions.skip }));

    expect(api.record).toHaveBeenCalledWith({ question: "media", outcome: "skipped" });
    expect(onGo).toHaveBeenCalledWith("downloads");
  });

  it("goes back to the choice without recording", async () => {
    render(<PlexConnectStep onGo={onGo} />);

    await userEvent.click(screen.getByRole("button", { name: enSetup.actions.back }));

    expect(onGo).toHaveBeenCalledWith("media");
    expect(api.record).not.toHaveBeenCalled();
  });
});
