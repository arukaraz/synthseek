import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { NotificationMatrix } from "../components/NotificationMatrix";
import type { NotificationCategory, NotificationChannel, NotificationKind } from "../types";

const onKindsChange = vi.fn();
const copy = enSettings.notifications;

const categories: NotificationCategory[] = [
  { id: "downloads", kinds: ["track_completed", "album_completed", "album_failed"] },
  { id: "maintenance", kinds: ["review_new", "quarantine_new", "job_failed"] },
];

const COLUMNS: NotificationChannel[] = ["discord", "ntfy"];

function renderMatrix(
  selections: Partial<Record<NotificationChannel, NotificationKind[]>>,
  columns: NotificationChannel[] = COLUMNS
) {
  return render(
    <NotificationMatrix
      categories={categories}
      columns={columns}
      kindsOf={(channel) => selections[channel] ?? []}
      onKindsChange={onKindsChange}
    />
  );
}

const categoryButton = (id: "downloads" | "maintenance") =>
  screen.getByRole("button", { name: new RegExp(`^${copy.categories[id]}`) });

const categoryBox = (id: "downloads" | "maintenance", channel: NotificationChannel) =>
  screen.getByRole("checkbox", {
    name: i18n.t("settings:notifications.matrix.categoryTo", {
      category: copy.categories[id],
      channel: copy.channels[channel],
    }),
  });

const kindName = (kind: "track_completed" | "album_completed" | "album_failed", channel: NotificationChannel) =>
  i18n.t("settings:notifications.matrix.kindTo", { kind: copy.kinds[kind], channel: copy.channels[channel] });

const countOf = (selected: number, total: number) => i18n.t("settings:notifications.matrix.count", { selected, total });

function cellOf(box: HTMLElement): HTMLElement {
  const cell = box.closest("td");
  if (cell === null) throw new Error("checkbox outside a cell");
  return cell;
}

async function choose(channel: NotificationChannel, item: string) {
  const user = userEvent.setup();
  await user.click(
    screen.getByRole("button", {
      name: i18n.t("settings:notifications.matrix.presetsFor", { channel: copy.channels[channel] }),
    })
  );
  await user.click(screen.getByRole("menuitem", { name: item }));
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("NotificationMatrix", () => {
  it("draws a column for each destination and a closed row for each category", () => {
    renderMatrix({});

    expect(screen.getByRole("columnheader", { name: new RegExp(copy.channels.discord) })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: new RegExp(copy.channels.ntfy) })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: new RegExp(copy.channels.telegram) })).toBeNull();
    expect(categoryButton("downloads")).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("checkbox", { name: kindName("track_completed", "discord") })).toBeNull();
  });

  it("opens a category to show its kinds in every column, and closes it again", async () => {
    renderMatrix({});

    await userEvent.click(categoryButton("downloads"));

    expect(categoryButton("downloads")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("checkbox", { name: kindName("album_failed", "discord") })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: kindName("album_failed", "ntfy") })).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", {
        name: i18n.t("settings:notifications.matrix.kindTo", {
          kind: copy.kinds.review_new,
          channel: copy.channels.discord,
        }),
      })
    ).toBeNull();

    await userEvent.click(categoryButton("downloads"));

    expect(screen.queryByRole("checkbox", { name: kindName("album_failed", "discord") })).toBeNull();
  });

  it("marks each category per column as empty, partial or full, with its selected count", () => {
    renderMatrix({ discord: ["album_failed"], ntfy: ["review_new", "quarantine_new", "job_failed"] });

    const partial = categoryBox("downloads", "discord");
    expect(partial).toHaveAttribute("data-state", "indeterminate");
    expect(within(cellOf(partial)).getByText(countOf(1, 3))).toBeInTheDocument();

    const empty = categoryBox("downloads", "ntfy");
    expect(empty).not.toBeChecked();
    expect(within(cellOf(empty)).getByText(countOf(0, 3))).toBeInTheDocument();

    const full = categoryBox("maintenance", "ntfy");
    expect(full).toBeChecked();
    expect(within(cellOf(full)).getByText(countOf(3, 3))).toBeInTheDocument();
  });

  it("completes a partly chosen category for that column only, keeping the other kinds", async () => {
    renderMatrix({ discord: ["album_failed", "review_new"], ntfy: [] });

    await userEvent.click(categoryBox("downloads", "discord"));

    expect(onKindsChange).toHaveBeenCalledTimes(1);
    expect(onKindsChange).toHaveBeenCalledWith("discord", [
      "review_new",
      "track_completed",
      "album_completed",
      "album_failed",
    ]);
  });

  it("clears a fully chosen category and keeps the kinds of the other categories", async () => {
    renderMatrix({ discord: [], ntfy: ["track_completed", "album_completed", "album_failed", "job_failed"] });

    await userEvent.click(categoryBox("downloads", "ntfy"));

    expect(onKindsChange).toHaveBeenCalledWith("ntfy", ["job_failed"]);
  });

  it("ticks and unticks a single kind in its own column", async () => {
    renderMatrix({ discord: ["album_failed", "review_new"], ntfy: ["review_new"] });
    await userEvent.click(categoryButton("downloads"));

    await userEvent.click(screen.getByRole("checkbox", { name: kindName("album_completed", "ntfy") }));
    expect(onKindsChange).toHaveBeenLastCalledWith("ntfy", ["review_new", "album_completed"]);

    const failed = screen.getByRole("checkbox", { name: kindName("album_failed", "discord") });
    expect(failed).toBeChecked();
    await userEvent.click(failed);
    expect(onKindsChange).toHaveBeenLastCalledWith("discord", ["review_new"]);
  });

  it("counts every chosen kind of a column on its preset menu", () => {
    renderMatrix({ discord: ["album_failed", "review_new", "job_failed"], ntfy: [] });

    expect(
      screen.getByRole("button", {
        name: i18n.t("settings:notifications.matrix.presetsFor", { channel: copy.channels.discord }),
      })
    ).toHaveTextContent(i18n.t("settings:notifications.matrix.selected", { count: 3 }));
  });

  it("applies a preset to the column it was picked for, limited to the kinds the catalog offers", async () => {
    renderMatrix({ discord: ["review_new"], ntfy: [] });

    await choose("discord", copy.matrix.presets.failures);
    expect(onKindsChange).toHaveBeenLastCalledWith("discord", ["album_failed", "job_failed"]);

    await choose("ntfy", copy.matrix.presets.finished);
    expect(onKindsChange).toHaveBeenLastCalledWith("ntfy", ["album_completed"]);

    await choose("ntfy", copy.matrix.presets.everything);
    expect(onKindsChange).toHaveBeenLastCalledWith("ntfy", [
      "track_completed",
      "album_completed",
      "album_failed",
      "review_new",
      "quarantine_new",
      "job_failed",
    ]);

    await choose("discord", copy.matrix.presets.nothing);
    expect(onKindsChange).toHaveBeenLastCalledWith("discord", []);
  });

  it("copies another column's kinds with Same as, and never offers a column itself", async () => {
    renderMatrix({ discord: ["review_new"], ntfy: ["album_failed", "quarantine_new"] });

    await choose("discord", i18n.t("settings:notifications.matrix.sameAs", { channel: copy.channels.ntfy }));

    expect(onKindsChange).toHaveBeenCalledWith("discord", ["album_failed", "quarantine_new"]);

    await userEvent.setup().click(
      screen.getByRole("button", {
        name: i18n.t("settings:notifications.matrix.presetsFor", { channel: copy.channels.discord }),
      })
    );
    const sameAs = screen
      .getAllByRole("menuitem")
      .map((item) => item.textContent)
      .filter(
        (text) => text !== null && text.startsWith(i18n.t("settings:notifications.matrix.sameAs", { channel: "" }))
      );
    expect(sameAs).toEqual([i18n.t("settings:notifications.matrix.sameAs", { channel: copy.channels.ntfy })]);
  });

  it("offers no Same as entry when there is no other column to copy", async () => {
    renderMatrix({ discord: [] }, ["discord"]);

    await userEvent.setup().click(
      screen.getByRole("button", {
        name: i18n.t("settings:notifications.matrix.presetsFor", { channel: copy.channels.discord }),
      })
    );

    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      copy.matrix.presets.failures,
      copy.matrix.presets.finished,
      copy.matrix.presets.everything,
      copy.matrix.presets.nothing,
    ]);
  });
});
