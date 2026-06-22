import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";

import { ENGINE_DEFAULTS } from "../defaults";
import type { QueueCardProps } from "../types";

const update = createMockMutation();

vi.mock("@hooks/api/mutations/settings/useUpdateEngine", () => ({
  useUpdateEngineQueue: () => update,
}));

import { QueueCard } from "../QueueCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const initial: QueueCardProps["initial"] = {
  maxSize: 1000,
  maxConcurrentSearches: 3,
  maxPendingImports: 6,
};

describe("QueueCard", () => {
  it("renders the card title and the three controls", () => {
    render(<QueueCard initial={initial} />);
    expect(screen.getByText(enSettings.queue.title)).toBeInTheDocument();
    expect(screen.getByLabelText(enSettings.queue.maxSize.ariaLabel)).toHaveValue(1000);
    expect(screen.getByLabelText(enSettings.queue.maxConcurrentSearches.ariaLabel)).toHaveValue(3);
    expect(screen.getByLabelText(enSettings.queue.maxPendingImports.ariaLabel)).toHaveValue(6);
  });

  it("hides the save bar until a field changes", async () => {
    render(<QueueCard initial={initial} />);
    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(enSettings.queue.maxSize.ariaLabel), { target: { value: "2000" } });
    expect(screen.getByRole("button", { name: enSettings.shell.saveBar.save })).toBeInTheDocument();
  });

  it("saves the edited draft across every field", async () => {
    render(<QueueCard initial={initial} />);

    fireEvent.change(screen.getByLabelText(enSettings.queue.maxSize.ariaLabel), { target: { value: "2000" } });
    fireEvent.change(screen.getByLabelText(enSettings.queue.maxConcurrentSearches.ariaLabel), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText(enSettings.queue.maxPendingImports.ariaLabel), { target: { value: "9" } });
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({
        maxSize: 2000,
        maxConcurrentSearches: 5,
        maxPendingImports: 9,
      });
    });
  });

  it("reverts the draft when cancel is pressed", async () => {
    render(<QueueCard initial={initial} />);

    fireEvent.change(screen.getByLabelText(enSettings.queue.maxSize.ariaLabel), { target: { value: "2000" } });
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.cancel }));

    expect(screen.getByLabelText(enSettings.queue.maxSize.ariaLabel)).toHaveValue(1000);
    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).not.toBeInTheDocument();
  });

  it("resets every field to the engine defaults", async () => {
    const dirty: QueueCardProps["initial"] = { maxSize: 4000, maxConcurrentSearches: 8, maxPendingImports: 10 };
    render(<QueueCard initial={dirty} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.resetDefaults.label }));

    expect(screen.getByLabelText(enSettings.queue.maxSize.ariaLabel)).toHaveValue(ENGINE_DEFAULTS.queue.maxSize);
    expect(screen.getByLabelText(enSettings.queue.maxConcurrentSearches.ariaLabel)).toHaveValue(
      ENGINE_DEFAULTS.queue.maxConcurrentSearches
    );
    expect(screen.getByLabelText(enSettings.queue.maxPendingImports.ariaLabel)).toHaveValue(
      ENGINE_DEFAULTS.queue.maxPendingImports
    );
  });
});
