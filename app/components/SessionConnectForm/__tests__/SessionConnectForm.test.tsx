import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LibrarySourceDescription } from "@hooks/api/queries/library-source/types";
import i18n from "@locale";
import enComponents from "@modules/i18n/messages/en/components.json";
import enErrors from "@modules/i18n/messages/en/errors.json";

const connect = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  reset: vi.fn(),
  isPending: false,
}));

vi.mock("@hooks/api/mutations/library-source/useConnectLibrarySession", () => ({
  useConnectLibrarySession: () => connect,
}));

import { SessionConnectForm } from "../SessionConnectForm";

const SECRET = "# Netscape HTTP Cookie File\n.youtube.com\tTRUE\t/\tTRUE\t0\tSID\tsecret-value-123";

function source(overrides: Partial<LibrarySourceDescription> = {}): LibrarySourceDescription {
  return {
    provider: "youtube",
    name: "YouTube",
    configured: true,
    connected: false,
    pending: false,
    needsReconnect: false,
    externalUsername: null,
    capabilities: {
      connect: "session",
      itemTypes: ["playlist", "liked"],
      watch: { playlists: true, savedAlbums: false },
      streamsAudio: false,
      playlistLinks: { accepted: true, needsConnection: false },
    },
    ...overrides,
  };
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  let reject: (reason: unknown) => void = () => undefined;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function field(): HTMLTextAreaElement {
  return screen.getByLabelText(enComponents.sessionConnect.label);
}

function submitButton() {
  return screen.getByRole("button", { name: i18n.t("components:sessionConnect.submit", { provider: "YouTube" }) });
}

beforeEach(() => {
  vi.clearAllMocks();
  connect.isPending = false;
  connect.mutateAsync.mockResolvedValue({
    connected: true,
    pending: false,
    needsReconnect: false,
    externalUsername: "Channel",
  });
});

describe("SessionConnectForm", () => {
  it("explains what is asked and shows the account warning beside the paste area", () => {
    render(<SessionConnectForm source={source()} />);

    expect(field()).toBeInTheDocument();
    expect(screen.getByText(i18n.t("components:sessionConnect.warningTitle", { provider: "YouTube" }))).toBeVisible();
    expect(screen.getByText(i18n.t("components:sessionConnect.warningBody", { provider: "YouTube" }))).toBeVisible();
    expect(
      screen.getByText(
        `${i18n.t("components:sessionConnect.howTo", { provider: "YouTube" })} ${i18n.t("components:sessionConnect.kept", { provider: "YouTube" })}`
      )
    ).toBeInTheDocument();
  });

  it("treats the paste area as a secret field", () => {
    render(<SessionConnectForm source={source()} />);

    expect(field()).toHaveAttribute("autocomplete", "off");
    expect(field()).toHaveAttribute("spellcheck", "false");
    expect(field()).toHaveAttribute("autocorrect", "off");
    expect(field()).toHaveAttribute("autocapitalize", "off");
    expect(field()).not.toHaveAttribute("name");
  });

  it("keeps Connect off until something is pasted", async () => {
    render(<SessionConnectForm source={source()} />);

    expect(submitButton()).toBeDisabled();
    await userEvent.click(field());
    await userEvent.paste(SECRET);

    expect(submitButton()).toBeEnabled();
  });

  it("sends the paste, then leaves nothing of it on screen or in the mutation after a success", async () => {
    const onConnected = vi.fn();
    const { container } = render(<SessionConnectForm source={source()} onConnected={onConnected} />);

    await userEvent.click(field());
    await userEvent.paste(SECRET);
    await userEvent.click(submitButton());

    expect(connect.mutateAsync).toHaveBeenCalledWith({ provider: "youtube", session: SECRET });
    expect(field().value).toBe("");
    expect(container.innerHTML).not.toContain("secret-value-123");
    expect(connect.reset).toHaveBeenCalledTimes(1);
    expect(onConnected).toHaveBeenCalledTimes(1);
  });

  it("clears the paste before the answer arrives, so it is not on screen while the session is checked", async () => {
    const pending = deferred<unknown>();
    connect.mutateAsync.mockReturnValue(pending.promise);
    const { container } = render(<SessionConnectForm source={source()} />);

    await userEvent.click(field());
    await userEvent.paste(SECRET);
    await userEvent.click(submitButton());

    expect(field().value).toBe("");
    expect(container.innerHTML).not.toContain("secret-value-123");
    expect(connect.reset).not.toHaveBeenCalled();
    pending.resolve({ connected: true, pending: false, needsReconnect: false, externalUsername: null });
    await vi.waitFor(() => expect(connect.reset).toHaveBeenCalledTimes(1));
  });

  it("shows the size limit inline after a failure and keeps nothing of the paste", async () => {
    connect.mutateAsync.mockRejectedValue({
      message: "too large",
      data: { appCode: "LIBRARY_SOURCE_SESSION_TOO_LARGE" },
    });
    const { container } = render(<SessionConnectForm source={source()} />);

    await userEvent.click(field());
    await userEvent.paste(SECRET);
    await userEvent.click(submitButton());

    expect(await screen.findByText(enErrors.LIBRARY_SOURCE_SESSION_TOO_LARGE.title)).toBeInTheDocument();
    expect(screen.getByText(enErrors.LIBRARY_SOURCE_SESSION_TOO_LARGE.description)).toBeInTheDocument();
    expect(field().value).toBe("");
    expect(container.innerHTML).not.toContain("secret-value-123");
    expect(connect.reset).toHaveBeenCalledTimes(1);
  });

  it("shows inline that nothing in the paste was usable", async () => {
    connect.mutateAsync.mockRejectedValue({
      message: "unusable",
      data: { appCode: "LIBRARY_SOURCE_SESSION_UNUSABLE" },
    });
    render(<SessionConnectForm source={source()} />);

    await userEvent.click(field());
    await userEvent.paste("not a cookie file");
    await userEvent.click(submitButton());

    expect(await screen.findByText(enErrors.LIBRARY_SOURCE_SESSION_UNUSABLE.title)).toBeInTheDocument();
  });

  it("sends one request when Connect is pressed again while the first is in flight", async () => {
    const pending = deferred<unknown>();
    connect.mutateAsync.mockReturnValue(pending.promise);
    render(<SessionConnectForm source={source()} />);

    await userEvent.click(field());
    await userEvent.paste(SECRET);
    await userEvent.click(submitButton());
    await userEvent.click(field());
    await userEvent.paste(SECRET);
    await userEvent.click(submitButton());

    expect(connect.mutateAsync).toHaveBeenCalledTimes(1);
    pending.resolve({ connected: true, pending: false, needsReconnect: false, externalUsername: null });
  });

  it("locks the field and the button while the session is being checked", () => {
    connect.isPending = true;
    render(<SessionConnectForm source={source()} />);

    expect(field()).toBeDisabled();
    expect(screen.getByRole("button", { name: enComponents.sessionConnect.submitting })).toBeDisabled();
  });

  it("offers nothing to send when the source cannot be read on this server", () => {
    render(<SessionConnectForm source={source({ configured: false })} />);

    expect(field()).toBeDisabled();
    expect(submitButton()).toBeDisabled();
  });

  it("names the action a reconnect when the saved session was refused", () => {
    render(<SessionConnectForm source={source()} reconnect />);

    expect(
      screen.getByRole("button", { name: i18n.t("components:sessionConnect.reconnect", { provider: "YouTube" }) })
    ).toBeInTheDocument();
  });
});
