import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";

import { ENGINE_DEFAULTS } from "../defaults";
import type { WantedCardProps } from "../types";

const update = createMockMutation();

vi.mock("@hooks/api/mutations/settings/useUpdateEngine", () => ({
  useUpdateEngineWanted: () => update,
}));

import { WantedCard } from "../WantedCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const initial: WantedCardProps["initial"] = { enabled: false, perRunCap: 10, maxAttempts: 8 };

describe("WantedCard", () => {
  it("renders the card title and controls seeded from the fetched group", () => {
    render(<WantedCard initial={initial} />);

    expect(screen.getByText(enSettings.wanted.title)).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: enSettings.wanted.enabled.label })).not.toBeChecked();
    expect(screen.getByLabelText(enSettings.wanted.perRunCap.ariaLabel)).toHaveValue(10);
    expect(screen.getByLabelText(enSettings.wanted.maxAttempts.ariaLabel)).toHaveValue(8);
  });

  it("saves the full group draft when only the toggle changed", async () => {
    render(<WantedCard initial={{ enabled: false, perRunCap: 25, maxAttempts: 3 }} />);

    await userEvent.click(screen.getByRole("switch", { name: enSettings.wanted.enabled.label }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({ enabled: true, perRunCap: 25, maxAttempts: 3 });
    });
  });

  it("saves the full group draft when only a numeric field changed", async () => {
    render(<WantedCard initial={{ enabled: true, perRunCap: 10, maxAttempts: 8 }} />);

    fireEvent.change(screen.getByLabelText(enSettings.wanted.perRunCap.ariaLabel), { target: { value: "30" } });
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({ enabled: true, perRunCap: 30, maxAttempts: 8 });
    });
  });

  it("resets every field to the engine defaults", async () => {
    render(<WantedCard initial={{ enabled: true, perRunCap: 25, maxAttempts: 3 }} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.resetDefaults.label }));

    expect(screen.getByRole("switch", { name: enSettings.wanted.enabled.label })).not.toBeChecked();
    expect(screen.getByLabelText(enSettings.wanted.perRunCap.ariaLabel)).toHaveValue(ENGINE_DEFAULTS.wanted.perRunCap);
    expect(screen.getByLabelText(enSettings.wanted.maxAttempts.ariaLabel)).toHaveValue(
      ENGINE_DEFAULTS.wanted.maxAttempts
    );
  });

  it("reverts the draft when cancel is pressed", async () => {
    render(<WantedCard initial={initial} />);

    await userEvent.click(screen.getByRole("switch", { name: enSettings.wanted.enabled.label }));
    expect(screen.getByRole("button", { name: enSettings.shell.saveBar.save })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.cancel }));

    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).not.toBeInTheDocument();
    expect(screen.getByRole("switch", { name: enSettings.wanted.enabled.label })).not.toBeChecked();
  });
});
