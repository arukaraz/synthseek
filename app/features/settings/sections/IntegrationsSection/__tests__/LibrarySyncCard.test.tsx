import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import enSettings from "@modules/i18n/messages/en/settings.json";

const state = vi.hoisted(() => ({ mutateAsync: vi.fn() }));

vi.mock("@hooks/api/mutations/settings/useUpdateLibrarySync", () => ({
  useUpdateLibrarySync: () => ({ mutateAsync: state.mutateAsync, isPending: false }),
}));

import { LibrarySyncCard } from "../LibrarySyncCard";

const copy = enSettings.library.sync;
const saveBar = enSettings.shell.saveBar;

function interval() {
  return screen.getByRole("spinbutton", { name: copy.interval.label });
}

beforeEach(() => {
  state.mutateAsync.mockReset();
  state.mutateAsync.mockResolvedValue(undefined);
});

describe("LibrarySyncCard", () => {
  it("shows the current interval with no save bar while unchanged", () => {
    render(<LibrarySyncCard initial={{ syncIntervalMinutes: 60 }} />);
    expect(screen.getByRole("heading", { name: copy.title })).toBeInTheDocument();
    expect(interval()).toHaveValue(60);
    expect(screen.getByText(copy.interval.suffix)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: saveBar.save })).not.toBeInTheDocument();
  });

  it("saves the edited interval through the library sync mutation", async () => {
    render(<LibrarySyncCard initial={{ syncIntervalMinutes: 60 }} />);
    fireEvent.change(interval(), { target: { value: "120" } });
    await userEvent.click(screen.getByRole("button", { name: saveBar.save }));
    await waitFor(() => expect(state.mutateAsync).toHaveBeenCalledWith({ syncIntervalMinutes: 120 }));
    expect(state.mutateAsync).toHaveBeenCalledOnce();
  });

  it("puts the interval back on cancel", async () => {
    render(<LibrarySyncCard initial={{ syncIntervalMinutes: 60 }} />);
    fireEvent.change(interval(), { target: { value: "15" } });
    await userEvent.click(screen.getByRole("button", { name: saveBar.cancel }));
    expect(interval()).toHaveValue(60);
    expect(state.mutateAsync).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: saveBar.save })).not.toBeInTheDocument();
  });

  it("anchors the row so search can land on it", () => {
    const { container } = render(<LibrarySyncCard initial={{ syncIntervalMinutes: 60 }} />);
    expect(container.querySelector('[data-anchor-target="library.syncIntervalMinutes"]')).toContainElement(interval());
  });
});
