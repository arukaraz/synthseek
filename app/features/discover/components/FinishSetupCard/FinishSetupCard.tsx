"use client";

import { useId } from "react";
import { useTranslation } from "react-i18next";

import { useDismissSetupPending } from "@hooks/api/mutations/setup/useDismissSetupPending";
import { useSetupPending } from "@hooks/api/queries/setup/useSetupPending";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { SETUP_ITEM_TOTAL } from "./constants";
import { FinishSetupRow } from "./FinishSetupRow";
import {
  finishCard,
  finishCounter,
  finishFooter,
  finishHeader,
  finishHide,
  finishList,
  finishMeter,
  finishMeterFill,
  finishTitle,
} from "./styles";

export function FinishSetupCard() {
  const { t } = useTranslation("discover");
  const { isAdmin } = useAuthContext();
  const pending = useSetupPending({ enabled: isAdmin });
  const dismiss = useDismissSetupPending();
  const titleId = useId();
  const data = pending.data;

  if (!isAdmin || !data || data.dismissed || data.count === 0) return null;

  const done = Math.max(0, SETUP_ITEM_TOTAL - data.count);
  const width = `${(done / SETUP_ITEM_TOTAL) * 100}%`;

  return (
    <section aria-labelledby={titleId} className={finishCard()}>
      <div className={finishHeader()}>
        <h2 id={titleId} className={finishTitle()}>
          {t("finishSetup.title")}
        </h2>
        <span className={finishCounter()}>{t("finishSetup.progress", { done, total: SETUP_ITEM_TOTAL })}</span>
      </div>
      <div aria-hidden="true" className={finishMeter()}>
        <span className={finishMeterFill()} style={{ width }} />
      </div>
      <ul aria-label={t("finishSetup.listLabel")} className={finishList()}>
        {data.items.map((item) => (
          <FinishSetupRow key={item} item={item} />
        ))}
      </ul>
      <div className={finishFooter()}>
        <button type="button" onClick={() => dismiss.mutate()} disabled={dismiss.isPending} className={finishHide()}>
          {t("finishSetup.hide")}
        </button>
      </div>
    </section>
  );
}
