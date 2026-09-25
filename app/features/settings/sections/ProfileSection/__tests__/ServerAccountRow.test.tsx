import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

const api = vi.hoisted(() => ({
  link: vi.fn(),
  unlink: vi.fn(),
  setReporting: vi.fn(),
}));

vi.mock("@hooks/api", () => ({
  useLinkSourceAccount: () => ({ mutateAsync: api.link, isPending: false }),
  useUnlinkSourceAccount: () => ({ mutate: api.unlink, isPending: false }),
  useSetSourceReporting: () => ({ mutate: api.setReporting, isPending: false }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";

import { ServerAccountRow } from "../components/ServerAccountRow";

const copy = enSettings.profile.connected;

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const NOT_LINKED = {
  server: "navidrome" as const,
  linkMethod: "password" as const,
  connected: false,
  externalUsername: null,
  reportEnabled: false,
  lastFailure: null,
};

async function signIn(username: string, password: string) {
  await userEvent.type(screen.getByRole("textbox", { name: copy.server.username }), username);
  await userEvent.type(screen.getByLabelText(copy.server.password), password);
  await userEvent.click(screen.getByRole("button", { name: copy.connect }));
}

describe("ServerAccountRow", () => {
  it("signs in with the typed account and clears the password once linked", async () => {
    api.link.mockResolvedValueOnce({ outcome: "linked", accounts: [] });
    render(<ServerAccountRow account={NOT_LINKED} />);

    await signIn(" ana ", "hunter2");

    expect(api.link).toHaveBeenCalledWith({ server: "navidrome", username: "ana", password: "hunter2" });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Navidrome linked"));
    expect(screen.getByLabelText(copy.server.password)).toHaveValue("");
  });

  it("says the server refused, and keeps what was typed so it can be corrected", async () => {
    api.link.mockResolvedValueOnce({ outcome: "refused", accounts: [] });
    render(<ServerAccountRow account={{ ...NOT_LINKED, server: "jellyfin" }} />);

    await signIn("ana", "wrong");

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Jellyfin did not accept that username or password"));
    expect(screen.getByLabelText(copy.server.password)).toHaveValue("wrong");
  });

  it("cannot sign in with an empty password", async () => {
    render(<ServerAccountRow account={NOT_LINKED} />);
    await userEvent.type(screen.getByRole("textbox", { name: copy.server.username }), "ana");
    expect(screen.getByRole("button", { name: copy.connect })).toBeDisabled();
  });

  it("shows a linked account with its reporting switch, its last failure, and a way out", async () => {
    render(
      <ServerAccountRow
        account={{
          ...NOT_LINKED,
          connected: true,
          externalUsername: "ana",
          reportEnabled: true,
          lastFailure: "unauthorized",
        }}
      />
    );

    expect(screen.getByText("Linked as ana")).toBeInTheDocument();
    expect(screen.getByText(copy.server.unauthorized)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("switch", { name: "Record my plays in Navidrome" }));
    expect(api.setReporting).toHaveBeenCalledWith({ server: "navidrome", enabled: false });

    await userEvent.click(screen.getByRole("button", { name: copy.disconnect }));
    expect(api.unlink).toHaveBeenCalledWith({ server: "navidrome" });
  });
});
