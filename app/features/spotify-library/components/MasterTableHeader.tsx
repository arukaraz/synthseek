"use client";

import { cn } from "@utils/cn";

import { tableHead } from "../styles";

export function MasterTableHeader() {
  return (
    <thead>
      <tr>
        <th className={cn(tableHead(), "w-[38px] pl-4")} />
        <th className={tableHead()}>Name</th>
        <th className={cn(tableHead(), "w-[95px]")}>Type</th>
        <th className={cn(tableHead(), "w-[60px] text-right")}>Tracks</th>
        <th className={cn(tableHead(), "w-[150px]")}>Imported</th>
        <th className={cn(tableHead(), "w-[100px]")}>Last sync</th>
        <th className={cn(tableHead(), "w-[96px] text-center")}>Sync</th>
      </tr>
    </thead>
  );
}
