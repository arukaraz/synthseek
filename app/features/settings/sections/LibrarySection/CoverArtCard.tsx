"use client";

import { ImagePlus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { Notice } from "@components/ui/Notice";
import { useFillCoverArt, useStartCoverArtCount } from "@hooks/api/mutations/settings/useCoverArt";
import { useCoverArtCount, useCoverArtFillStatus } from "@hooks/api/queries/useCoverArt";
import { formatCount } from "@utils/formatters";

import { EngineRow } from "../../components/EngineRow";
import { SettingsCard } from "../../components/SettingsCard";
import { COVER_ART_LEFT_ALONE } from "./constants";
import { analysisFactValue, analysisRow, coverArtNote } from "./styles";

export function CoverArtCard() {
  const { t } = useTranslation("settings");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const count = useCoverArtCount();
  const fillStatus = useCoverArtFillStatus();
  const startCount = useStartCoverArtCount();
  const fill = useFillCoverArt();

  const counted = count.data;
  const filling = fillStatus.data;
  const writing = filling?.running === true;
  const reading = counted?.counting === true;
  const ready = counted?.ready === true && !reading && !writing;
  const missing = counted?.missing ?? 0;

  return (
    <SettingsCard title={t("coverArt.title")} description={t("coverArt.description")} anchor="library-cover-art">
      {writing ? (
        <p className={coverArtNote()}>
          {t("coverArt.fill.running", {
            processed: formatCount(filling?.processed ?? 0),
            total: formatCount(filling?.total ?? 0),
          })}
        </p>
      ) : reading ? (
        <p className={coverArtNote()}>
          {t("coverArt.status.reading", {
            checked: formatCount(counted?.checked ?? 0),
            total: formatCount(counted?.total ?? 0),
          })}
        </p>
      ) : ready && counted ? (
        <>
          <EngineRow
            label={t("coverArt.status.missing.label")}
            description={t("coverArt.status.missing.description")}
            control={<span className={analysisFactValue()}>{formatCount(missing)}</span>}
          />
          {COVER_ART_LEFT_ALONE.filter((reason) => counted[reason] > 0).map((reason) => (
            <EngineRow
              key={reason}
              label={t(`coverArt.status.${reason}.label`)}
              description={t(`coverArt.status.${reason}.description`)}
              control={<span className={analysisFactValue()}>{formatCount(counted[reason])}</span>}
            />
          ))}
          {missing > 0 ? (
            <div className={analysisRow()}>
              <Button variant="secondary" size="sm" disabled={fill.isPending} onClick={() => setConfirmOpen(true)}>
                <ImagePlus />
                {t("coverArt.fill.action")}
              </Button>
            </div>
          ) : (
            <p className={coverArtNote()}>{t("coverArt.status.none")}</p>
          )}
        </>
      ) : (
        <>
          {counted && !counted.ready && counted.finishedAt !== null ? (
            <Notice variant="danger" title={t("coverArt.status.loadError")} />
          ) : null}
          <EngineRow
            label={t("coverArt.check.label")}
            description={t("coverArt.check.description")}
            control={
              <Button variant="outline" size="sm" disabled={startCount.isPending} onClick={() => startCount.mutate()}>
                {t("coverArt.check.action")}
              </Button>
            }
          />
          {filling && filling.finishedAt !== null ? (
            <p className={coverArtNote()}>
              {t("coverArt.fill.lastRun", {
                embedded: formatCount(filling.embedded),
                kept: formatCount(filling.kept),
                failed: formatCount(filling.failed),
              })}
            </p>
          ) : null}
        </>
      )}

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (counted && counted.finishedAt !== null) fill.mutate({ countedAt: counted.finishedAt });
          setConfirmOpen(false);
        }}
        title={t("coverArt.fill.confirmTitle")}
        message={t("coverArt.fill.confirmMessage", { count: missing, formatted: formatCount(missing) })}
        confirmText={t("coverArt.fill.confirm")}
      />
    </SettingsCard>
  );
}
