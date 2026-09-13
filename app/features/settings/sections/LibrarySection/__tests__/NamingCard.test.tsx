import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery } from "@test/mocks/trpc.mock";

const DEFAULT_TEMPLATE = "{albumartist}/{album}/<Disc {disc:02d}>/{track:02d} - {title}.{ext}";

const state = vi.hoisted(() => ({
  current: undefined as unknown,
  preview: undefined as unknown,
  samples: undefined as unknown,
  status: undefined as unknown,
}));

vi.mock("@hooks/api/queries/useLibraryNaming", () => ({
  useLibraryNamingCurrent: () => state.current,
  useLibraryNamingPreview: () => state.preview,
  useLibraryNamingSamples: () => state.samples,
  useLibraryNamingMoves: () => createMockQuery(undefined),
}));

vi.mock("@hooks/api/queries/useLibraryOrganise", () => ({
  useLibraryOrganiseStatus: () => state.status,
  useLibraryOrganisePreview: () => createMockQuery(undefined),
}));

vi.mock("@hooks/api/mutations/library/useLibraryOrganiseControls", () => ({
  useCancelLibraryOrganise: () => ({ mutate: vi.fn(), isPending: false }),
  useStartLibraryOrganise: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@hooks/api/mutations/library/useLibraryNaming", () => ({
  useSaveAndOrganise: () => ({ mutate: vi.fn(), isPending: false }),
  useSaveLibraryNaming: () => ({ mutate: vi.fn(), isPending: false }),
}));

import { NamingCard } from "../NamingCard";

function validPreview(overrides: Record<string, number> = {}) {
  return createMockQuery({
    outcome: "valid",
    inPlace: 81,
    moves: 7415,
    rejected: 0,
    rejectionsByReason: [],
    moveSample: [],
    ...overrides,
  });
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

beforeEach(() => {
  state.current = createMockQuery({ template: DEFAULT_TEMPLATE, defaultTemplate: DEFAULT_TEMPLATE, tokens: [] });
  state.preview = validPreview();
  state.samples = createMockQuery({
    samples: [{ id: "single_disc", path: "Daft Punk/Discovery/01 - One More Time.flac" }],
  });
  state.status = createMockQuery({ running: false, processed: 0, total: 0, startedAt: null, finishedAt: null });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("NamingCard", () => {
  it("shows the stored format", () => {
    render(<NamingCard />);

    expect(screen.getByLabelText(enSettings.libraryNaming.template.label)).toHaveValue(DEFAULT_TEMPLATE);
  });

  it("says so rather than offering an empty field to overwrite when the format cannot be read", () => {
    state.current = { ...createMockQuery(undefined), isError: true, isSuccess: false };

    render(<NamingCard />);

    expect(screen.getByText(enSettings.libraryNaming.loadFailed)).toBeInTheDocument();
    expect(screen.queryByLabelText(enSettings.libraryNaming.template.label)).not.toBeInTheDocument();
  });

  it("offers no way to save, so nothing is stored without the reader seeing the changes first", () => {
    render(<NamingCard />);

    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).not.toBeInTheDocument();
  });

  it("keeps the pieces and the examples behind the help button, so the card stays one line of setup", () => {
    render(<NamingCard />);

    expect(screen.queryByText("Daft Punk/Discovery/01 - One More Time.flac")).not.toBeInTheDocument();
    expect(screen.queryByText(enSettings.libraryNaming.samples.single_disc)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: enSettings.libraryNaming.tokensModal.open })).toBeInTheDocument();
  });

  it("leaves the counts to the preview, where the reader is deciding", () => {
    render(<NamingCard />);

    expect(screen.queryByText(enSettings.libraryNaming.stats.toMove)).not.toBeInTheDocument();
    expect(screen.queryByText(enSettings.libraryNaming.stats.inPlace)).not.toBeInTheDocument();
  });

  it("no longer breaks down why a file stays put, which nobody could act on", () => {
    state.preview = validPreview({ rejected: 114 });

    render(<NamingCard />);

    expect(screen.queryByText(/missing something this format needs/)).not.toBeInTheDocument();
  });

  it("refuses to open the preview while the format is not usable", () => {
    state.preview = createMockQuery({ outcome: "invalid", problem: "MISSING_EXTENSION", detail: "" });

    render(<NamingCard />);

    expect(screen.getByText(enSettings.libraryNaming.problem.MISSING_EXTENSION)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /See the/ })).toBeDisabled();
  });

  it("refuses to open the preview when nothing would move", () => {
    state.preview = validPreview({ moves: 0 });

    render(<NamingCard />);

    expect(screen.getByRole("button", { name: /See the/ })).toBeDisabled();
  });

  it("offers the preview when there is something to see", () => {
    render(<NamingCard />);

    expect(screen.getByRole("button", { name: /See the 7,415 changes/ })).toBeEnabled();
  });

  it("shows a filled bar, the share done and a way to stop while the files are being moved", () => {
    state.status = createMockQuery({
      running: true,
      processed: 1204,
      total: 7415,
      cancelling: false,
      startedAt: null,
      finishedAt: null,
    });

    render(<NamingCard />);

    expect(screen.getByText("16%")).toBeInTheDocument();
    expect(screen.getByText(/1,204 of 7,415 moved/)).toBeInTheDocument();
    expect(screen.getByTestId("progress-bar")).toHaveAttribute("data-progress", "16");
    expect(screen.getByRole("button", { name: enSettings.libraryOrganise.actions.stop })).toBeInTheDocument();
  });

  it("says it is still working the estimate out rather than inventing one", () => {
    state.status = createMockQuery({
      running: true,
      processed: 2,
      total: 7415,
      cancelling: false,
      startedAt: new Date().toISOString(),
      finishedAt: null,
    });

    render(<NamingCard />);

    expect(screen.getByText(enSettings.libraryOrganise.estimating)).toBeInTheDocument();
  });

  it("says the button is doing something once stopping has been asked for", () => {
    state.status = createMockQuery({
      running: true,
      processed: 100,
      total: 7415,
      cancelling: true,
      startedAt: null,
      finishedAt: null,
    });

    render(<NamingCard />);

    expect(screen.getByRole("button", { name: enSettings.libraryOrganise.actions.stopping })).toBeDisabled();
  });

  it("locks the format while a move is under way, so the plan cannot change underneath it", () => {
    state.status = createMockQuery({
      running: true,
      processed: 10,
      total: 20,
      cancelling: false,
      startedAt: null,
      finishedAt: null,
    });

    render(<NamingCard />);

    expect(screen.getByLabelText(enSettings.libraryNaming.template.label)).toBeDisabled();
  });
});
