"use client";

import { Activity } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { SOURCE_NAMES } from "@components/SourceBadge";
import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeader } from "@components/WidgetHeader";

import { PROVIDER_SETTINGS_HREFS } from "../constants";
import { widgetEmptyLink, widgetEmptyPanel, widgetEmptyText } from "../styles";
import { emptyTextKey, scrobblesTitleKey } from "./helpers";
import type { RecentScrobblesEmptyProps } from "./types";

export function RecentScrobblesEmpty({ reason, info, provider }: RecentScrobblesEmptyProps) {
  const { t } = useTranslation("discover");
  const name = SOURCE_NAMES[provider];
  const headingId = `recent-scrobbles-heading-${provider}`;

  return (
    <section className={glassPanelCard({ height: "auto" })} aria-labelledby={headingId}>
      <WidgetHeader
        icon={Activity}
        title={t(scrobblesTitleKey(provider))}
        subtitle={name}
        titleId={headingId}
        info={info}
      />
      <div className={widgetEmptyPanel()}>
        <p className={widgetEmptyText()}>{t(emptyTextKey(reason), { provider: name })}</p>
        {reason === "unlinked" ? (
          <Link href={PROVIDER_SETTINGS_HREFS[provider]} className={widgetEmptyLink()}>
            {t("recentScrobbles.empty.ctaConfigure", { provider: name })}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
