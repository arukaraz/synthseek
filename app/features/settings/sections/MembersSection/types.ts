import type { inferRouterOutputs } from "@trpc/server";
import type { TFunction } from "i18next";

import type { AppRouter } from "@api/__generated__/types";
import type { ColumnDef, SortState } from "@components/ui/Table";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type MemberListItem = RouterOutputs["users"]["list"][number];
export type PlexImportableUser = RouterOutputs["users"]["plexImportable"][number];
export type RoleValue = MemberListItem["role"];

export interface RoleOption {
  value: RoleValue;
  label: string;
}

export type MemberSort = SortState;

export interface BuildMemberColumnsArgs {
  t: TFunction<"settings">;
  currentUserId: string | undefined;
  selectedIds: Set<string>;
  allSelected: boolean;
  someSelected: boolean;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onEdit: (member: MemberListItem) => void;
  onDelete: (member: MemberListItem) => void;
}

export type MemberColumns = ColumnDef<MemberListItem>[];

export interface MemberCellProps {
  member: MemberListItem;
}

export interface MemberTypeBadgeProps {
  isPlexUser: boolean;
}

export interface MemberActionsCellProps {
  member: MemberListItem;
  currentUserId: string | undefined;
  onEdit: () => void;
  onDelete: () => void;
}

export interface MembersToolbarProps {
  onCreate: () => void;
  onImport: () => void;
}

export interface BulkEditBarProps {
  count: number;
  isPending: boolean;
  onSetRole: (role: RoleValue) => void;
  onDelete: () => void;
  onClear: () => void;
}

export interface CreateLocalUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface EditUserDialogProps {
  member: MemberListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ImportPlexUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
