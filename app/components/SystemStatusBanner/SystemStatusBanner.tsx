"use client";

import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { useSystemStatus } from "@hooks/api/queries/useSystemStatus";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { SYSTEM_STATUS_HREF } from "./constants";
import { isSettingsPath } from "./helpers";
import {
  bannerBody,
  bannerIcon,
  bannerLink,
  bannerMessage,
  bannerMore,
  bannerRoot,
  bannerRow,
  bannerTitle,
} from "./styles";

export function SystemStatusBanner() {
  const { t } = useTranslation(["appShell", "settings"]);
  const { isAdmin } = useAuthContext();
  const inSettings = isSettingsPath(usePathname());
  const status = useSystemStatus(isAdmin && inSettings);

  const problems = status.data?.problems ?? [];
  const first = problems[0];
  if (!isAdmin || !inSettings || first === undefined) return null;

  const more = problems.length - 1;

  return (
    <section className={bannerRoot()} aria-label={t("appShell:systemStatusBanner.label")}>
      <div className={bannerRow()}>
        <TriangleAlert className={bannerIcon()} aria-hidden />
        <div className={bannerBody()}>
          <p className={bannerMessage()}>
            <span className={bannerTitle()}>{t(`settings:maintenance.systemStatus.problems.${first.kind}.title`)}</span>
            {more > 0 ? (
              <>
                {" "}
                <span className={bannerMore()}>{t("appShell:systemStatusBanner.more", { count: more })}</span>
              </>
            ) : null}
          </p>
          <Link href={SYSTEM_STATUS_HREF} className={bannerLink()}>
            {t("appShell:systemStatusBanner.details")}
          </Link>
        </div>
      </div>
    </section>
  );
}
