import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";

import { UnlinkPlexDialog } from "../UnlinkPlexDialog";

const unlink = createMockMutation();

vi.mock("@hooks/api/mutations/auth/usePlexUnlink", () => ({
  useUnlinkPlexWithPassword: () => unlink,
}));

const copy = enSettings.profile.connected.plex.unlinkDialog;

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function open(onOpenChange = vi.fn()) {
  render(<UnlinkPlexDialog email="plex@test.local" open onOpenChange={onOpenChange} />);
  return onOpenChange;
}

describe("UnlinkPlexDialog", () => {
  it("starts from the email the account signs in with", () => {
    open();

    expect(screen.getByRole("dialog", { name: copy.title })).toBeInTheDocument();
    expect(screen.getByLabelText(copy.emailLabel)).toHaveValue("plex@test.local");
  });

  it("lets a password manager save the new credential", () => {
    open();

    expect(screen.getByLabelText(copy.emailLabel)).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText(copy.passwordLabel)).toHaveAttribute("autocomplete", "new-password");
  });

  it("keeps saving off until the password is long enough and an email is there", async () => {
    open();
    const save = screen.getByRole("button", { name: copy.submit });
    expect(save).toBeDisabled();

    await userEvent.type(screen.getByLabelText(copy.passwordLabel), "short");
    expect(save).toBeDisabled();
    await userEvent.type(screen.getByLabelText(copy.passwordLabel), "-enough");
    expect(save).toBeEnabled();

    await userEvent.clear(screen.getByLabelText(copy.emailLabel));
    expect(save).toBeDisabled();
  });

  it("sends the edited email with the password and closes once Plex is disconnected", async () => {
    unlink.mutate.mockImplementation((_payload, options?: { onSuccess?: () => void }) => options?.onSuccess?.());
    const onOpenChange = open();

    await userEvent.clear(screen.getByLabelText(copy.emailLabel));
    await userEvent.type(screen.getByLabelText(copy.emailLabel), "me@test.local");
    await userEvent.type(screen.getByLabelText(copy.passwordLabel), "long-enough");
    await userEvent.click(screen.getByRole("button", { name: copy.submit }));

    expect(unlink.mutate).toHaveBeenCalledWith(
      { email: "me@test.local", password: "long-enough" },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("stays open when the save fails", async () => {
    unlink.mutate.mockImplementation(() => undefined);
    const onOpenChange = open();

    await userEvent.type(screen.getByLabelText(copy.passwordLabel), "long-enough");
    await userEvent.click(screen.getByRole("button", { name: copy.submit }));

    expect(unlink.mutate).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
