"use client";

import { useTranslation } from "react-i18next";

import { compareLabelCell, compareMarkCell, compareValueCell } from "../styles";
import type { CompareRowProps } from "../types";

export function CompareRow({ label, requested, found, differs }: CompareRowProps) {
  const { t } = useTranslation("requests");

  return (
    <tr>
      <th scope="row" className={compareLabelCell({ className: "text-left font-normal" })}>
        {label}
      </th>
      <td className={compareValueCell()}>{requested}</td>
      <td className={compareMarkCell({ differs })}>
        <span aria-hidden="true">{differs ? "≠" : "="}</span>
        <span className="sr-only">{differs ? t("review.compare.differs") : t("review.compare.matches")}</span>
      </td>
      <td className={compareValueCell()}>{found}</td>
    </tr>
  );
}
