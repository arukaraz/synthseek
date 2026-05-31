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
  return [
    {
      key: "select",
      header: () => (
        <Checkbox
          checked={args.allSelected ? true : args.someSelected ? "indeterminate" : false}
          onCheckedChange={() => args.onToggleAll()}
          aria-label="Select all members"
        />
      ),
      cell: (member) => (
        <Checkbox
          checked={args.selectedIds.has(member.id)}
          onCheckedChange={() => args.onToggle(member.id)}
          aria-label={`Select ${member.username}`}
        />
      ),
      className: "w-10",
    },
    {
      key: "user",
      header: "User",
      cell: (member) => <MemberUserCell member={member} />,
      sortable: true,
    },
    {
      key: "requests",
      header: "Requests",
      cell: (member) => <span className={requestCount()}>{member.requestCount}</span>,
      sortable: true,
    },
    {
      key: "type",
      header: "Type",
      cell: (member) => <MemberTypeBadge isPlexUser={member.isPlexUser} />,
      sortable: true,
    },
    {
      key: "role",
      header: "Role",
      cell: (member) => <MemberRoleBadge member={member} />,
      sortable: true,
    },
    {
      key: "joined",
      header: "Joined",
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
