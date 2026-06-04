import { Checkbox } from "@components/ui/Checkbox";
import type { ColumnDef } from "@components/ui/Table";

import { MemberActionsCell } from "./components/MemberActionsCell";
import { MemberRoleBadge } from "./components/MemberRoleBadge";
import { MemberTypeBadge } from "./components/MemberTypeBadge";
import { MemberUserCell } from "./components/MemberUserCell";
import { formatJoinedDate } from "./helpers";
import { joinedDate, requestCount } from "./styles";
import type { BuildMemberColumnsArgs, MemberListItem } from "./types";

export function buildMemberColumns(args: BuildMemberColumnsArgs): ColumnDef<MemberListItem>[] {
  const { t } = args;
  return [
    {
      key: "select",
      header: () => (
        <Checkbox
          checked={args.allSelected ? true : args.someSelected ? "indeterminate" : false}
          onCheckedChange={() => args.onToggleAll()}
          aria-label={t("members.columns.selectAll")}
        />
      ),
      cell: (member) => (
        <Checkbox
          checked={args.selectedIds.has(member.id)}
          onCheckedChange={() => args.onToggle(member.id)}
          aria-label={t("members.columns.selectMember", { username: member.username })}
        />
      ),
      className: "w-10",
    },
    {
      key: "user",
      header: t("members.columns.user"),
      cell: (member) => <MemberUserCell member={member} />,
      sortable: true,
    },
    {
      key: "requests",
      header: t("members.columns.requests"),
      cell: (member) => <span className={requestCount()}>{member.requestCount}</span>,
      sortable: true,
    },
    {
      key: "type",
      header: t("members.columns.type"),
      cell: (member) => <MemberTypeBadge isPlexUser={member.isPlexUser} />,
      sortable: true,
    },
    {
      key: "role",
      header: t("members.columns.role"),
      cell: (member) => <MemberRoleBadge member={member} />,
      sortable: true,
    },
    {
      key: "joined",
      header: t("members.columns.joined"),
      cell: (member) => <span className={joinedDate()}>{formatJoinedDate(member.created_at)}</span>,
      sortable: true,
    },
    {
      key: "actions",
      header: "",
      cell: (member) => (
        <MemberActionsCell
          member={member}
          currentUserId={args.currentUserId}
          onEdit={() => args.onEdit(member)}
          onDelete={() => args.onDelete(member)}
        />
      ),
      className: "w-24",
    },
  ];
}
