import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";
import { mockRouter } from "@test/mocks/next.mock";
import enAuth from "@modules/i18n/messages/en/auth.json";
import enComponents from "@modules/i18n/messages/en/components.json";

const api = vi.hoisted(() => ({
  login: vi.fn(async () => undefined),
  pending: false,
  error: false,
  markNavigating: vi.fn(),
}));

vi.mock("@hooks/api/mutations/auth/useLocalLogin", () => ({
  useLocalLogin: () => ({ mutateAsync: api.login, isPending: api.pending, isError: api.error }),
}));

vi.mock("../../hooks/useAuthTransition", () => ({
  useAuthTransition: () => ({ markNavigating: api.markNavigating }),
}));

import { LoginForm } from "../LoginForm";

function renderForm() {
  render(<LoginForm />);
  return { user: userEvent.setup() };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.pending = false;
  api.error = false;
  api.login.mockResolvedValue(undefined);
});

describe("the login form", () => {
  it("asks for an email and a password", () => {
    renderForm();

    expect(screen.getByLabelText(enAuth.auth.form.emailLabel)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: enAuth.auth.form.submit })).toBeInTheDocument();
  });

  it("signs in with what the listener typed", async () => {
    const { user } = renderForm();

    await user.type(screen.getByLabelText(enAuth.auth.form.emailLabel), "someone@example.com");
    await user.type(screen.getByLabelText(enComponents.passwordField.label), "hunter2");
    await user.click(screen.getByRole("button", { name: enAuth.auth.form.submit }));

    await waitFor(() => expect(api.login).toHaveBeenCalledWith({ email: "someone@example.com", password: "hunter2" }));
  });

  it("takes the listener to the app once they are in", async () => {
    const { user } = renderForm();

    await user.type(screen.getByLabelText(enAuth.auth.form.emailLabel), "someone@example.com");
    await user.type(screen.getByLabelText(enComponents.passwordField.label), "hunter2");
    await user.click(screen.getByRole("button", { name: enAuth.auth.form.submit }));

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/"));
    expect(api.markNavigating).toHaveBeenCalled();
  });

  it("stays on the form when the sign-in was refused", async () => {
    api.login.mockRejectedValue(new Error("invalid credentials"));
    const { user } = renderForm();

    await user.type(screen.getByLabelText(enAuth.auth.form.emailLabel), "someone@example.com");
    await user.type(screen.getByLabelText(enComponents.passwordField.label), "wrong");
    await user.click(screen.getByRole("button", { name: enAuth.auth.form.submit }));

    await waitFor(() => expect(api.login).toHaveBeenCalled());
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("says it is signing in rather than letting the button be pressed twice", () => {
    api.pending = true;

    renderForm();

    expect(screen.getByRole("button", { name: enAuth.auth.form.submitting })).toBeDisabled();
  });

  it("marks the password field as wrong when the sign-in was refused", () => {
    api.error = true;

    renderForm();

    expect(screen.getByLabelText(enComponents.passwordField.label)).toHaveAttribute("aria-invalid", "true");
  });

  it("leaves the password field unmarked before anything has been refused", () => {
    renderForm();

    expect(screen.getByLabelText(enComponents.passwordField.label)).not.toHaveAttribute("aria-invalid");
  });
});
