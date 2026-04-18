"use client";

import { TableBody, TableHead, TableHeader, Table as TablePrimitive, TableRow } from "@components/ui/TablePrimitives";
import { cn } from "@utils/cn";
import { AnimatePresence } from "framer-motion";
import { COLUMNS, TableProps, TableSortField } from "@features/requests/types";
import { tableContainer } from "../styles";
import { RequestRow } from "./RequestRow";
import { SortableHeader } from "./SortableHeader";

export function Table({ items, sort, onSortChange }: TableProps) {
  const handleSort = (field: string) => {
    const sortField = field as TableSortField;
    if (sort.field === sortField) {
      onSortChange({
        field: sortField,
        direction: sort.direction === "asc" ? "desc" : "asc",
      });
    } else {
      onSortChange({
        field: sortField,
        direction: "desc",
      });
    }
  };

  return (
    <div className={tableContainer()}>
      <div className="overflow-x-auto">
        <TablePrimitive className="min-w-[600px]">
          <TableHeader className="bg-surface/40">
            <TableRow className="border-fg/10 hover:bg-transparent">
              {COLUMNS.map((column) => (
                <TableHead
                  key={column.field}
                  className={cn("px-3 py-2 sm:px-4 sm:py-3", column.field === "actions" && "w-20")}
                >
                  {column.sortable ? (
                    <SortableHeader
                      label={column.label}
                      field={column.field}
                      currentField={sort.field}
                      direction={sort.direction}
                      onSort={handleSort}
                    />
                  ) : (
                    <span className="text-fg/40 text-xs font-medium tracking-wider uppercase">{column.label}</span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="sync">
              {items.map((item) => (
                <RequestRow key={`${item.parent.id}:${item.id}`} item={item} />
              ))}
            </AnimatePresence>
          </TableBody>
        </TablePrimitive>
      </div>
    </div>
  );
}
