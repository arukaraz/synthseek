import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";

import { ENGINE_DEFAULTS } from "../defaults";
import type { ImportCardProps } from "../types";

const update = createMockMutation();

vi.mock("@hooks/api/mutations/settings/useUpdateEngine", () => ({
  useUpdateEngineImport: () => update,
}));

import { ImportCard } from "../ImportCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const initial: ImportCardProps["initial"] = { metadataConfidenceThreshold: 50 };

describe("ImportCard", () => {
  it("renders the card title and the confidence control", () => {
    render(<ImportCard initial={initial} />);
    expect(screen.getByText(enSettings.import.title)).toBeInTheDocument();
    expect(screen.getByLabelText(enSettings.import.metadataConfidence.ariaLabel)).toHaveValue(50);
  });

  it("saves the edited confidence threshold", async () => {
    render(<ImportCard initial={initial} />);

    fireEvent.change(screen.getByLabelText(enSettings.import.metadataConfidence.ariaLabel), {
      target: { value: "75" },
    });
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({ metadataConfidenceThreshold: 75 });
    });
  });

  it("resets the threshold to the engine default", async () => {
    render(<ImportCard initial={{ metadataConfidenceThreshold: 90 }} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.resetDefaults.label }));

    expect(screen.getByLabelText(enSettings.import.metadataConfidence.ariaLabel)).toHaveValue(
      ENGINE_DEFAULTS.import.metadataConfidenceThreshold
    );
  });
});
