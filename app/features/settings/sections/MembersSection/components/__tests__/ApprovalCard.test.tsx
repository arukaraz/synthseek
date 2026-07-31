import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

const spies = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  settingsData: { users: { requireApprovalForMembers: false } },
}));

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => ({ data: spies.settingsData, isLoading: false, isError: false }),
}));

vi.mock("@hooks/api/mutations/settings/useUpdateUsers", () => ({
  useUpdateUsers: () => ({ mutateAsync: spies.mutateAsync, isPending: false }),
}));

import { ApprovalCard } from "../ApprovalCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

describe("ApprovalCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.mutateAsync.mockResolvedValue({ ok: true });
    spies.settingsData = { users: { requireApprovalForMembers: false } };
  });

  it("renders the toggle seeded from the fetched users group", () => {
    render(<ApprovalCard />);

    expect(screen.getByText(enSettings.members.approval.cardTitle)).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: enSettings.members.approval.requireForMembers.label })).not.toBeChecked();
  });

  it("saves the full users group after toggling", async () => {
    const user = userEvent.setup();
    render(<ApprovalCard />);

    await user.click(screen.getByRole("switch", { name: enSettings.members.approval.requireForMembers.label }));
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(spies.mutateAsync).toHaveBeenCalledWith({ requireApprovalForMembers: true }));
  });
});
