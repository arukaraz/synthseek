import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enSettings from "@modules/i18n/messages/en/settings.json";

const api = vi.hoisted(() => {
  const state: { resolve: "ask" | "automatic" | undefined; pending: boolean } = { resolve: "ask", pending: false };
  return { state, mutate: vi.fn() };
});

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => ({
    data: api.state.resolve === undefined ? undefined : { library: { duplicates: { resolve: api.state.resolve } } },
  }),
}));

vi.mock("@hooks/api/mutations/settings/useUpdateDuplicateResolution", () => ({
  useUpdateDuplicateResolution: () => ({ mutate: api.mutate, isPending: api.state.pending }),
}));

import { DuplicateResolutionRow } from "../DuplicateResolutionRow";

const copy = enSettings.libraryScan.duplicates.resolve;

describe("DuplicateResolutionRow", () => {
  beforeEach(() => {
    api.state.resolve = "ask";
    api.state.pending = false;
    vi.clearAllMocks();
  });

  it("shows the mode the server is in and says what that mode does", () => {
    render(<DuplicateResolutionRow />);

    expect(screen.getByRole("radio", { name: copy.options.ask })).toBeChecked();
    expect(screen.getByText(copy.descriptions.ask)).toBeInTheDocument();
    expect(screen.queryByText(copy.descriptions.automatic)).not.toBeInTheDocument();
  });

  it("describes the automatic mode when the server is in it", () => {
    api.state.resolve = "automatic";

    render(<DuplicateResolutionRow />);

    expect(screen.getByRole("radio", { name: copy.options.automatic })).toBeChecked();
    expect(screen.getByText(copy.descriptions.automatic)).toBeInTheDocument();
  });

  it("saves the mode the administrator picks", async () => {
    render(<DuplicateResolutionRow />);

    await userEvent.click(screen.getByRole("radio", { name: copy.options.automatic }));

    expect(api.mutate).toHaveBeenCalledWith({ resolve: "automatic" });
  });

  it("locks the control while a save is in flight", () => {
    api.state.pending = true;

    render(<DuplicateResolutionRow />);

    expect(screen.getByRole("radio", { name: copy.options.automatic })).toBeDisabled();
  });

  it("renders nothing until the settings have loaded", () => {
    api.state.resolve = undefined;

    const { container } = render(<DuplicateResolutionRow />);

    expect(container).toBeEmptyDOMElement();
  });
});
