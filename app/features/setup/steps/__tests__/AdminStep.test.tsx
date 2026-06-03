import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { AdminStep } from "../AdminStep";
import { ADMIN_COPY } from "../../constants";

interface BootstrapInput {
  email: string;
  username: string;
  password: string;
}

const mutateAsync = vi.fn<(input: BootstrapInput) => Promise<unknown>>();

vi.mock("@hooks/api/mutations/auth/useSetupBootstrap", () => ({
  useSetupBootstrap: () => ({ mutateAsync, isPending: false }),
}));

const onComplete = vi.fn();

const renderStep = () => render(<AdminStep stepIndex={0} totalSteps={5} onComplete={onComplete} />);

const fillFields = () => {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "admin@example.com" } });
  fireEvent.change(screen.getByLabelText("Username"), { target: { value: "adminuser" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "supersecret" } });
};

const createButton = () => screen.getByRole("button", { name: "Create admin" });

describe("AdminStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutateAsync.mockResolvedValue(undefined);
  });

  it("creates the admin exactly once when the primary is pressed (no double bootstrap)", async () => {
    renderStep();
    fillFields();

    fireEvent.click(createButton());

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
    expect(mutateAsync).toHaveBeenCalledWith({
      email: "admin@example.com",
      username: "adminuser",
      password: "supersecret",
    });
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  });

  it("creates the admin exactly once when Enter is pressed in a field", async () => {
    renderStep();
    fillFields();

    fireEvent.submit(screen.getByLabelText("Password").closest("form")!);

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  });

  it("keeps the primary disabled until every field meets its minimum", () => {
    renderStep();

    expect(createButton()).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "admin@example.com" } });
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "ad" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "short" } });

    expect(createButton()).toBeDisabled();

    fillFields();

    expect(createButton()).toBeEnabled();
  });

  it("shows the username and password requirement hints associated with their inputs", () => {
    renderStep();

    const username = screen.getByLabelText("Username");
    const password = screen.getByLabelText("Password");

    expect(screen.getByText(ADMIN_COPY.usernameHint)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_COPY.passwordHint)).toBeInTheDocument();

    const usernameHintId = username.getAttribute("aria-describedby");
    const passwordHintId = password.getAttribute("aria-describedby");
    expect(usernameHintId).toBeTruthy();
    expect(passwordHintId).toBeTruthy();
    expect(document.getElementById(usernameHintId!)).toHaveTextContent(ADMIN_COPY.usernameHint);
    expect(document.getElementById(passwordHintId!)).toHaveTextContent(ADMIN_COPY.passwordHint);
  });

  it("keeps the primary disabled and shows an accessible error for an invalid email, clearing it once valid", () => {
    renderStep();

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "adminuser" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "supersecret" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } });

    const email = screen.getByLabelText("Email");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(ADMIN_COPY.emailError)).toBeInTheDocument();
    expect(createButton()).toBeDisabled();

    const emailErrorId = email.getAttribute("aria-describedby");
    expect(emailErrorId).toBeTruthy();
    expect(document.getElementById(emailErrorId!)).toHaveTextContent(ADMIN_COPY.emailError);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "admin@example.com" } });

    expect(screen.queryByText(ADMIN_COPY.emailError)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
    expect(createButton()).toBeEnabled();
  });

  it("upgrades a violated field hint to an accessible error tone", () => {
    renderStep();

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "ab" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "tiny" } });

    const username = screen.getByLabelText("Username");
    const password = screen.getByLabelText("Password");

    expect(username).toHaveAttribute("aria-invalid", "true");
    expect(password).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Use between 3 and 32 characters.")).toBeInTheDocument();
    expect(screen.getByText("Use at least 8 characters.")).toBeInTheDocument();
  });
});
