"use client";

import { InfoTooltip } from "@components/ui/InfoTooltip";

import { WidgetHeaderActionLink } from "./WidgetHeaderActionLink";
import {
  widgetHeaderAside,
  widgetHeaderIcon,
  widgetHeaderLead,
  widgetHeaderRow,
  widgetHeaderSubtitle,
  widgetHeaderTitle,
  widgetHeaderTitleLine,
  widgetHeaderTitleStack,
} from "./styles";
import type { WidgetHeaderProps } from "./types";

export function WidgetHeader({
  icon: Icon,
  title,
  subtitle,
  headingLevel = "h2",
  action,
  aside,
  titleId,
  info,
}: WidgetHeaderProps) {
  const Heading = headingLevel;

  return (
    <header className={widgetHeaderRow()}>
      <div className={widgetHeaderLead()}>
        {Icon ? (
          <span className={widgetHeaderIcon()} aria-hidden>
            <Icon className="size-4" />
          </span>
        ) : null}
        <div className={widgetHeaderTitleStack()}>
          <div className={widgetHeaderTitleLine()}>
            <Heading id={titleId} className={widgetHeaderTitle()}>
              {title}
            </Heading>
            {info ? <InfoTooltip title={title} description={info} /> : null}
          </div>
          <p className={widgetHeaderSubtitle()}>{subtitle}</p>
        </div>
      </div>
      {aside ? <div className={widgetHeaderAside()}>{aside}</div> : null}
      {action ? <WidgetHeaderActionLink action={action} /> : null}
    </header>
  );
}
