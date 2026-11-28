import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";
import { mockRouter, resetNextMocks } from "@test/mocks/next.mock";
import enAuth from "@modules/i18n/messages/en/auth.json";
import enErrors from "@modules/i18n/messages/en/errors.json";

const api = vi.hoisted(() => ({
  signIn: vi.fn(),
  markNavigating: vi.fn(),
}));

vi.mock("@hooks/api/mutations/auth/useJellyfinSignIn", () => ({
  useJellyfinSignIn: () => ({ mutateAsync: api.signIn }),
}));

vi.mock("../../hooks/useAuthTransition", () => ({
  useAuthTransition: () => ({ markNavigating: api.markNavigating }),
}));

import { JellyfinSignInForm } from "../JellyfinSignInForm";

const copy = enAuth.auth.jellyfin;

function refusal(appCode: string, appParams: Record<string, string | number> = {}) {
  return Object.assign(new Error("refused"), { data: { appCode, appParams } });
}

function renderForm() {
  const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
  render(<JellyfinSignInForm id="jellyfin" />);
  return { user };
}

async function signIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(copy.usernameLabel), " ana ");
  await user.type(screen.getByLabelText(copy.passwordLabel), "hunter2");
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.clearAllMocks();
  resetNextMocks();
  api.signIn.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
  window.history.replaceState({}, "", "/");
});

describe("JellyfinSignInForm", () => {
  it("signs in with the trimmed username and goes to the validated return path", async () => {
    window.history.replaceState({}, "", "/login?next=%2Flibrary");
    const { user } = renderForm();

    await signIn(user);

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/library"));
    expect(api.signIn).toHaveBeenCalledWith({ username: "ana", password: "hunter2" });
    expect(api.markNavigating).toHaveBeenCalled();
  });

  it("says inline that the Jellyfin credentials did not match, and marks the fields", async () => {
    api.signIn.mockRejectedValue(refusal("INVALID_CREDENTIALS"));
    const { user } = renderForm();

    await signIn(user);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(copy.invalidCredentials);
    expect(screen.getByLabelText(copy.usernameLabel)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(copy.passwordLabel)).toHaveFocus();
  });

  it("holds the form while throttled and gives it back when the wait is over", async () => {
    api.signIn.mockRejectedValue(refusal("TOO_MANY_LOGIN_ATTEMPTS", { retryAfterSeconds: 30 }));
    const { user } = renderForm();

    await signIn(user);

    await waitFor(() => expect(screen.getByLabelText(copy.usernameLabel)).toBeDisabled());
    vi.advanceTimersByTime(30 * 1000);
    await waitFor(() => expect(screen.getByLabelText(copy.usernameLabel)).not.toBeDisabled());
  });

  it("gives an account waiting for approval its own message instead of a refusal", async () => {
    api.signIn.mockRejectedValue(refusal("ACCOUNT_PENDING_APPROVAL"));
    const { user } = renderForm();

    await signIn(user);

    await screen.findByText(enErrors.ACCOUNT_PENDING_APPROVAL.title);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText(copy.usernameLabel)).not.toHaveAttribute("aria-invalid");
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("says Jellyfin could not be reached with the catalog words", async () => {
    api.signIn.mockRejectedValue(refusal("JELLYFIN_SIGN_IN_UNAVAILABLE"));
    const { user } = renderForm();

    await signIn(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(enErrors.JELLYFIN_SIGN_IN_UNAVAILABLE.title);
  });
});
