import { ShieldCheck, Trash2, User as UserIcon } from "lucide-react";

import { Button } from "@components/ui/Button";
import { Role } from "@api/__generated__/types";

import { BULK_COPY } from "../constants";
import { bulkBar, bulkCount, bulkSpacer } from "../styles";
import type { BulkEditBarProps } from "../types";

export function BulkEditBar({ count, isPending, onSetRole, onDelete, onClear }: BulkEditBarProps) {
  return (
    <div className={bulkBar()}>
      <span className={bulkCount()}>
        {count} {BULK_COPY.selectedSuffix}
      </span>
      <Button size="sm" variant="outline" onClick={() => onSetRole(Role.enum.member)} disabled={isPending}>
        <UserIcon />
        Make User
      </Button>
      <Button size="sm" variant="outline" onClick={() => onSetRole(Role.enum.admin)} disabled={isPending}>
        <ShieldCheck />
        Make Admin
      </Button>
      <div className={bulkSpacer()} />
      <Button size="sm" variant="destructive" onClick={onDelete} disabled={isPending}>
        <Trash2 />
        {BULK_COPY.delete}
      </Button>
      <Button size="sm" variant="ghost" onClick={onClear} disabled={isPending}>
        {BULK_COPY.clear}
      </Button>
    </div>
  );
}
