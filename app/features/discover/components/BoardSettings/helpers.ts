import i18n from "@locale";

import { BOARD_DENSITY_METRICS, BOARD_TEXT_SCALE } from "@components/BoardGrid";
import type { BoardDensity, BoardTemplate, BoardTextScale } from "@hooks/api/queries/board/types";

import { problemText } from "../WidgetGallery/helpers";
import type { ReadableTemplate, ReportLine } from "./types";

function isDensity(key: string): key is BoardDensity {
  return Object.hasOwn(BOARD_DENSITY_METRICS, key);
}

function isTextScale(key: string): key is BoardTextScale {
  return Object.hasOwn(BOARD_TEXT_SCALE, key);
}

export function densityChoices(): BoardDensity[] {
  return Object.keys(BOARD_DENSITY_METRICS).filter(isDensity);
}

export function textScaleChoices(): BoardTextScale[] {
  return Object.keys(BOARD_TEXT_SCALE).filter(isTextScale);
}

export function templateReportLines(report: ReadableTemplate): ReportLine[] {
  const lines: ReportLine[] = [
    {
      key: "summary",
      tone: "info",
      text: i18n.t("widgets:board.templates.summary", { name: report.name, count: report.tiles }),
    },
  ];
  if (report.widgets > 0) {
    lines.push({
      key: "created",
      tone: "info",
      text: i18n.t("widgets:board.templates.created", { count: report.widgets }),
    });
  }
  lines.push({
    key: "look",
    tone: "info",
    text: i18n.t("widgets:board.templates.look", {
      density: i18n.t(`widgets:board.appearance.densities.${report.appearance.density}`),
      text: i18n.t(`widgets:board.appearance.texts.${report.appearance.text}`),
    }),
  });
  for (const skipped of report.skippedItems) {
    lines.push({
      key: `skipped-${skipped.index}`,
      tone: "warning",
      text: i18n.t("widgets:board.templates.skipped", {
        position: skipped.index + 1,
        reason: i18n.t(`widgets:board.templates.reasons.${skipped.reason}`),
      }),
    });
  }
  for (const rejected of report.rejectedWidgets) {
    lines.push({
      key: `rejected-${rejected.index}`,
      tone: "warning",
      text: i18n.t("widgets:board.templates.rejected", {
        name: rejected.name ?? i18n.t("widgets:board.templates.unnamed", { position: rejected.index + 1 }),
        problems: rejected.problems.map((entry) => problemText(entry.problem)).join(" "),
      }),
    });
  }
  for (const need of report.needs) {
    lines.push({ key: `needs-${need}`, tone: "warning", text: i18n.t(`discover:customWidget.needs.${need}`) });
  }
  lines.push(
    report.blocked
      ? {
          key: "blocked",
          tone: "danger",
          text: i18n.t(`widgets:board.templates.blocked.${report.blocked.reason}`, { max: report.blocked.max }),
        }
      : { key: "replaces", tone: "info", text: i18n.t("widgets:board.templates.replaces") }
  );
  return lines;
}

export function templateJsonOf(template: BoardTemplate): string {
  return JSON.stringify(template, null, 2);
}
