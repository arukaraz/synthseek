"use client";

import { useTranslation } from "react-i18next";

import { comparisonOf, evidenceSentence } from "../helpers";
import { compareHeadCell, compareTable, evidenceText } from "../styles";
import type { ReviewCompareTableProps } from "../types";
import { ReviewCompareRows } from "./ReviewCompareRows";

export function ReviewCompareTable({ item }: ReviewCompareTableProps) {
  const { t } = useTranslation("requests");

  const comparison = comparisonOf(item);
  if (comparison === null) return <p className={evidenceText()}>{evidenceSentence(item, t)}</p>;

  return (
    <table className={compareTable()}>
      <caption className="sr-only">{evidenceSentence(item, t)}</caption>
      <thead>
        <tr>
          <th className={compareHeadCell({ className: "w-20" })}>
            <span className="sr-only">{t("review.compare.field")}</span>
          </th>
          <th className={compareHeadCell()}>{t("review.compare.requested")}</th>
          <th className={compareHeadCell({ className: "w-5" })}>
            <span className="sr-only">{t("review.compare.verdict")}</span>
          </th>
          <th className={compareHeadCell()}>{t("review.compare.found")}</th>
        </tr>
      </thead>
      <tbody>
        <ReviewCompareRows comparison={comparison} track={item.track} />
      </tbody>
    </table>
  );
}
