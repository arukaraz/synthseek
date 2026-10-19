"use client";

import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeader } from "@components/WidgetHeader";
import { useBoardDevice } from "@hooks/ui/board/useBoardDevice";
import { cn } from "@utils/cn";

import { widgetFrame, widgetFrameBody, widgetFrameNote, widgetFrameSkeleton } from "./styles";
import type { WidgetFrameProps } from "./types";

export function WidgetFrame({
  icon,
  title,
  subtitle,
  info,
  titleId,
  loading,
  note,
  action,
  compactOnPhone = false,
  children,
}: WidgetFrameProps) {
  const device = useBoardDevice();
  const showIcon = !(compactOnPhone && device === "narrow");

  return (
    <section className={cn(glassPanelCard(), widgetFrame())} aria-labelledby={titleId}>
      <WidgetHeader
        icon={showIcon ? icon : undefined}
        title={title}
        subtitle={subtitle}
        info={info}
        titleId={titleId}
        headingLevel="h3"
        action={action}
      />
      {loading ? (
        <div className={widgetFrameSkeleton()} />
      ) : note ? (
        <p className={widgetFrameNote()}>{note}</p>
      ) : (
        <div className={widgetFrameBody()}>{children}</div>
      )}
    </section>
  );
}
