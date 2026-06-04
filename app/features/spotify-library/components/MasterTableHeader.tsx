"use client";

import { cn } from "@utils/cn";
import { useTranslation } from "react-i18next";

import { tableHead } from "../styles";

export function MasterTableHeader() {
  const { t } = useTranslation("library");

  return (
    <thead>
      <tr>
        <th className={cn(tableHead(), "w-[38px] pl-4")} />
        <th className={tableHead()}>{t("spotifyLibrary.table.columnName")}</th>
        <th className={cn(tableHead(), "hidden w-[95px] sm:table-cell")}>{t("spotifyLibrary.table.columnType")}</th>
        <th className={cn(tableHead(), "hidden w-[60px] text-right md:table-cell")}>
          {t("spotifyLibrary.table.columnTracks")}
        </th>
        <th className={cn(tableHead(), "hidden w-[150px] lg:table-cell")}>
          {t("spotifyLibrary.table.columnImported")}
        </th>
        <th className={cn(tableHead(), "hidden w-[100px] lg:table-cell")}>
          {t("spotifyLibrary.table.columnLastSync")}
        </th>
        <th className={cn(tableHead(), "w-[96px] text-center")}>{t("spotifyLibrary.table.columnSync")}</th>
      </tr>
    </thead>
  );
}
