import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enAuth from "@modules/i18n/messages/en/auth.json";

const state = vi.hoisted(() => ({
  phase: "idle" as "idle" | "pending" | "completed" | "error",
  failure: null as null | { kind: "message"; title: string; description?: string },
  startLogin: vi.fn(),
  markNavigating: vi.fn(),
}));

vi.mock("../../hooks/usePlexLogin", () => ({
  usePlexLogin: () => ({ startLogin: state.startLogin, phase: state.phase, isPending: false, failure: state.failure }),
}));

vi.mock("../../hooks/useAuthTransition", () => ({
  useAuthTransition: () => ({ markNavigating: state.markNavigating }),
}));

import { PlexLoginButton } from "../PlexLoginButton";

beforeEach(() => {
  vi.clearAllMocks();
  state.phase = "idle";
  state.failure = null;
});

describe("PlexLoginButton", () => {
  it("starts the Plex sign-in when pressed", async () => {
    render(<PlexLoginButton />);

    await userEvent.click(screen.getByRole("button", { name: /Plex/ }));

    expect(state.startLogin).toHaveBeenCalledTimes(1);
  });

  it("is busy and disabled while waiting for Plex", () => {
    state.phase = "pending";

    render(<PlexLoginButton />);

    const button = screen.getByRole("button", { name: enAuth.auth.plex.waiting });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("hands over to the loader once signed in", () => {
    state.phase = "completed";

    render(<PlexLoginButton />);

    expect(state.markNavigating).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: enAuth.auth.plex.signedIn })).toBeDisabled();
  });

  it("shows a failure inline in an alert and ties it to the button", () => {
    state.phase = "error";
    state.failure = { kind: "message", title: enAuth.auth.plex.popupBlocked };

    render(<PlexLoginButton />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(enAuth.auth.plex.popupBlocked);
    expect(screen.getByRole("button")).toHaveAccessibleDescription(enAuth.auth.plex.popupBlocked);
  });

  it("shows no alert when nothing failed", () => {
    render(<PlexLoginButton />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
