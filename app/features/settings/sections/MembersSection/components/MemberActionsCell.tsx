import { Pencil, Trash2 } from "lucide-react";

import { IconButton } from "@components/ui/IconButton";

import { actionsCell } from "../styles";
import type { MemberActionsCellProps } from "../types";

export function MemberActionsCell({ member, currentUserId, onEdit, onDelete }: MemberActionsCellProps) {
  const isSelf = member.id === currentUserId;
  const deleteDisabled = member.isOwner || isSelf;

  return (
    <div className={actionsCell()}>
      <IconButton icon={Pencil} variant="secondary" size="sm" aria-label={`Edit ${member.username}`} onClick={onEdit} />
      <IconButton
        icon={Trash2}
        variant="red"
        size="sm"
        aria-label={`Delete ${member.username}`}
        onClick={onDelete}
        disabled={deleteDisabled}
      />
    </div>
  );
}
