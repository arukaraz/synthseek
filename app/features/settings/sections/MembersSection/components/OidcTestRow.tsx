"use client";

import { Plug } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Notice } from "@components/ui/Notice";
import { useTestOidc } from "@hooks/api/mutations/settings/useOidcSettings";

import { OIDC_TEST_FAILURE_KEYS } from "../constants";
import { formatTestedAt } from "../helpers";
import { oidcTestMeta, oidcTestRow } from "../styles";
import type { OidcTestRowProps } from "../types";

export function OidcTestRow({ dirty, configured, lastPassedAt }: OidcTestRowProps) {
  const { t } = useTranslation("settings");
  const test = useTestOidc();
  const result = test.data;

  return (
    <div className="flex flex-col gap-3">
      <div className={oidcTestRow()}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => test.mutate()}
          disabled={test.isPending || dirty || !configured}
        >
          <Plug className="size-4" />
          {test.isPending ? t("members.oidc.test.testing") : t("members.oidc.test.action")}
        </Button>
        <span className={oidcTestMeta()}>
          {lastPassedAt
            ? t("members.oidc.test.lastPassed", { date: formatTestedAt(lastPassedAt) })
            : t("members.oidc.test.neverPassed")}
        </span>
      </div>
      {dirty ? <p className={oidcTestMeta()}>{t("members.oidc.test.saveFirst")}</p> : null}
      {result && !dirty ? (
        result.ok ? (
          <Notice variant="success" title={t("members.oidc.test.passed")} />
        ) : (
          <Notice variant="danger" title={t("members.oidc.test.failed")}>
            {result.failure ? t(OIDC_TEST_FAILURE_KEYS[result.failure]) : null}
          </Notice>
        )
      ) : null}
    </div>
  );
}
