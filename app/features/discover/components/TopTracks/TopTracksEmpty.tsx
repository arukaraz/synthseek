"use client";

import { Trophy } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeader } from "@components/WidgetHeader";

import { LASTFM_EMPTY_CTA, LASTFM_SETTINGS_HREF } from "../constants";
import { widgetEmptyLink, widgetEmptyPanel, widgetEmptyText } from "../styles";
import { emptyTextKey } from "./helpers";
import type { TopTracksEmptyProps } from "./types";

export function TopTracksEmpty({ reason, info }: TopTracksEmptyProps) {
  const { t } = useTranslation("discover");
  const cta = LASTFM_EMPTY_CTA[reason];
  const ctaLabel = cta === "open-settings" ? t("topTracks.empty.ctaOpenSettings") : t("topTracks.empty.ctaConfigure");

  return (
    <section className={glassPanelCard({ height: "auto" })} aria-labelledby="top-tracks-heading">
      <WidgetHeader
        icon={Trophy}
        title={t("topTracks.title")}
        subtitle={t("topTracks.subtitle")}
        titleId="top-tracks-heading"
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
