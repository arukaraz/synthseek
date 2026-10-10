import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { KindChecklist } from "../components/KindChecklist";
import type { NotificationKind } from "../types";
import { makeCatalog } from "./fixtures";

const onChange = vi.fn();
const categories = makeCatalog().categories;
const copy = enSettings.notifications;

function renderChecklist(selected: NotificationKind[], disabled = false) {
  return render(<KindChecklist categories={categories} selected={selected} disabled={disabled} onChange={onChange} />);
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("KindChecklist", () => {
  it("lists each category the catalog offers with its kinds", () => {
    renderChecklist([]);

    expect(screen.getByRole("group", { name: copy.categories.downloads })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: copy.categories.maintenance })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: copy.categories.system })).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: copy.kinds.quarantine_new })).not.toBeChecked();
  });

  it("adds a kind when it is ticked", async () => {
    renderChecklist(["review_new"]);

    await userEvent.click(screen.getByRole("checkbox", { name: copy.kinds.album_failed }));

    expect(onChange).toHaveBeenCalledWith(["review_new", "album_failed"]);
  });

  it("removes a kind when it is unticked", async () => {
    renderChecklist(["review_new", "album_failed"]);

    await userEvent.click(screen.getByRole("checkbox", { name: copy.kinds.album_failed }));

    expect(onChange).toHaveBeenCalledWith(["review_new"]);
  });

  it("completes a partly chosen category from its own checkbox", async () => {
    renderChecklist(["album_failed"]);
    const category = screen.getByRole("checkbox", { name: `All of ${copy.categories.downloads}` });

    expect(category).toHaveAttribute("data-state", "indeterminate");
    await userEvent.click(category);

    expect(onChange).toHaveBeenCalledWith(["track_completed", "album_failed"]);
  });

  it("clears a fully chosen category from its own checkbox", async () => {
    renderChecklist(["track_completed", "album_failed", "review_new"]);

    await userEvent.click(screen.getByRole("checkbox", { name: `All of ${copy.categories.downloads}` }));

    expect(onChange).toHaveBeenCalledWith(["review_new"]);
  });

  it("locks every box while a save is in flight", () => {
    renderChecklist([], true);

    for (const box of screen.getAllByRole("checkbox")) expect(box).toBeDisabled();
  });
});
