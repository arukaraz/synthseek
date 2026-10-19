"use client";

import { Activity } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeader } from "@components/WidgetHeader";

import { LASTFM_EMPTY_CTA, LASTFM_SETTINGS_HREF } from "../constants";
import { widgetEmptyLink, widgetEmptyPanel, widgetEmptyText } from "../styles";
import { emptyTextKey } from "./helpers";
import type { RecentScrobblesEmptyProps } from "./types";

export function RecentScrobblesEmpty({ reason, info }: RecentScrobblesEmptyProps) {
  const { t } = useTranslation("discover");
  const cta = LASTFM_EMPTY_CTA[reason];
  const ctaLabel =
    cta === "open-settings" ? t("recentScrobbles.empty.ctaOpenSettings") : t("recentScrobbles.empty.ctaConfigure");

  return (
    <section className={glassPanelCard({ height: "auto" })} aria-labelledby="recent-scrobbles-heading">
      <WidgetHeader
        icon={Activity}
        title={t("recentScrobbles.title")}
        subtitle={t("recentScrobbles.subtitle")}
        titleId="recent-scrobbles-heading"
        info={info}
      />
      <div className={widgetEmptyPanel()}>
        <p className={widgetEmptyText()}>{t(emptyTextKey(reason))}</p>
        {cta ? (
          <Link href={LASTFM_SETTINGS_HREF} className={widgetEmptyLink()}>
            {ctaLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
