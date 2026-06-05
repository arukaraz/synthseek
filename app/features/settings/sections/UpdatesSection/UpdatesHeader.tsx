"use client";

import { ChevronLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { useCurrentVersion } from "@hooks/api/queries/useCurrentVersion";
import { useUpdateCheck } from "@hooks/api/queries/useUpdateCheck";
import { cn } from "@utils/cn";
import { formatRelativeTime } from "@utils/formatters";

import { backToSections } from "../../styles";
import {
  checkButton,
  headerRoot,
  headerTitleBlock,
  metaChecked,
  metaRow,
  metaSep,
  metaVersion,
  title,
  titleRow,
} from "./styles";

export function UpdatesHeader() {
  const { t } = useTranslation("settings");
  const current = useCurrentVersion();
  const check = useUpdateCheck();

  const currentVersion = current.data?.currentVersion;
  const checkedAt = check.data?.checkedAt;

  return (
    <div className={headerRoot()}>
      <div className={headerTitleBlock()}>
        <div className={titleRow()}>
          <Link href="/settings" aria-label={t("shell.pageHeader.backToSections")} className={backToSections()}>
            <ChevronLeft className="size-5" />
          </Link>
          <h1 className={title()}>{t("updates.page.title")}</h1>
          <InfoTooltip description={t("updates.page.description")} side="bottom" align="start" />
        </div>
        <div className={metaRow()}>
          <span>{t("updates.header.currentVersion")}</span>
          {currentVersion ? (
            <span className={metaVersion()}>{t("updates.versionTag", { version: currentVersion })}</span>
          ) : (
            <span className={metaChecked()}>{t("updates.version.loading")}</span>
          )}
          {checkedAt ? (
            <>
              <span className={metaSep()} aria-hidden>
                ·
              </span>
              <span className={metaChecked()}>
                {t("updates.header.checked", { time: formatRelativeTime(checkedAt) })}
              </span>
            </>
          ) : null}
        </div>
      </div>
      <button type="button" className={checkButton()} onClick={() => check.refetch()} disabled={check.isFetching}>
        <RefreshCw className={cn("size-4", check.isFetching && "animate-spin")} />
        {check.isFetching ? t("updates.header.checking") : t("updates.header.checkNow")}
      </button>
    </div>
  );
}
