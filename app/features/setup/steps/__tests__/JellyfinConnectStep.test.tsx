import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enSetup from "@modules/i18n/messages/en/setup.json";

import { JellyfinConnectStep } from "../JellyfinConnectStep";

const api = vi.hoisted(() => ({
  record: vi.fn(),
  test: vi.fn(),
  save: vi.fn(),
  options: vi.fn(),
  saved: { value: { url: "", apiKey: "", playlistSync: false } },
}));

vi.mock("@hooks/api/mutations/setup/useRecordSetupOutcome", () => ({
  useRecordSetupOutcome: () => ({ mutateAsync: api.record, isPending: false }),
}));

vi.mock("@hooks/api/mutations/settings/useUpdateConnections", () => ({
  useTestJellyfin: () => ({ mutateAsync: api.test }),
  useUpdateConnectionsJellyfin: (options: unknown) => {
    api.options(options);
    return { mutateAsync: api.save, isPending: false };
  },
}));

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => ({ data: { connections: { jellyfin: api.saved.value } } }),
}));

vi.mock("@components/AccessibilityPanel", () => ({
  AccessibilityPanel: () => <button type="button">Accessibility</button>,
}));

const onGo = vi.fn();
const continueName = enSetup.actions.continue;
const testName = enSetup.connect.test;

async function fillConnection(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Jellyfin URL"), "http://jellyfin:8096");
  await user.type(screen.getByLabelText(enSetup.connect.apiKeyLabel), "key");
}

beforeEach(() => {
  vi.clearAllMocks();
  api.record.mockResolvedValue({ questions: [], resumeAt: null, finished: false });
  api.save.mockResolvedValue({ ok: true });
  api.test.mockResolvedValue({ outcome: "ok" });
});

describe("the form", () => {
  it("names the server, explains where the key comes from, and saves quietly", () => {
    render(<JellyfinConnectStep onGo={onGo} />);

    expect(screen.getByRole("heading", { level: 1, name: "Connect Jellyfin." })).toHaveFocus();
    expect(screen.getByText(enSetup.connect.apiKeyHint)).toBeInTheDocument();
    expect(api.options).toHaveBeenCalledWith({ silent: true });
  });

  it("goes back to the choice without recording", async () => {
    render(<JellyfinConnectStep onGo={onGo} />);

    await userEvent.click(screen.getByRole("button", { name: enSetup.actions.back }));

    expect(onGo).toHaveBeenCalledWith("media");
    expect(api.record).not.toHaveBeenCalled();
  });
});

describe("testing and continuing", () => {
  it("tests, saves keeping the playlist setting, records the answer in that order, then moves on", async () => {
    const user = userEvent.setup();
    render(<JellyfinConnectStep onGo={onGo} />);
    await fillConnection(user);

    await user.click(screen.getByRole("button", { name: testName }));
    await user.click(await screen.findByRole("button", { name: continueName }));

    expect(api.test).toHaveBeenCalledWith({ url: "http://jellyfin:8096", apiKey: "key" });
    expect(api.save).toHaveBeenCalledWith({ url: "http://jellyfin:8096", apiKey: "key", playlistSync: false });
    expect(api.record).toHaveBeenCalledWith({ question: "media", outcome: "answered" });
    expect(api.save.mock.invocationCallOrder[0]).toBeLessThan(api.record.mock.invocationCallOrder[0] ?? 0);
    expect(onGo).toHaveBeenCalledWith("downloads");
  });

  it("blocks Continue when the key is refused", async () => {
    api.test.mockResolvedValueOnce({ outcome: "unauthorized" });
    const user = userEvent.setup();
    render(<JellyfinConnectStep onGo={onGo} />);
    await fillConnection(user);

    await user.click(screen.getByRole("button", { name: testName }));

    expect(
      await screen.findByText("Jellyfin refused those credentials. Check them and try again.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: continueName })).toBeDisabled();
  });

  it("stays on the question when the answer cannot be recorded", async () => {
    api.record.mockRejectedValueOnce(new Error("offline"));
    const user = userEvent.setup();
    render(<JellyfinConnectStep onGo={onGo} />);
    await fillConnection(user);
    await user.click(screen.getByRole("button", { name: testName }));
    await user.click(await screen.findByRole("button", { name: continueName }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(onGo).not.toHaveBeenCalled();
  });

  it("skips by recording a skip", async () => {
    render(<JellyfinConnectStep onGo={onGo} />);

    await userEvent.click(screen.getByRole("button", { name: enSetup.actions.skip }));

    expect(api.record).toHaveBeenCalledWith({ question: "media", outcome: "skipped" });
    expect(onGo).toHaveBeenCalledWith("downloads");
  });
});
