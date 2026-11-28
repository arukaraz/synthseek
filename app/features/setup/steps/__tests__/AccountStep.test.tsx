import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import enComponents from "@modules/i18n/messages/en/components.json";
import enSetup from "@modules/i18n/messages/en/setup.json";

import { AccountStep } from "../AccountStep";

const api = vi.hoisted(() => ({ bootstrap: vi.fn(), tokenRequired: { value: false } }));

vi.mock("@hooks/api/mutations/auth/useSetupBootstrap", () => ({
  useSetupBootstrap: () => ({ mutateAsync: api.bootstrap }),
}));

vi.mock("@hooks/api/queries/useSetupRequired", () => ({
  useSetupRequired: () => ({ data: { required: true, tokenRequired: api.tokenRequired.value } }),
}));

vi.mock("@components/AccessibilityPanel", () => ({
  AccessibilityPanel: () => <button type="button">Accessibility</button>,
}));

function refusal(appCode: string, appParams: Record<string, string | number> = {}) {
  return Object.assign(new Error("refused"), { data: { appCode, appParams } });
}

const submitName = enSetup.account.submit;
const passwordLabel = enComponents.passwordField.label;

function renderStep() {
  const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
  render(<AccountStep />);
  return { user };
}

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(enSetup.account.emailLabel), " admin@example.com ");
  await user.type(screen.getByLabelText(enSetup.account.usernameLabel), " admin ");
  await user.type(screen.getByLabelText(passwordLabel), "hunter2hunter2");
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.clearAllMocks();
  api.tokenRequired.value = false;
  api.bootstrap.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("the question", () => {
  it("is the first of four, titled by its words, with no way back and no skip", () => {
    renderStep();

    expect(screen.getByRole("heading", { level: 1, name: enSetup.account.title })).toHaveFocus();
    expect(screen.getByText("Question 1 of 4")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: enSetup.actions.back })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: enSetup.actions.skip })).not.toBeInTheDocument();
  });

  it("offers the accessibility control", () => {
    renderStep();

    expect(screen.getByRole("button", { name: "Accessibility" })).toBeInTheDocument();
  });

  it("asks for the setup token only when the server wants one", () => {
    const { unmount } = render(<AccountStep />);
    expect(screen.queryByLabelText(enSetup.account.tokenLabel)).not.toBeInTheDocument();
    unmount();

    api.tokenRequired.value = true;
    render(<AccountStep />);

    expect(screen.getByLabelText(enSetup.account.tokenLabel)).toBeInTheDocument();
  });
});

describe("creating the account", () => {
  it("sends the trimmed details and nothing else when no token is needed", async () => {
    const { user } = renderStep();
    await fill(user);

    await user.click(screen.getByRole("button", { name: submitName }));

    expect(api.bootstrap).toHaveBeenCalledWith({
      email: "admin@example.com",
      username: "admin",
      password: "hunter2hunter2",
    });
  });

  it("submits with Enter from a field", async () => {
    const { user } = renderStep();
    await fill(user);

    await user.type(screen.getByLabelText(passwordLabel), "{Enter}");

    expect(api.bootstrap).toHaveBeenCalledTimes(1);
  });

  it("sends the trimmed token when the server wants one", async () => {
    api.tokenRequired.value = true;
    const { user } = renderStep();
    await fill(user);
    await user.type(screen.getByLabelText(enSetup.account.tokenLabel), "  tok-123 ");

    await user.click(screen.getByRole("button", { name: submitName }));

    expect(api.bootstrap).toHaveBeenCalledWith(expect.objectContaining({ setupToken: "tok-123" }));
  });

  it("does not send an incomplete form, names each fault and puts the cursor on the first one", async () => {
    const { user } = renderStep();

    await user.click(screen.getByRole("button", { name: submitName }));

    expect(api.bootstrap).not.toHaveBeenCalled();
    expect(screen.getByText(enSetup.account.emailError)).toBeInTheDocument();
    expect(screen.getByText(enSetup.account.usernameError)).toBeInTheDocument();
    expect(screen.getByText(enSetup.account.passwordError)).toBeInTheDocument();
    expect(screen.getByLabelText(enSetup.account.emailLabel)).toHaveFocus();
    expect(screen.getByLabelText(enSetup.account.emailLabel)).toHaveAttribute("aria-invalid", "true");
  });

  it("asks for the token first when it is the missing piece", async () => {
    api.tokenRequired.value = true;
    const { user } = renderStep();

    await user.click(screen.getByRole("button", { name: submitName }));

    expect(screen.getByText(enSetup.account.tokenMissing)).toBeInTheDocument();
    expect(screen.getByLabelText(enSetup.account.tokenLabel)).toHaveFocus();
  });

  it("shows the server's refusal as a message and lets the visitor try again", async () => {
    api.bootstrap.mockRejectedValueOnce(refusal("SOMETHING_ELSE"));
    const { user } = renderStep();
    await fill(user);

    await user.click(screen.getByRole("button", { name: submitName }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: submitName })).toBeEnabled();
  });

  it("puts a rejected token on the token field", async () => {
    api.tokenRequired.value = true;
    api.bootstrap.mockRejectedValueOnce(refusal("SETUP_TOKEN_INVALID"));
    const { user } = renderStep();
    await fill(user);
    await user.type(screen.getByLabelText(enSetup.account.tokenLabel), "wrong");

    await user.click(screen.getByRole("button", { name: submitName }));

    const token = screen.getByLabelText(enSetup.account.tokenLabel);
    expect(token).toHaveAttribute("aria-invalid", "true");
  });

  it("holds the button while it waits and does not send twice", async () => {
    let finish: () => void = () => {};
    api.bootstrap.mockReturnValueOnce(new Promise<void>((resolve) => (finish = resolve)));
    const { user } = renderStep();
    await fill(user);

    await user.click(screen.getByRole("button", { name: submitName }));
    const busy = screen.getByRole("button", { name: enSetup.account.creating });
    await user.click(busy);

    expect(busy).toBeDisabled();
    expect(api.bootstrap).toHaveBeenCalledTimes(1);
    await act(async () => finish());
  });
});

describe("a throttle", () => {
  it("counts down, blocks the button, then says the visitor can try again", async () => {
    api.bootstrap.mockRejectedValueOnce(refusal("TOO_MANY_LOGIN_ATTEMPTS", { retryAfterSeconds: 3 }));
    const { user } = renderStep();
    await fill(user);

    await user.click(screen.getByRole("button", { name: submitName }));

    expect(await screen.findByText("Too many attempts. Try again in 0:03.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: submitName })).toBeDisabled();

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText(enSetup.account.throttled.released)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: submitName })).toBeEnabled();
  });
});
