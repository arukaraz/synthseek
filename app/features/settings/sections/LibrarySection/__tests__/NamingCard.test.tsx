import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation, createMockQuery } from "@test/mocks/trpc.mock";

const DEFAULT_TEMPLATE = "{albumartist}/{album}/<Disc {disc:02d}>/{track:02d} - {title}.{ext}";

const save = createMockMutation();
const current = vi.hoisted(() => ({ result: undefined as unknown }));

vi.mock("@hooks/api/mutations/library/useLibraryNaming", () => ({
  useSaveLibraryNaming: () => save,
}));

vi.mock("@hooks/api/queries/useLibraryNaming", () => ({
  useLibraryNamingCurrent: () => current.result,
  useLibraryNamingPreview: () => ({ data: undefined, isFetching: false }),
}));

import { NamingCard } from "../NamingCard";

function currentQuery(overrides: Record<string, unknown> = {}) {
  return {
    ...createMockQuery({ template: DEFAULT_TEMPLATE, defaultTemplate: DEFAULT_TEMPLATE, tokens: [] }),
    ...overrides,
  };
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  save.mutate.mockReset();
});

async function editAndSave(next: string): Promise<void> {
  fireEvent.change(screen.getByLabelText(enSettings.libraryNaming.template.label), { target: { value: next } });
  const button = screen.getByRole("button", { name: enSettings.shell.saveBar.save });
  await waitFor(() => expect(button).toBeEnabled(), { timeout: 3000 });
  await userEvent.click(button);
  await waitFor(() => expect(save.mutate).toHaveBeenCalled());
}

describe("NamingCard", () => {
  it("shows the stored template", () => {
    current.result = currentQuery();

    render(<NamingCard />);

    expect(screen.getByLabelText(enSettings.libraryNaming.template.label)).toHaveValue(DEFAULT_TEMPLATE);
  });

  it("says so rather than offering an empty field to overwrite when the template cannot be read", () => {
    current.result = currentQuery({ data: undefined, isError: true, isSuccess: false });

    render(<NamingCard />);

    expect(screen.getByText(enSettings.libraryNaming.loadFailed)).toBeInTheDocument();
    expect(screen.queryByLabelText(enSettings.libraryNaming.template.label)).not.toBeInTheDocument();
  });

  it("keeps the edit when the save was refused because files are being moved", async () => {
    current.result = currentQuery();
    save.mutate.mockImplementation((_input, options) => options?.onSuccess?.({ outcome: "organise_busy" }));
    render(<NamingCard />);

    await editAndSave("{albumartist}/{title}.{ext}");

    expect(screen.getByLabelText(enSettings.libraryNaming.template.label)).toHaveValue("{albumartist}/{title}.{ext}");
    expect(screen.getByRole("button", { name: enSettings.shell.saveBar.save })).toBeInTheDocument();
  });

  it("lets go of the edit once it is stored", async () => {
    current.result = currentQuery();
    save.mutate.mockImplementation((_input, options) => options?.onSuccess?.({ outcome: "saved" }));
    render(<NamingCard />);

    await editAndSave("{albumartist}/{title}.{ext}");

    await waitFor(() => {
      expect(screen.getByLabelText(enSettings.libraryNaming.template.label)).toHaveValue(DEFAULT_TEMPLATE);
    });
  });
});
