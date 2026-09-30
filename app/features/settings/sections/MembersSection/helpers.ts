import type { TFunction } from "i18next";

import { Role } from "@api/__generated__/types";
import type { RoleTone } from "@components/ui/RoleChip";
import i18n from "@locale";
import { formatBytes } from "@utils/formatters";

import type { MemberListItem, MemberSort, RoleOption } from "./types";

export function formatJoinedDate(date: Date): string {
  return date.toLocaleDateString(i18n.language, { year: "numeric", month: "long", day: "numeric" });
}

export function roleLabel(member: MemberListItem): string {
  if (member.isOwner) return i18n.t("settings:members.role.owner");
  if (member.role === Role.enum.admin) return i18n.t("settings:members.role.admin");
  if (member.role === Role.enum.trusted) return i18n.t("settings:members.role.trusted");
  return i18n.t("settings:members.role.user");
}

export function buildRoleOptions(t: TFunction<"settings">): RoleOption[] {
  return [
    { value: Role.enum.member, label: t("members.roleOptions.user") },
    { value: Role.enum.trusted, label: t("members.roleOptions.trusted") },
    { value: Role.enum.admin, label: t("members.roleOptions.admin") },
  ];
}

export function quotaInputOf(value: number | null): string {
  return value === null ? "" : String(value);
}

export function parseQuotaInput(raw: string): number | null {
  const trimmed = raw.trim();
  return trimmed === "" ? null : Number(trimmed);
}

export function isValidQuotaInput(raw: string, wholeNumber: boolean): boolean {
  const parsed = parseQuotaInput(raw);
  if (parsed === null) return true;
  return Number.isFinite(parsed) && parsed >= 0 && (!wholeNumber || Number.isInteger(parsed));
}

export function quotaSummary(quota: MemberListItem["quota"]): string[] {
  if (quota.exempt) return [i18n.t("settings:members.quotaCell.exempt")];
  const lines: string[] = [];
  if (quota.tracks.limit !== null) {
    lines.push(i18n.t("settings:members.quotaCell.tracks", { used: quota.tracks.used, limit: quota.tracks.limit }));
  }
  if (quota.storage.limitBytes !== null) {
    lines.push(
      i18n.t("settings:members.quotaCell.storage", {
        used: formatBytes(quota.storage.storedBytes + quota.storage.pendingBytes),
        limit: formatBytes(quota.storage.limitBytes),
      })
    );
  }
  return lines.length > 0 ? lines : [i18n.t("settings:members.quotaCell.unlimited")];
}

export function roleTone(member: MemberListItem): RoleTone {
  if (member.isOwner) return "owner";
  if (member.role === Role.enum.admin) return "admin";
  if (member.role === Role.enum.trusted) return "trusted";
  return "member";
}

function roleRank(member: MemberListItem): number {
  if (member.isOwner) return 3;
  if (member.role === Role.enum.admin) return 2;
  return member.role === Role.enum.trusted ? 1 : 0;
}

function quotaFill(member: MemberListItem): number {
  const { exempt, tracks, storage } = member.quota;
  if (exempt) return -1;
  const trackFill = tracks.limit ? tracks.used / tracks.limit : 0;
  const storageFill = storage.limitBytes ? (storage.storedBytes + storage.pendingBytes) / storage.limitBytes : 0;
  return Math.max(trackFill, storageFill);
}

function compareByField(a: MemberListItem, b: MemberListItem, field: string): number {
  switch (field) {
    case "user":
      return a.username.localeCompare(b.username);
    case "requests":
      return a.requestCount - b.requestCount;
    case "quota":
      return quotaFill(a) - quotaFill(b);
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
