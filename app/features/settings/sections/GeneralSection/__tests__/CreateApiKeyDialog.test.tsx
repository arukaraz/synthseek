import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";
import type { CreatedApiKey } from "../types";

const create = createMockMutation();

vi.mock("@hooks/api/mutations/api-keys/useCreateApiKey", () => ({
  useCreateApiKey: () => create,
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (msg: string) => toastSuccess(msg),
    error: (msg: string) => toastError(msg),
  },
}));

import { CreateApiKeyDialog } from "../CreateApiKeyDialog";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const created: CreatedApiKey = {
  id: "key-1",
  name: "Claude Desktop",
  token: "sk-secret-token",
  created_at: new Date("2024-01-01T00:00:00Z"),
};

describe("CreateApiKeyDialog", () => {
  it("renders nothing visible when closed", () => {
    render(<CreateApiKeyDialog open={false} onOpenChange={vi.fn()} />);

    expect(screen.queryByText(enSettings.api.create.title)).not.toBeInTheDocument();
  });

  it("keeps the submit button disabled until a name is entered", async () => {
    render(<CreateApiKeyDialog open onOpenChange={vi.fn()} />);

    const submit = screen.getByRole("button", { name: enSettings.api.create.create });
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText(enSettings.api.create.nameAriaLabel), "My key");
    expect(submit).toBeEnabled();
  });

  it("submits a trimmed name through the create mutation", async () => {
    render(<CreateApiKeyDialog open onOpenChange={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(enSettings.api.create.nameAriaLabel), "  Spaced  ");
    await userEvent.click(screen.getByRole("button", { name: enSettings.api.create.create }));

    expect(create.mutate).toHaveBeenCalledWith({ name: "Spaced" }, expect.any(Object));
  });

  it("does not call the mutation when the form is submitted without a name", () => {
    render(<CreateApiKeyDialog open onOpenChange={vi.fn()} />);

    const input = screen.getByLabelText(enSettings.api.create.nameAriaLabel);
    const form = input.closest("form");
    expect(form).not.toBeNull();
    if (form) fireEvent.submit(form);

    expect(create.mutate).not.toHaveBeenCalled();
  });

  it("reveals the token after a successful create and copies it", async () => {
    create.mutate.mockImplementation(
      (_input: { name: string }, opts?: { onSuccess?: (result: CreatedApiKey) => void }) => {
        opts?.onSuccess?.(created);
      }
    );
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<CreateApiKeyDialog open onOpenChange={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(enSettings.api.create.nameAriaLabel), "My key");
    await userEvent.click(screen.getByRole("button", { name: enSettings.api.create.create }));

    expect(screen.getByText(enSettings.api.create.revealTitle)).toBeInTheDocument();
    expect(screen.getByText("sk-secret-token")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: enSettings.api.create.copy }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("sk-secret-token");
      expect(toastSuccess).toHaveBeenCalledWith(enSettings.api.create.copied);
    });
  });

  it("surfaces a copy failure toast when the clipboard rejects", async () => {
    create.mutate.mockImplementation(
      (_input: { name: string }, opts?: { onSuccess?: (result: CreatedApiKey) => void }) => {
        opts?.onSuccess?.(created);
      }
    );
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });

    render(<CreateApiKeyDialog open onOpenChange={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(enSettings.api.create.nameAriaLabel), "My key");
    await userEvent.click(screen.getByRole("button", { name: enSettings.api.create.create }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.api.create.copy }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(enSettings.api.create.copyFailed);
    });
  });

  it("resets state and reports close when done is pressed", async () => {
    create.mutate.mockImplementation(
      (_input: { name: string }, opts?: { onSuccess?: (result: CreatedApiKey) => void }) => {
        opts?.onSuccess?.(created);
      }
    );
    const onOpenChange = vi.fn();
    render(<CreateApiKeyDialog open onOpenChange={onOpenChange} />);

    await userEvent.type(screen.getByLabelText(enSettings.api.create.nameAriaLabel), "My key");
    await userEvent.click(screen.getByRole("button", { name: enSettings.api.create.create }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.api.create.done }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes through the dialog dismissal path when escape is pressed", async () => {
    const onOpenChange = vi.fn();
    render(<CreateApiKeyDialog open onOpenChange={onOpenChange} />);

    await userEvent.keyboard("{Escape}");

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("ignores dialog open transitions that are not a dismissal", async () => {
    const onOpenChange = vi.fn();
    render(<CreateApiKeyDialog open onOpenChange={onOpenChange} />);

    await userEvent.type(screen.getByLabelText(enSettings.api.create.nameAriaLabel), "Keep open");

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
