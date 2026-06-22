import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";

import { ENGINE_DEFAULTS } from "../defaults";
import type { SmartSearchCardProps } from "../types";

const update = createMockMutation();

vi.mock("@hooks/api/mutations/settings/useUpdateEngine", () => ({
  useUpdateEngineSmartSearch: () => update,
}));

import { SmartSearchCard } from "../SmartSearchCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const initial: SmartSearchCardProps["initial"] = {
  customMoodKeywords: ["party"],
  federatedPatternsEnabled: false,
};

describe("SmartSearchCard", () => {
  it("renders the smart search header and the existing keyword chips", () => {
    render(<SmartSearchCard initial={initial} />);
    expect(screen.getByText(enSettings.search.smartSearchHeader)).toBeInTheDocument();
    expect(screen.getByText("party")).toBeInTheDocument();
  });

  it("shows the placeholder when there are no keywords yet", () => {
    render(<SmartSearchCard initial={{ customMoodKeywords: [], federatedPatternsEnabled: false }} />);
    expect(screen.getByPlaceholderText(enSettings.search.customMoodKeywords.placeholder)).toBeInTheDocument();
  });

  it("adds a keyword and saves the updated list", async () => {
    render(<SmartSearchCard initial={initial} />);

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "chill{Enter}");
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({
        customMoodKeywords: ["party", "chill"],
        federatedPatternsEnabled: false,
      });
    });
  });

  it("removes a keyword chip", async () => {
    render(<SmartSearchCard initial={initial} />);

    await userEvent.click(
      screen.getByRole("button", {
        name: enSettings.shell.chipsInput.removeLabel.replace("{{chip}}", "party"),
      })
    );

    expect(screen.queryByText("party")).not.toBeInTheDocument();
  });

  it("resets the keywords to the empty engine default", async () => {
    render(<SmartSearchCard initial={initial} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.resetDefaults.label }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({ ...ENGINE_DEFAULTS.smartSearch });
    });
  });
});
