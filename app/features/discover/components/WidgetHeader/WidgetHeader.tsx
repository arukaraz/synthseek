"use client";

import { WidgetHeaderActionLink } from "./WidgetHeaderActionLink";
import {
  widgetHeaderIcon,
  widgetHeaderLead,
  widgetHeaderRow,
  widgetHeaderSubtitle,
  widgetHeaderTitle,
  widgetHeaderTitleStack,
} from "./styles";
import type { WidgetHeaderProps } from "./types";

export function WidgetHeader({ icon: Icon, title, subtitle, headingLevel = "h2", action, titleId }: WidgetHeaderProps) {
  const Heading = headingLevel;

  return (
    <header className={widgetHeaderRow()}>
      <div className={widgetHeaderLead()}>
        <span className={widgetHeaderIcon()} aria-hidden>
          <Icon className="size-4" />
        </span>
        <div className={widgetHeaderTitleStack()}>
          <Heading id={titleId} className={widgetHeaderTitle()}>
            {title}
          </Heading>
          <p className={widgetHeaderSubtitle()}>{subtitle}</p>
        </div>
      </div>
      {action ? <WidgetHeaderActionLink action={action} /> : null}
    </header>
  );
}
