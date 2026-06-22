import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";

import { MS } from "../constants";
import { ENGINE_DEFAULTS } from "../defaults";
import type { TimeoutsCardProps } from "../types";

const update = createMockMutation();

vi.mock("@hooks/api/mutations/settings/useUpdateEngine", () => ({
  useUpdateEngineTimeouts: () => update,
}));

import { TimeoutsCard } from "../TimeoutsCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const initial: TimeoutsCardProps["initial"] = {
  searchPhase: 15000,
  downloadPhase: 1200000,
  importPhase: 300000,
  peerUnresponsive: 120000,
  queueWaitActivePeer: 480000,
  queueWaitIdlePeer: 720000,
};

describe("TimeoutsCard", () => {
  it("renders the milliseconds values converted to seconds", () => {
    render(<TimeoutsCard initial={initial} />);
    expect(screen.getByText(enSettings.timeouts.title)).toBeInTheDocument();
    expect(screen.getByLabelText(enSettings.timeouts.downloadPhase.ariaLabel)).toHaveValue(1200);
    expect(screen.getByLabelText(enSettings.timeouts.importPhase.ariaLabel)).toHaveValue(300);
  });

  it("saves the timeouts converting seconds back to milliseconds", async () => {
    render(<TimeoutsCard initial={initial} />);

    fireEvent.change(screen.getByLabelText(enSettings.timeouts.downloadPhase.ariaLabel), { target: { value: "600" } });
    fireEvent.change(screen.getByLabelText(enSettings.timeouts.importPhase.ariaLabel), { target: { value: "120" } });
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({
        ...initial,
        downloadPhase: 600 * MS,
        importPhase: 120 * MS,
      });
    });
  });

  it("resets only the download and import phases to defaults", async () => {
    const dirty: TimeoutsCardProps["initial"] = { ...initial, downloadPhase: 999000, importPhase: 999000 };
    render(<TimeoutsCard initial={dirty} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.resetDefaults.label }));

    expect(screen.getByLabelText(enSettings.timeouts.downloadPhase.ariaLabel)).toHaveValue(
      ENGINE_DEFAULTS.timeouts.downloadPhase / MS
    );
    expect(screen.getByLabelText(enSettings.timeouts.importPhase.ariaLabel)).toHaveValue(
      ENGINE_DEFAULTS.timeouts.importPhase / MS
    );
  });

  it("saves the reset defaults as milliseconds for the two reset phases", async () => {
    const dirty: TimeoutsCardProps["initial"] = { ...initial, downloadPhase: 999000, importPhase: 999000 };
    render(<TimeoutsCard initial={dirty} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.resetDefaults.label }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({
        ...dirty,
        downloadPhase: ENGINE_DEFAULTS.timeouts.downloadPhase,
        importPhase: ENGINE_DEFAULTS.timeouts.importPhase,
      });
    });
  });
});
