import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createLoadingQuery, createMockMutation, createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

interface AdminSettings {
  memberNtfyServer: string;
}

let settings: MockQueryResult<AdminSettings> = createMockQuery<AdminSettings>({ memberNtfyServer: "" });
const update = createMockMutation();

vi.mock("@hooks/api", () => ({
  useNotificationAdminSettings: () => settings,
  useUpdateNotificationAdminSettings: () => update,
}));

import { MemberNtfyServerCard } from "../components/MemberNtfyServerCard";

const copy = enSettings.notifications.memberServer;
const saveBar = enSettings.shell.saveBar;

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  settings = createMockQuery<AdminSettings>({ memberNtfyServer: "" });
});

describe("MemberNtfyServerCard", () => {
  it("shows the saved server", () => {
    settings = createMockQuery<AdminSettings>({ memberNtfyServer: "https://push.example.org" });
    render(<MemberNtfyServerCard />);

    expect(screen.getByLabelText(copy.label)).toHaveValue("https://push.example.org");
    expect(screen.queryByRole("button", { name: saveBar.save })).not.toBeInTheDocument();
  });

  it("saves the trimmed server and drops the draft once it is stored", async () => {
    render(<MemberNtfyServerCard />);

    fireEvent.change(screen.getByLabelText(copy.label), { target: { value: " https://push.example.org " } });
    await userEvent.click(screen.getByRole("button", { name: saveBar.save }));

    expect(update.mutate).toHaveBeenCalledWith({ memberNtfyServer: "https://push.example.org" }, expect.anything());
    const callbacks: { onSuccess: () => void } = update.mutate.mock.calls[0][1];
    act(() => callbacks.onSuccess());
    expect(screen.getByLabelText(copy.label)).toHaveValue("");
  });

  it("drops the draft on cancel", async () => {
    render(<MemberNtfyServerCard />);

    fireEvent.change(screen.getByLabelText(copy.label), { target: { value: "https://other.example.org" } });
    await userEvent.click(screen.getByRole("button", { name: saveBar.cancel }));

    expect(screen.getByLabelText(copy.label)).toHaveValue("");
  });

  it("keeps the field locked until the settings arrive", () => {
    settings = createLoadingQuery<AdminSettings>();
    render(<MemberNtfyServerCard />);

    expect(screen.getByLabelText(copy.label)).toBeDisabled();
  });
});
