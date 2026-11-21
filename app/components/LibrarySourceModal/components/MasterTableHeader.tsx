"use client";

import { cn } from "@utils/cn";
import { useTranslation } from "react-i18next";

import { tableHead } from "../styles";

export function MasterTableHeader() {
  const { t } = useTranslation("library");

  return (
    <thead>
      <tr>
        <th className={cn(tableHead(), "w-9.5 pl-4")} />
        <th className={tableHead()}>{t("librarySource.table.columnName")}</th>
        <th className={cn(tableHead(), "hidden w-23.75 sm:table-cell")}>{t("librarySource.table.columnType")}</th>
        <th className={cn(tableHead(), "hidden w-15 text-right md:table-cell")}>
          {t("librarySource.table.columnTracks")}
        </th>
        <th className={cn(tableHead(), "hidden w-37.5 lg:table-cell")}>{t("librarySource.table.columnImported")}</th>
        <th className={cn(tableHead(), "hidden w-25 lg:table-cell")}>{t("librarySource.table.columnLastSync")}</th>
        <th className={cn(tableHead(), "w-24 text-center")}>{t("librarySource.table.columnSync")}</th>
      </tr>
    </thead>
  );
}
