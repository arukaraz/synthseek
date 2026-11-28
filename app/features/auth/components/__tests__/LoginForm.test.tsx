import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";
import { expectNoAxeViolations } from "@test/a11y/axe";
import { mockRouter, resetNextMocks } from "@test/mocks/next.mock";
import enAuth from "@modules/i18n/messages/en/auth.json";
import enComponents from "@modules/i18n/messages/en/components.json";
import enErrors from "@modules/i18n/messages/en/errors.json";

const api = vi.hoisted(() => ({
  login: vi.fn(),
  markNavigating: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@hooks/api/mutations/auth/useLocalLogin", () => ({
  useLocalLogin: () => ({ mutateAsync: api.login }),
}));

vi.mock("../../hooks/useAuthTransition", () => ({
  useAuthTransition: () => ({ markNavigating: api.markNavigating }),
}));

vi.mock("sonner", () => ({
  toast: { error: api.toastError, success: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

import { LoginForm } from "../LoginForm";

const emailLabel = enAuth.auth.form.emailLabel;
const passwordLabel = enComponents.passwordField.label;
const submitName = enAuth.auth.form.submit;

function refusal(appCode: string, appParams: Record<string, string | number> = {}) {
  return Object.assign(new Error("refused"), { data: { appCode, appParams } });
}

function renderForm() {
  const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
  render(<LoginForm />);
  return { user };
}

async function signIn(user: ReturnType<typeof userEvent.setup>, password = "hunter2") {
  await user.type(screen.getByLabelText(emailLabel), "someone@example.com");
  await user.type(screen.getByLabelText(passwordLabel), password);
  await user.click(screen.getByRole("button", { name: submitName }));
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.clearAllMocks();
  resetNextMocks();
  api.login.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/");
});

describe("the fields", () => {
  it("asks for an email and a password with the autocomplete a password manager looks for", () => {
    renderForm();

    expect(screen.getByLabelText(emailLabel)).toHaveAttribute("autocomplete", "username");
    expect(screen.getByLabelText(passwordLabel)).toHaveAttribute("autocomplete", "current-password");
  });

  it("offers a named control to show the password", async () => {
    const { user } = renderForm();
    const password = screen.getByLabelText(passwordLabel);
    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: enComponents.passwordField.show }));

    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: enComponents.passwordField.hide })).toBeInTheDocument();
  });

  it("submits when Enter is pressed in the password field", async () => {
    const { user } = renderForm();

    await user.type(screen.getByLabelText(emailLabel), "someone@example.com");
    await user.type(screen.getByLabelText(passwordLabel), "hunter2{Enter}");

    await waitFor(() => expect(api.login).toHaveBeenCalledWith({ email: "someone@example.com", password: "hunter2" }));
  });

  it("focuses the first field on a desktop", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true }))
    );

    renderForm();

    expect(screen.getByLabelText(emailLabel)).toHaveFocus();
  });

  it("does not focus any field on a phone, where it would open the keyboard over the sheet", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false }))
    );

    renderForm();

    expect(screen.getByLabelText(emailLabel)).not.toHaveFocus();
  });
});

describe("signing in", () => {
  it("takes the listener home when no destination was asked for", async () => {
    const { user } = renderForm();

    await signIn(user);

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/"));
    expect(api.markNavigating).toHaveBeenCalled();
  });

  it("takes the listener to the deep link they came for", async () => {
    window.history.replaceState({}, "", `/login?next=${encodeURIComponent("/library?tab=albums#top")}`);
    const { user } = renderForm();

    await signIn(user);

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/library?tab=albums#top"));
  });

  it("takes the listener back to the oauth consent screen they were sent from", async () => {
    window.history.replaceState({}, "", `/login?next=${encodeURIComponent("/oauth/consent?grant=g-1")}`);
    const { user } = renderForm();

    await signIn(user);

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/oauth/consent?grant=g-1"));
  });

  it.each([
    ["a protocol-relative host", "//evil.example"],
    ["a backslash host", "\\\\evil.example"],
    ["an absolute URL", "https://evil.example/x"],
  ])("goes home instead of to %s", async (_name, hostile) => {
    window.history.replaceState({}, "", `/login?next=${encodeURIComponent(hostile)}`);
    const { user } = renderForm();

    await signIn(user);

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/"));
    expect(mockRouter.replace).not.toHaveBeenCalledWith(hostile);
  });

  it("says it is signing in and lets the button be pressed only once", async () => {
    api.login.mockReturnValue(new Promise(() => undefined));
    const { user } = renderForm();

    await signIn(user);

    const busy = screen.getByRole("button", { name: enAuth.auth.form.submitting });
    expect(busy).toBeDisabled();
    expect(busy).toHaveAttribute("aria-busy", "true");
    expect(api.login).toHaveBeenCalledTimes(1);
  });

  it("tells an account waiting for approval so, without calling its password wrong", async () => {
    api.login.mockRejectedValue(refusal("ACCOUNT_PENDING_APPROVAL"));
    const { user } = renderForm();

    await signIn(user);

    await screen.findByText(enErrors.ACCOUNT_PENDING_APPROVAL.title);
    expect(screen.getByText(enErrors.ACCOUNT_PENDING_APPROVAL.description)).toBeInTheDocument();
    expect(screen.queryByText(enAuth.auth.login.errors.invalidCredentials)).not.toBeInTheDocument();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("sends the visitor to first-run setup when the server says there is no administrator yet", async () => {
    api.login.mockRejectedValue(refusal("PLEX_SIGN_IN_NEEDS_SETUP"));
    const { user } = renderForm();

    await signIn(user);

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/setup"));
  });
});

describe("a refused sign-in", () => {
  beforeEach(() => {
    api.login.mockRejectedValue(refusal("INVALID_CREDENTIALS"));
  });

  it("explains itself inside the form, in an alert", async () => {
    const { user } = renderForm();

    await signIn(user, "wrong");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(enAuth.auth.login.errors.invalidCredentials);
    expect(screen.getByRole("button", { name: submitName }).closest("form")).toContainElement(alert);
  });

  it("marks both fields as invalid and ties each to the message", async () => {
    const { user } = renderForm();

    await signIn(user, "wrong");

    const alert = await screen.findByRole("alert");
    for (const field of [screen.getByLabelText(emailLabel), screen.getByLabelText(passwordLabel)]) {
      expect(field).toHaveAttribute("aria-invalid", "true");
      expect(field).toHaveAccessibleDescription(enAuth.auth.login.errors.invalidCredentials);
      expect(field.getAttribute("aria-describedby")).toBe(alert.id);
    }
  });

  it("does not use a toast", async () => {
    const { user } = renderForm();

    await signIn(user, "wrong");

    await screen.findByRole("alert");
    expect(api.toastError).not.toHaveBeenCalled();
  });

  it("does not leave the sign-in page", async () => {
    const { user } = renderForm();

    await signIn(user, "wrong");

    await screen.findByRole("alert");
    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(api.markNavigating).not.toHaveBeenCalled();
  });

  it("puts the cursor back in the password field", async () => {
    const { user } = renderForm();

    await signIn(user, "wrong");

    await screen.findByRole("alert");
    expect(screen.getByLabelText(passwordLabel)).toHaveFocus();
  });

  it("stays until the next attempt, then clears while that attempt is under way", async () => {
    const { user } = renderForm();
    await signIn(user, "wrong");
    await screen.findByRole("alert");

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();

    api.login.mockReturnValue(new Promise(() => undefined));
    await user.click(screen.getByRole("button", { name: submitName }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText(passwordLabel)).not.toHaveAttribute("aria-invalid");
  });

  it("says plainly what went wrong when the server cannot be reached, without the raw network message", async () => {
    api.login.mockRejectedValue(new Error("Failed to fetch"));
    const { user } = renderForm();

    await signIn(user, "wrong");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(enAuth.auth.login.errors.generic);
    expect(alert).not.toHaveTextContent("Failed to fetch");
  });

  it("shows the title and description of any other coded refusal", async () => {
    api.login.mockRejectedValue(refusal("ADMIN_ROLE_REQUIRED"));
    const { user } = renderForm();

    await signIn(user, "wrong");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(enErrors.ADMIN_ROLE_REQUIRED.title);
    expect(alert).toHaveTextContent(enErrors.ADMIN_ROLE_REQUIRED.description);
  });
});

describe("too many attempts", () => {
  beforeEach(() => {
    api.login.mockRejectedValue(refusal("TOO_MANY_LOGIN_ATTEMPTS", { retryAfterSeconds: 3 }));
  });

  it("disables the whole form and says how long to wait", async () => {
    const { user } = renderForm();

    await signIn(user);

    expect(await screen.findByText("Too many sign-in attempts. Try again in 0:03.")).toBeInTheDocument();
    expect(screen.getByLabelText(emailLabel)).toBeDisabled();
    expect(screen.getByLabelText(passwordLabel)).toBeDisabled();
    expect(screen.getByRole("button", { name: submitName })).toBeDisabled();
  });

  it("counts down on screen every second", async () => {
    const { user } = renderForm();
    await signIn(user);
    await screen.findByText("Too many sign-in attempts. Try again in 0:03.");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("Too many sign-in attempts. Try again in 0:02.")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("Too many sign-in attempts. Try again in 0:01.")).toBeInTheDocument();
  });

  it("announces the wait once, not every second", async () => {
    const { user } = renderForm();
    await signIn(user);
    const alert = await screen.findByRole("alert");
    const announced = alert.textContent;
    expect(announced).toBe("Too many sign-in attempts. You can try again in 3 seconds.");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("alert")).toBe(alert);
    expect(alert.textContent).toBe(announced);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("alert")).toBe(alert);
    expect(alert.textContent).toBe(announced);
  });

  it("re-enables the form by itself when the time is up, and says so", async () => {
    const { user } = renderForm();
    await signIn(user);
    await screen.findByRole("alert");

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText(/Try again in/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(emailLabel)).toBeEnabled();
    expect(screen.getByLabelText(passwordLabel)).toBeEnabled();
    expect(screen.getByRole("button", { name: submitName })).toBeEnabled();
    expect(screen.getByRole("status")).toHaveTextContent(enAuth.auth.login.throttled.released);
  });

  it("keeps what the listener typed through the wait", async () => {
    const { user } = renderForm();
    await signIn(user, "hunter2");
    await screen.findByRole("alert");

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByLabelText(emailLabel)).toHaveValue("someone@example.com");
    expect(screen.getByLabelText(passwordLabel)).toHaveValue("hunter2");
  });

  it("falls back to a default wait when the server does not say how long", async () => {
    api.login.mockRejectedValue(refusal("TOO_MANY_LOGIN_ATTEMPTS"));
    const { user } = renderForm();

    await signIn(user);

    expect(await screen.findByText("Too many sign-in attempts. Try again in 1:00.")).toBeInTheDocument();
  });

  it("has no axe violation, empty or showing a refusal", async () => {
    const { container } = render(<LoginForm />);
    await expectNoAxeViolations(container);

    api.login.mockRejectedValue(refusal("TOO_MANY_LOGIN_ATTEMPTS"));
    const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
    await signIn(user);
    await screen.findByText("Too many sign-in attempts. Try again in 1:00.");

    await expectNoAxeViolations(container);
  });
});
