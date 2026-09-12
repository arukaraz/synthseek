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

  it("shows a worked example rendered by the server rather than one of the reader's own files", () => {
    render(<NamingCard />);

    expect(screen.getByText("Daft Punk/Discovery/01 - One More Time.flac")).toBeInTheDocument();
    expect(screen.getByText(enSettings.libraryNaming.samples.single_disc)).toBeInTheDocument();
  });

  it("says how many songs would move, in words rather than a column heading", () => {
    render(<NamingCard />);

    expect(screen.getByText("7,415")).toBeInTheDocument();
    expect(screen.getByText(enSettings.libraryNaming.stats.toMove)).toBeInTheDocument();
  });

  it("does not count files it cannot name unless there are some", () => {
    render(<NamingCard />);

    expect(screen.queryByText(enSettings.libraryNaming.stats.rejected)).not.toBeInTheDocument();
  });

  it("explains in plain words why some songs stay put", () => {
    state.preview = validPreview({ rejected: 114 });

    render(<NamingCard />);

    expect(screen.getByText(enSettings.libraryNaming.stats.rejected)).toBeInTheDocument();
    expect(screen.getByText(/114 songs are missing something/)).toBeInTheDocument();
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

  it("shows progress and a way to stop while the files are being moved", () => {
    state.status = createMockQuery({
      running: true,
      processed: 1204,
      total: 7415,
      cancelling: false,
      startedAt: null,
      finishedAt: null,
    });

    render(<NamingCard />);

    expect(screen.getByText(/1204 of 7415/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: enSettings.libraryOrganise.actions.stop })).toBeInTheDocument();
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
