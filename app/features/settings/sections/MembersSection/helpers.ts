import { Role } from "@api/__generated__/types";

import type { MemberListItem, MemberSort } from "./types";

export function formatJoinedDate(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function roleLabel(member: MemberListItem): string {
  if (member.isOwner) return "Owner";
  return member.role === Role.enum.admin ? "Admin" : "User";
}

export function roleTone(member: MemberListItem): "owner" | "admin" | "member" {
  if (member.isOwner) return "owner";
  return member.role === Role.enum.admin ? "admin" : "member";
}

function roleRank(member: MemberListItem): number {
  if (member.isOwner) return 2;
  return member.role === Role.enum.admin ? 1 : 0;
}

function compareByField(a: MemberListItem, b: MemberListItem, field: string): number {
  switch (field) {
    case "user":
      return a.username.localeCompare(b.username);
    case "requests":
      return a.requestCount - b.requestCount;
    case "type":
      return Number(a.isPlexUser) - Number(b.isPlexUser);
    case "role":
      return roleRank(a) - roleRank(b);
    case "joined":
      return a.created_at.getTime() - b.created_at.getTime();
    default:
      return 0;
  }
}

export function sortMembers(rows: MemberListItem[], sort: MemberSort): MemberListItem[] {
  const direction = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => direction * compareByField(a, b, sort.field));
}
