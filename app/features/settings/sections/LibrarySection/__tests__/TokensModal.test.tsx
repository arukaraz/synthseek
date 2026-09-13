import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery } from "@test/mocks/trpc.mock";

const state = vi.hoisted(() => ({ samples: undefined as unknown }));

vi.mock("@hooks/api/queries/useLibraryNaming", () => ({
  useLibraryNamingSamples: () => state.samples,
}));

import { TokensModal } from "../TokensModal";

const TOKENS = [
  { name: "albumartist" as const, example: "{albumartist}" },
  { name: "year" as const, example: "{year}" },
];

function renderModal(overrides: Record<string, unknown> = {}) {
  const onInsert = vi.fn();
  const onTemplateChange = vi.fn();
  render(
    <TokensModal
      open
      onOpenChange={vi.fn()}
      template="{albumartist}/{title}.{ext}"
      tokens={TOKENS}
      problem={null}
      onInsert={onInsert}
      onTemplateChange={onTemplateChange}
      {...overrides}
    />
  );
  return { onInsert, onTemplateChange };
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

beforeEach(() => {
  state.samples = createMockQuery({
    samples: [{ id: "single_disc", path: "Daft Punk/Discovery/01 - One More Time.flac" }],
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("the pieces picker", () => {
  it("offers every piece the server says exists, by the text the reader will type", () => {
    renderModal();

    expect(screen.getByRole("button", { name: /\{albumartist\}/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\{year\}/ })).toBeInTheDocument();
  });

  it("hands the piece back when one is clicked, rather than editing the format itself", async () => {
    const { onInsert } = renderModal();

    await userEvent.click(screen.getByRole("button", { name: /\{year\}/ }));

    expect(onInsert).toHaveBeenCalledWith("{year}");
  });

  it("shows the format being built, so the reader is not composing blind", () => {
    renderModal();

    expect(screen.getByLabelText(enSettings.libraryNaming.template.label)).toHaveValue("{albumartist}/{title}.{ext}");
  });

  it("says what is wrong with the format, since this is where it is being edited", () => {
    renderModal({ problem: "MISSING_EXTENSION" });

    expect(screen.getByText(enSettings.libraryNaming.problem.MISSING_EXTENSION)).toBeInTheDocument();
  });

  it("drops the worked examples while the format is unusable, rather than repeating the same refusal three times", () => {
    renderModal({ problem: "MISSING_EXTENSION" });

    expect(screen.queryByText(enSettings.libraryNaming.tokensModal.examples)).not.toBeInTheDocument();
    expect(screen.queryByText(enSettings.libraryNaming.samples.unrenderable)).not.toBeInTheDocument();
  });

  it("shows the examples again once the format is usable", () => {
    renderModal();

    expect(screen.getByText("Daft Punk/Discovery/01 - One More Time.flac")).toBeInTheDocument();
  });
});
