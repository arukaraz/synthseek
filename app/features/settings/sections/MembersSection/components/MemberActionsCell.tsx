"use client";

import { Pencil, SlidersHorizontal, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Role } from "@api/__generated__/types";
import { IconButton } from "@components/ui/IconButton";

import { actionsCell } from "../styles";
import type { MemberActionsCellProps } from "../types";

export function MemberActionsCell({ member, currentUserId, onEdit, onEditPreset, onDelete }: MemberActionsCellProps) {
  const { t } = useTranslation("settings");
  const isSelf = member.id === currentUserId;
  const deleteDisabled = member.isOwner || isSelf;

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
