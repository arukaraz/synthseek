"use client";

import { cn } from "@utils/cn";

import { tableHead } from "../styles";

export function MasterTableHeader() {
  return (
    <thead>
      <tr>
        <th className={cn(tableHead(), "w-[38px] pl-4")} />
        <th className={tableHead()}>Name</th>
        <th className={cn(tableHead(), "hidden w-[95px] sm:table-cell")}>Type</th>
        <th className={cn(tableHead(), "hidden w-[60px] text-right md:table-cell")}>Tracks</th>
        <th className={cn(tableHead(), "hidden w-[150px] lg:table-cell")}>Imported</th>
        <th className={cn(tableHead(), "hidden w-[100px] lg:table-cell")}>Last sync</th>
        <th className={cn(tableHead(), "w-[96px] text-center")}>Sync</th>
      </tr>
    </thead>
  );
}
