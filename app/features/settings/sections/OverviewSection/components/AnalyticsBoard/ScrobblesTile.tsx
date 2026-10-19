"use client";

import { Radio } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useScrobbleHealth } from "@hooks/api/queries/analytics/useScrobbleHealth";
import { DISCOVERY_SERVICE_NAMES } from "@utils/playlist";

import { Pill } from "../../../../components/Pill";
import { AnalyticsTile } from "./AnalyticsTile";
import { activeDeliveries } from "./helpers";
import { MetricValue } from "./MetricValue";
import { serviceList, serviceName, servicePills, serviceRow } from "./styles";

export function ScrobblesTile() {
  const { t } = useTranslation("settings");
  const health = useScrobbleHealth();
  const services = activeDeliveries(health.data ?? []);
  const sent = services.reduce((total, service) => total + service.sent, 0);

  return (
    <AnalyticsTile
      icon={Radio}
      title={t("overview.analytics.scrobbles.title")}
      subtitle={t("overview.analytics.scrobbles.subtitle")}
      info={t("overview.analytics.scrobbles.info")}
      titleId="analytics-scrobbles"
      loading={health.isLoading}
      note={
        health.isError
          ? t("overview.analytics.loadError")
          : services.length === 0
            ? t("overview.analytics.scrobbles.empty")
            : null
      }
    >
      <MetricValue value={sent.toLocaleString()} unit={t("overview.analytics.scrobbles.unit", { count: sent })} />
      <ul className={serviceList()}>
        {services.map((service) => (
          <li key={service.service} className={serviceRow()}>
            <span className={serviceName()}>{DISCOVERY_SERVICE_NAMES[service.service]}</span>
            <span className={servicePills()}>
              <Pill tone="success">{t("overview.analytics.scrobbles.sent", { count: service.sent })}</Pill>
              {service.pending > 0 ? (
                <Pill tone="muted">{t("overview.analytics.scrobbles.pending", { count: service.pending })}</Pill>
              ) : null}
              {service.failed > 0 ? (
                <Pill tone="danger">{t("overview.analytics.scrobbles.failed", { count: service.failed })}</Pill>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </AnalyticsTile>
  );
}
