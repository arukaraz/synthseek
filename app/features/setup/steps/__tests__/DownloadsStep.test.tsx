import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enComponents from "@modules/i18n/messages/en/components.json";
import enSetup from "@modules/i18n/messages/en/setup.json";

import { DownloadsStep } from "../DownloadsStep";

const api = vi.hoisted(() => ({
  record: vi.fn(),
  test: vi.fn(),
  save: vi.fn(),
  slskdOptions: vi.fn(),
  saved: { value: { apiUrl: "", apiKey: "", bannedUsers: ["troll"] } },
}));

vi.mock("@hooks/api/mutations/setup/useRecordSetupOutcome", () => ({
  useRecordSetupOutcome: () => ({ mutateAsync: api.record, isPending: false }),
}));

vi.mock("@hooks/api/mutations/settings/useUpdateConnections", () => ({
  useTestSlskd: () => ({ mutateAsync: api.test }),
  useUpdateConnectionsSlskd: (options: unknown) => {
    api.slskdOptions(options);
    return { mutateAsync: api.save, isPending: false };
  },
}));

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => ({ data: { connections: { slskd: api.saved.value } } }),
}));

vi.mock("@components/AccessibilityPanel", () => ({
  AccessibilityPanel: () => <button type="button">Accessibility</button>,
}));

const onGo = vi.fn();
const continueName = enSetup.actions.continue;
const keyLabel = enSetup.downloads.apiKeyLabel;

async function fillConnection(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(enSetup.downloads.apiUrlLabel), "http://slskd:5030/");
  await user.type(screen.getByLabelText(keyLabel), "secret-key");
}

beforeEach(() => {
  vi.clearAllMocks();
  api.saved.value = { apiUrl: "", apiKey: "", bannedUsers: ["troll"] };
  api.record.mockResolvedValue({ questions: [], resumeAt: null, finished: false });
  api.save.mockResolvedValue({ ok: true });
  api.test.mockResolvedValue({ ok: true });
});

describe("the question", () => {
  it("is the third of four, can go back, and blocks Continue until a connection is verified", () => {
    render(<DownloadsStep onGo={onGo} />);

    expect(screen.getByRole("heading", { level: 1, name: enSetup.downloads.title })).toHaveFocus();
    expect(screen.getByText("Question 3 of 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: continueName })).toBeDisabled();
    expect(screen.getByRole("button", { name: enSetup.actions.back })).toBeEnabled();
  });

  it("saves quietly, so the inline messages are the only feedback", () => {
    render(<DownloadsStep onGo={onGo} />);

    expect(api.slskdOptions).toHaveBeenCalledWith({ silent: true });
  });

  it("goes back to the media question without recording anything", async () => {
    render(<DownloadsStep onGo={onGo} />);

    await userEvent.click(screen.getByRole("button", { name: enSetup.actions.back }));

    expect(onGo).toHaveBeenCalledWith("media");
    expect(api.record).not.toHaveBeenCalled();
  });
});

describe("testing the connection", () => {
  it("keeps Test disabled until the address is a URL and the key is filled", async () => {
    const user = userEvent.setup();
    render(<DownloadsStep onGo={onGo} />);
    const test = screen.getByRole("button", { name: enSetup.downloads.testIdle });
    expect(test).toBeDisabled();

    await user.type(screen.getByLabelText(enSetup.downloads.apiUrlLabel), "not a url");
    await user.type(screen.getByLabelText(keyLabel), "k");

    expect(test).toBeDisabled();
    expect(screen.getByText(enSetup.connect.urlError)).toBeInTheDocument();
  });

  it("tests the normalised address and unlocks Continue when it passes", async () => {
    const user = userEvent.setup();
    render(<DownloadsStep onGo={onGo} />);
    await fillConnection(user);

    await user.click(screen.getByRole("button", { name: enSetup.downloads.testIdle }));

    expect(api.test).toHaveBeenCalledWith({ apiUrl: "http://slskd:5030", apiKey: "secret-key" });
    expect(await screen.findByText(enSetup.downloads.passed)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: continueName })).toBeEnabled();
  });

  it("shows the server's reason when it fails, and editing a field forgets the result", async () => {
    api.test.mockResolvedValueOnce({ ok: false, message: "401" });
    const user = userEvent.setup();
    render(<DownloadsStep onGo={onGo} />);
    await fillConnection(user);

    await user.click(screen.getByRole("button", { name: enSetup.downloads.testIdle }));

    expect(await screen.findByText("Connection failed: 401")).toBeInTheDocument();
    await user.type(screen.getByLabelText(keyLabel), "x");
    expect(screen.queryByText("Connection failed: 401")).not.toBeInTheDocument();
  });

  it("says it could not reach slskd when the failure has no reason, and when the call itself throws", async () => {
    api.test.mockResolvedValueOnce({ ok: false });
    const user = userEvent.setup();
    render(<DownloadsStep onGo={onGo} />);
    await fillConnection(user);

    await user.click(screen.getByRole("button", { name: enSetup.downloads.testIdle }));
    expect(await screen.findByText(enSetup.downloads.failed)).toBeInTheDocument();

    api.test.mockRejectedValueOnce(new Error("network"));
    await user.click(screen.getByRole("button", { name: enSetup.downloads.testIdle }));
    expect(await screen.findByText(enSetup.downloads.failed)).toBeInTheDocument();
  });

  it("lets the visitor go on without a verified connection after a failure, and says so", async () => {
    api.test.mockResolvedValueOnce({ ok: false });
    const user = userEvent.setup();
    render(<DownloadsStep onGo={onGo} />);
    await fillConnection(user);
    await user.click(screen.getByRole("button", { name: enSetup.downloads.testIdle }));

    await user.click(await screen.findByRole("button", { name: enSetup.downloads.overrideLink }));

    expect(screen.getByText(enSetup.downloads.overrideArmed)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: continueName })).toBeEnabled();
  });
});

describe("continuing", () => {
  it("saves the connection with the banned users it already had, records the answer, then moves on", async () => {
    const user = userEvent.setup();
    render(<DownloadsStep onGo={onGo} />);
    await fillConnection(user);
    await user.click(screen.getByRole("button", { name: enSetup.downloads.testIdle }));
    await user.click(await screen.findByRole("button", { name: continueName }));

    expect(api.save).toHaveBeenCalledWith({
      apiUrl: "http://slskd:5030",
      apiKey: "secret-key",
      bannedUsers: ["troll"],
    });
    expect(api.record).toHaveBeenCalledWith({ question: "downloads", outcome: "answered" });
    expect(onGo).toHaveBeenCalledWith("metadata");
    expect(api.save.mock.invocationCallOrder[0]).toBeLessThan(api.record.mock.invocationCallOrder[0] ?? 0);
  });

  it("stays on the question and says so when the connection cannot be saved", async () => {
    api.save.mockRejectedValueOnce(new Error("nope"));
    const user = userEvent.setup();
    render(<DownloadsStep onGo={onGo} />);
    await fillConnection(user);
    await user.click(screen.getByRole("button", { name: enSetup.downloads.testIdle }));
    await user.click(await screen.findByRole("button", { name: continueName }));

    expect(await screen.findByText(enSetup.downloads.saveFailed)).toBeInTheDocument();
    expect(api.record).not.toHaveBeenCalled();
    expect(onGo).not.toHaveBeenCalled();
  });

  it("stays on the question when the answer cannot be recorded", async () => {
    api.record.mockRejectedValueOnce(new Error("offline"));
    const user = userEvent.setup();
    render(<DownloadsStep onGo={onGo} />);
    await fillConnection(user);
    await user.click(screen.getByRole("button", { name: enSetup.downloads.testIdle }));
    await user.click(await screen.findByRole("button", { name: continueName }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(onGo).not.toHaveBeenCalled();
  });
});

describe("skipping", () => {
  it("records a skip without touching the connection", async () => {
    render(<DownloadsStep onGo={onGo} />);

    await userEvent.click(screen.getByRole("button", { name: enSetup.actions.skip }));

    expect(api.record).toHaveBeenCalledWith({ question: "downloads", outcome: "skipped" });
    expect(api.save).not.toHaveBeenCalled();
    expect(onGo).toHaveBeenCalledWith("metadata");
  });
});

describe("the password field", () => {
  it("is the shared one, so the key can be revealed", () => {
    render(<DownloadsStep onGo={onGo} />);

    expect(screen.getByRole("button", { name: enComponents.passwordField.show })).toBeInTheDocument();
  });
});
