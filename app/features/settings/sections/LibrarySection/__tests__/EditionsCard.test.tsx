import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enSettings from "@modules/i18n/messages/en/settings.json";

interface Editions {
  content: "explicit" | "clean";
  length: "shortest" | "longest";
}

const api = vi.hoisted(() => {
  const state: { editions: Editions | undefined; pending: boolean } = {
    editions: { content: "explicit", length: "shortest" },
    pending: false,
  };
  return { state, mutate: vi.fn() };
});

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => ({
    data: api.state.editions === undefined ? undefined : { library: { editions: api.state.editions } },
  }),
}));

vi.mock("@hooks/api/mutations/settings/useUpdateLibraryEditions", () => ({
  useUpdateLibraryEditions: () => ({ mutate: api.mutate, isPending: api.state.pending }),
}));

import { EditionsCard } from "../EditionsCard";

const copy = enSettings.editions;

function group(name: string) {
  return within(screen.getByRole("radiogroup", { name }));
}

describe("EditionsCard", () => {
  beforeEach(() => {
    api.state.editions = { content: "explicit", length: "shortest" };
    api.state.pending = false;
    vi.clearAllMocks();
  });

  it("shows the edition the server prefers on each of its two choices", () => {
    api.state.editions = { content: "clean", length: "longest" };

    render(<EditionsCard />);

    expect(screen.getByRole("heading", { name: copy.title })).toBeInTheDocument();
    expect(group(copy.content.label).getByRole("radio", { name: copy.content.options.clean })).toBeChecked();
    expect(group(copy.content.label).getByRole("radio", { name: copy.content.options.explicit })).not.toBeChecked();
    expect(group(copy.length.label).getByRole("radio", { name: copy.length.options.longest })).toBeChecked();
  });

  it("saves a new content choice together with the length it leaves alone", async () => {
    api.state.editions = { content: "explicit", length: "longest" };
    render(<EditionsCard />);

    await userEvent.click(screen.getByRole("radio", { name: copy.content.options.clean }));

    expect(api.mutate).toHaveBeenCalledTimes(1);
    expect(api.mutate).toHaveBeenCalledWith({ content: "clean", length: "longest" });
  });

  it("saves a new length choice together with the content it leaves alone", async () => {
    api.state.editions = { content: "clean", length: "shortest" };
    render(<EditionsCard />);

    await userEvent.click(screen.getByRole("radio", { name: copy.length.options.longest }));

    expect(api.mutate).toHaveBeenCalledWith({ content: "clean", length: "longest" });
  });

  it("locks both controls while a save is in flight", () => {
    api.state.pending = true;

    render(<EditionsCard />);

    expect(screen.getByRole("radio", { name: copy.content.options.clean })).toBeDisabled();
    expect(screen.getByRole("radio", { name: copy.length.options.longest })).toBeDisabled();
  });

  it("is the card the settings search opens", () => {
    const { container } = render(<EditionsCard />);

    expect(container.querySelector('[data-anchor-target="library-editions"]')).not.toBeNull();
  });

  it("renders nothing until the settings have loaded", () => {
    api.state.editions = undefined;

    const { container } = render(<EditionsCard />);

    expect(container).toBeEmptyDOMElement();
  });
});
