import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enSetup from "@modules/i18n/messages/en/setup.json";

import { NavidromeConnectStep } from "../NavidromeConnectStep";

const api = vi.hoisted(() => ({
  record: vi.fn(),
  test: vi.fn(),
  save: vi.fn(),
  options: vi.fn(),
  saved: { value: { url: "", username: "", password: "", playlistSync: true } },
}));

vi.mock("@hooks/api/mutations/setup/useRecordSetupOutcome", () => ({
  useRecordSetupOutcome: () => ({ mutateAsync: api.record, isPending: false }),
}));

vi.mock("@hooks/api/mutations/settings/useUpdateConnections", () => ({
  useTestNavidrome: () => ({ mutateAsync: api.test }),
  useUpdateConnectionsNavidrome: (options: unknown) => {
    api.options(options);
    return { mutateAsync: api.save, isPending: false };
  },
}));

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => ({ data: { connections: { navidrome: api.saved.value } } }),
}));

vi.mock("@components/AccessibilityPanel", () => ({
  AccessibilityPanel: () => <button type="button">Accessibility</button>,
}));

const onGo = vi.fn();
const continueName = enSetup.actions.continue;
const testName = enSetup.connect.test;

async function fillConnection(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Navidrome URL"), " http://navidrome:4533 ");
  await user.type(screen.getByLabelText(enSetup.connect.usernameLabel), " ana ");
  await user.type(screen.getByLabelText(enSetup.connect.passwordLabel), "pw");
}

beforeEach(() => {
  vi.clearAllMocks();
  api.saved.value = { url: "", username: "", password: "", playlistSync: true };
  api.record.mockResolvedValue({ questions: [], resumeAt: null, finished: false });
  api.save.mockResolvedValue({ ok: true });
  api.test.mockResolvedValue({ outcome: "ok", realPaths: true });
});

describe("the form", () => {
  it("names the server, saves quietly, and goes back to the choice without recording", async () => {
    render(<NavidromeConnectStep onGo={onGo} />);

    expect(screen.getByRole("heading", { level: 1, name: "Connect Navidrome." })).toHaveFocus();
    expect(screen.getByText("Question 2 of 4")).toBeInTheDocument();
    expect(api.options).toHaveBeenCalledWith({ silent: true });

    await userEvent.click(screen.getByRole("button", { name: enSetup.actions.back }));

    expect(onGo).toHaveBeenCalledWith("media");
    expect(api.record).not.toHaveBeenCalled();
  });

  it("flags an address that is not a URL and keeps Test disabled", async () => {
    const user = userEvent.setup();
    render(<NavidromeConnectStep onGo={onGo} />);

    await user.type(screen.getByLabelText("Navidrome URL"), "navidrome");

    expect(screen.getByText(enSetup.connect.urlError)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: testName })).toBeDisabled();
  });
});

describe("testing", () => {
  it("sends the trimmed details and unlocks Continue on success", async () => {
    const user = userEvent.setup();
    render(<NavidromeConnectStep onGo={onGo} />);
    expect(screen.getByRole("button", { name: continueName })).toBeDisabled();
    await fillConnection(user);

    await user.click(screen.getByRole("button", { name: testName }));

    expect(api.test).toHaveBeenCalledWith({ url: "http://navidrome:4533", username: "ana", password: "pw" });
    expect(await screen.findByText("Navidrome connected.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: continueName })).toBeEnabled();
  });

  it("says the credentials were refused, and keeps Continue blocked", async () => {
    api.test.mockResolvedValueOnce({ outcome: "unauthorized", realPaths: null });
    const user = userEvent.setup();
    render(<NavidromeConnectStep onGo={onGo} />);
    await fillConnection(user);

    await user.click(screen.getByRole("button", { name: testName }));

    expect(
      await screen.findByText("Navidrome refused those credentials. Check them and try again.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: continueName })).toBeDisabled();
  });

  it("says the server could not be reached", async () => {
    api.test.mockResolvedValueOnce({ outcome: "failed", realPaths: null });
    const user = userEvent.setup();
    render(<NavidromeConnectStep onGo={onGo} />);
    await fillConnection(user);

    await user.click(screen.getByRole("button", { name: testName }));

    expect(
      await screen.findByText("Could not reach Navidrome at that address. Check the URL and that the server is up.")
    ).toBeInTheDocument();
  });

  it("forgets a passed test as soon as a field changes", async () => {
    const user = userEvent.setup();
    render(<NavidromeConnectStep onGo={onGo} />);
    await fillConnection(user);
    await user.click(screen.getByRole("button", { name: testName }));
    await screen.findByText("Navidrome connected.");

    await user.type(screen.getByLabelText(enSetup.connect.usernameLabel), "x");

    expect(screen.queryByText("Navidrome connected.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: continueName })).toBeDisabled();
  });
});

describe("continuing", () => {
  it("saves keeping the playlist setting, records the answer, then moves to the downloads question", async () => {
    const user = userEvent.setup();
    render(<NavidromeConnectStep onGo={onGo} />);
    await fillConnection(user);
    await user.click(screen.getByRole("button", { name: testName }));
    await user.click(await screen.findByRole("button", { name: continueName }));

    expect(api.save).toHaveBeenCalledWith({
      url: "http://navidrome:4533",
      username: "ana",
      password: "pw",
      playlistSync: true,
    });
    expect(api.record).toHaveBeenCalledWith({ question: "media", outcome: "answered" });
    expect(onGo).toHaveBeenCalledWith("downloads");
  });

  it("stays on the question when the connection cannot be saved", async () => {
    api.save.mockRejectedValueOnce(new Error("no"));
    const user = userEvent.setup();
    render(<NavidromeConnectStep onGo={onGo} />);
    await fillConnection(user);
    await user.click(screen.getByRole("button", { name: testName }));
    await user.click(await screen.findByRole("button", { name: continueName }));

    expect(await screen.findByText("Could not save the Navidrome connection. Please try again.")).toBeInTheDocument();
    expect(api.record).not.toHaveBeenCalled();
    expect(onGo).not.toHaveBeenCalled();
  });

  it("skips by recording a skip and saving nothing", async () => {
    render(<NavidromeConnectStep onGo={onGo} />);

    await userEvent.click(screen.getByRole("button", { name: enSetup.actions.skip }));

    expect(api.record).toHaveBeenCalledWith({ question: "media", outcome: "skipped" });
    expect(api.save).not.toHaveBeenCalled();
    expect(onGo).toHaveBeenCalledWith("downloads");
  });
});
