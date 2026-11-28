"use client";

import { Check, Pencil, SlidersHorizontal, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Role } from "@api/__generated__/types";
import { IconButton } from "@components/ui/IconButton";

import { actionsCell } from "../styles";
import type { MemberActionsCellProps } from "../types";

export function MemberActionsCell({
  member,
  currentUserId,
  onEdit,
  onEditPreset,
  onDelete,
  onApprove,
  onReject,
  decisionPending,
}: MemberActionsCellProps) {
  const { t } = useTranslation("settings");
  const isSelf = member.id === currentUserId;
  const deleteDisabled = member.isOwner || isSelf;

  if (member.pendingApproval) {
    return (
      <div className={actionsCell()}>
        <IconButton
          icon={Check}
          variant="green"
          size="sm"
          aria-label={t("members.pending.approve", { username: member.username })}
          onClick={onApprove}
          disabled={decisionPending}
        />
        <IconButton
          icon={X}
          variant="red"
          size="sm"
          aria-label={t("members.pending.reject", { username: member.username })}
          onClick={onReject}
          disabled={decisionPending}
        />
      </div>
    );
  }

  return (
    <div className={actionsCell()}>
      {member.role === Role.enum.member ? (
        <IconButton
          icon={SlidersHorizontal}
          variant="secondary"
          size="sm"
          aria-label={t("requestPreset.member.action", { username: member.username })}
          onClick={onEditPreset}
        />
      ) : null}
      <IconButton
        icon={Pencil}
        variant="secondary"
        size="sm"
        aria-label={t("members.actions.edit", { username: member.username })}
        onClick={onEdit}
      />
      <IconButton
        icon={Trash2}
        variant="red"
        size="sm"
        aria-label={t("members.actions.delete", { username: member.username })}
        onClick={onDelete}
        disabled={deleteDisabled}
      />
    </div>
  );
}
