"use client";

import { Library } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeader } from "@components/WidgetHeader";

import { widgetEmptyLink, widgetEmptyPanel, widgetEmptyText } from "../styles";
import { DISCOVERY_SETTINGS_HREF, EMPTY_CTA } from "./constants";
import { emptyTextKey } from "./helpers";
import type { DiscoveryMixesEmptyProps } from "./types";

export function DiscoveryMixesEmpty({ reason, info }: DiscoveryMixesEmptyProps) {
  const { t } = useTranslation("discover");
  const cta = EMPTY_CTA[reason];
  const ctaLabel =
    cta === "open-settings"
      ? t("mixes.empty.ctaOpenSettings")
      : cta === "configure"
        ? t("mixes.empty.ctaConfigure")
        : t("mixes.empty.ctaChoosePlaylists");

  return (
    <section className={glassPanelCard({ height: "auto" })} aria-labelledby="discover-mixes-heading">
      <WidgetHeader
        icon={Library}
        title={t("mixes.title")}
        subtitle={t("mixes.subtitle")}
        titleId="discover-mixes-heading"
        info={info}
      />
      <div className={widgetEmptyPanel()}>
        <p className={widgetEmptyText()}>{t(emptyTextKey(reason))}</p>
        {cta ? (
          <Link href={DISCOVERY_SETTINGS_HREF} className={widgetEmptyLink()}>
            {ctaLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
