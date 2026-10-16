import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import { ChainItem } from "../ChainItem";
import { ChainPanel } from "../ChainPanel";
import { OrderedChain } from "../OrderedChain";
import type { ChainEntry } from "../types";

type Key = "local" | "plex" | "navidrome" | "jellyfin";

const t = i18n.getFixedT("en", "settings");

const local: ChainEntry<Key> = { key: "local", title: "Local", status: null };
const plex: ChainEntry<Key> = { key: "plex", title: "Plex", status: { tone: "success", label: "Connected" } };
const navidrome: ChainEntry<Key> = { key: "navidrome", title: "Navidrome", status: { tone: "muted", label: "Off" } };
const jellyfin: ChainEntry<Key> = { key: "jellyfin", title: "Jellyfin", status: null };

function renderChain(overrides: { fixed?: readonly ChainEntry<Key>[]; selected?: string } = {}) {
  const onSelect = vi.fn();
  const onReorder = vi.fn();
  render(
    <OrderedChain<Key>
      label="Playback order"
      labelTrailing={<span>trailing</span>}
      fixed={overrides.fixed ?? [local]}
      entries={[plex, navidrome, jellyfin]}
      selected={overrides.selected ?? "plex"}
      onSelect={onSelect}
      onReorder={onReorder}
      hint="Drag to reorder"
    />
  );
  return { onSelect, onReorder };
}

function moveUp(name: string) {
  return screen.getByRole("button", { name: t("shell.chain.moveUp", { name }) });
}

function moveDown(name: string) {
  return screen.getByRole("button", { name: t("shell.chain.moveDown", { name }) });
}

function openButton(name: string) {
  return screen.getByRole("button", { name: t("shell.chain.open", { name }) });
}

describe("OrderedChain", () => {
  it("renders the label, its trailing content and the hint", () => {
    renderChain();
    expect(screen.getByText("Playback order")).toBeInTheDocument();
    expect(screen.getByText("trailing")).toBeInTheDocument();
    expect(screen.getByText("Drag to reorder")).toBeInTheDocument();
  });

  it("lists the fixed entries first in their own list, without reorder controls", () => {
    renderChain();
    const lists = screen.getAllByRole("list");
    expect(lists).toHaveLength(2);
    expect(within(lists[0]).getByText("Local")).toBeInTheDocument();
    expect(within(lists[1]).queryByText("Local")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: t("shell.chain.moveUp", { name: "Local" }) })).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: t("shell.chain.drag", { name: "Local" }) })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: t("shell.chain.drag", { name: "Plex" }) })).toBeInTheDocument();
  });

  it("numbers the reorderable entries after the fixed ones", () => {
    renderChain();
    const [fixedList, orderList] = screen.getAllByRole("list");
    expect(within(fixedList).getByText("1")).toBeInTheDocument();
    const items = within(orderList).getAllByRole("listitem");
    expect(items.map((item) => within(item).getByText(/^\d+$/).textContent)).toEqual(["2", "3", "4"]);
  });

  it("starts numbering at one without fixed entries", () => {
    renderChain({ fixed: [] });
    const lists = screen.getAllByRole("list");
    expect(lists).toHaveLength(1);
    const items = within(lists[0]).getAllByRole("listitem");
    expect(items.map((item) => within(item).getByText(/^\d+$/).textContent)).toEqual(["1", "2", "3"]);
  });

  it("shows a custom mark instead of the number", () => {
    const onSelect = vi.fn();
    render(
      <OrderedChain<Key>
        label="Order"
        fixed={[{ ...local, mark: <span>local mark</span> }]}
        entries={[{ ...plex, mark: <span>plex mark</span> }, navidrome]}
        selected="plex"
        onSelect={onSelect}
        onReorder={vi.fn()}
        hint="hint"
      />
    );
    expect(screen.getByText("local mark")).toBeInTheDocument();
    expect(screen.getByText("plex mark")).toBeInTheDocument();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("disables moving the first entry up and the last entry down", () => {
    renderChain();
    expect(moveUp("Plex")).toBeDisabled();
    expect(moveDown("Plex")).toBeEnabled();
    expect(moveUp("Navidrome")).toBeEnabled();
    expect(moveDown("Navidrome")).toBeEnabled();
    expect(moveUp("Jellyfin")).toBeEnabled();
    expect(moveDown("Jellyfin")).toBeDisabled();
  });

  it("reorders down with the arrow", async () => {
    const { onReorder } = renderChain();
    await userEvent.click(moveDown("Plex"));
    expect(onReorder).toHaveBeenCalledWith(["navidrome", "plex", "jellyfin"]);
  });

  it("reorders up with the arrow", async () => {
    const { onReorder } = renderChain();
    await userEvent.click(moveUp("Jellyfin"));
    expect(onReorder).toHaveBeenCalledWith(["plex", "jellyfin", "navidrome"]);
  });

  it("selects a fixed or a reorderable entry", async () => {
    const { onSelect } = renderChain();
    await userEvent.click(openButton("Local"));
    await userEvent.click(openButton("Navidrome"));
    expect(onSelect.mock.calls).toEqual([["local"], ["navidrome"]]);
  });

  it("marks only the selected entry as pressed", () => {
    renderChain({ selected: "navidrome" });
    expect(openButton("Navidrome")).toHaveAttribute("aria-pressed", "true");
    expect(openButton("Plex")).toHaveAttribute("aria-pressed", "false");
    expect(openButton("Local")).toHaveAttribute("aria-pressed", "false");
  });

  it("renders the status line of entries that have one", () => {
    renderChain();
    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(screen.getByText("Off")).toBeInTheDocument();
    const jellyfinItem = openButton("Jellyfin").closest("li");
    expect(jellyfinItem).not.toBeNull();
    if (jellyfinItem) expect(jellyfinItem).toHaveTextContent(/^4Jellyfin$/);
  });
});

describe("ChainItem", () => {
  it("renders a plain list item with no reorder controls when it is not reorderable", async () => {
    const onSelect = vi.fn();
    render(
      <ul>
        <ChainItem<Key> entry={plex} badge={<span>badge</span>} selected reorderable={false} onSelect={onSelect} />
      </ul>
    );
    expect(screen.getByRole("listitem")).toHaveTextContent("badgePlexConnected");
    expect(screen.queryByRole("button", { name: t("shell.chain.moveUp", { name: "Plex" }) })).not.toBeInTheDocument();
    await userEvent.click(openButton("Plex"));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});

describe("ChainPanel", () => {
  it("wraps its content in a labelled region", () => {
    render(
      <ChainPanel label="Plex settings">
        <p>panel body</p>
      </ChainPanel>
    );
    expect(within(screen.getByRole("region", { name: "Plex settings" })).getByText("panel body")).toBeInTheDocument();
  });
});
