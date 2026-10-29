"use client";

import { useId } from "react";
import { useTranslation } from "react-i18next";

import { WidgetFrame } from "@components/WidgetFrame";

import { FALLBACK_WIDGET_ICON } from "./constants";
import { CustomWidgetBody } from "./CustomWidgetBody";
import type { CustomWidgetProps } from "./types";

export function CustomWidget({ widget, status, size }: CustomWidgetProps) {
  const { t } = useTranslation("discover");
  const titleId = useId();

  if (widget) return <CustomWidgetBody widget={widget} size={size} />;

  return (
    <WidgetFrame
      icon={FALLBACK_WIDGET_ICON}
      title={status === "ready" ? t("customWidget.deletedName") : t("customWidget.unresolvedName")}
      subtitle=""
      info=""
      titleId={titleId}
      loading={status === "loading"}
      note={status === "ready" ? t("customWidget.deleted") : t("board.loadError")}
    >
      {null}
    </WidgetFrame>
  );
}
