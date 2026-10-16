import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import { MatrixPresetMenu } from "../components/MatrixPresetMenu";
import type { NotificationChannel, NotificationKind } from "../types";

const t = i18n.getFixedT("en", "settings");

const AVAILABLE: NotificationKind[] = ["album_completed", "track_failed", "import_finished", "job_failed"];

const NTFY_KINDS: NotificationKind[] = ["track_failed", "album_completed"];

function setup() {
  const onApply = vi.fn();
  const kindsOf = vi.fn((channel: NotificationChannel): NotificationKind[] => (channel === "ntfy" ? NTFY_KINDS : []));
  render(
    <MatrixPresetMenu
      channel="discord"
      selectedCount={3}
      others={["ntfy", "telegram"]}
      available={AVAILABLE}
      kindsOf={kindsOf}
      onApply={onApply}
    />
  );
  return { onApply, kindsOf };
}

async function choose(name: string) {
  await userEvent.click(
    screen.getByRole("button", {
      name: t("notifications.matrix.presetsFor", { channel: t("notifications.channels.discord") }),
    })
  );
  await userEvent.click(await screen.findByRole("menuitem", { name }));
}

describe("MatrixPresetMenu", () => {
  it("names the column it acts on and how much it has selected", () => {
    setup();
    const trigger = screen.getByRole("button", {
      name: t("notifications.matrix.presetsFor", { channel: t("notifications.channels.discord") }),
    });
    expect(trigger).toHaveTextContent(t("notifications.matrix.selected", { count: 3 }));
  });

  it("lists the presets, a copy of each other column, and nothing", async () => {
    setup();
    await userEvent.click(screen.getByRole("button"));
    const items = (await screen.findAllByRole("menuitem")).map((item) => item.textContent);
    expect(items).toEqual([
      t("notifications.matrix.presets.failures"),
      t("notifications.matrix.presets.finished"),
      t("notifications.matrix.presets.everything"),
      t("notifications.matrix.sameAs", { channel: t("notifications.channels.ntfy") }),
      t("notifications.matrix.sameAs", { channel: t("notifications.channels.telegram") }),
      t("notifications.matrix.presets.nothing"),
    ]);
  });

  it("applies only the failures among the available kinds", async () => {
    const { onApply } = setup();
    await choose(t("notifications.matrix.presets.failures"));
    expect(onApply).toHaveBeenCalledWith(["track_failed", "job_failed"]);
  });

  it("applies only the finished downloads among the available kinds", async () => {
    const { onApply } = setup();
    await choose(t("notifications.matrix.presets.finished"));
    expect(onApply).toHaveBeenCalledWith(["album_completed", "import_finished"]);
  });

  it("applies every available kind", async () => {
    const { onApply } = setup();
    await choose(t("notifications.matrix.presets.everything"));
    expect(onApply).toHaveBeenCalledWith(AVAILABLE);
    expect(onApply.mock.calls[0][0]).not.toBe(AVAILABLE);
  });

  it("copies the kinds of another column", async () => {
    const { onApply, kindsOf } = setup();
    await choose(t("notifications.matrix.sameAs", { channel: t("notifications.channels.ntfy") }));
    expect(kindsOf).toHaveBeenCalledWith("ntfy");
    expect(onApply).toHaveBeenCalledWith(NTFY_KINDS);
    expect(onApply.mock.calls[0][0]).not.toBe(NTFY_KINDS);
  });

  it("clears the column", async () => {
    const { onApply } = setup();
    await choose(t("notifications.matrix.presets.nothing"));
    expect(onApply).toHaveBeenCalledWith([]);
  });
});
