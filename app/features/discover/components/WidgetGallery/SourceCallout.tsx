import { RotateCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";

import { SourcePills } from "./SourcePills";
import { SourceReason } from "./SourceReason";
import { sourceCallout, sourceCalloutText } from "./styles";
import type { SourceCalloutProps } from "./types";

export function SourceCallout({ row, onRetry }: SourceCalloutProps) {
  const { t } = useTranslation("widgets");
  const unknown = row.status === "unknown";
  return (
    <div className={sourceCallout({ unknown })} role="status">
      <SourcePills pills={row.pills} inactive />
      <p className={sourceCalloutText()}>{row.reason ? <SourceReason reason={row.reason} /> : null}</p>
      {unknown ? (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          <RotateCw />
          {t("gallery.sources.retry")}
        </Button>
      ) : null}
    </div>
  );
}
