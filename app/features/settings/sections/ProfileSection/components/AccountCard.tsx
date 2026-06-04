"use client";

import { ShieldCheck, User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Role } from "@api/__generated__/types";
import { formatDate } from "@utils/formatters";

import { SettingsCard } from "../../../components/SettingsCard";
import { accountAvatar, accountMeta } from "../styles";
import type { ProfileCardProps } from "../types";

export function AccountCard({ user }: ProfileCardProps) {
  const { t } = useTranslation("settings");
  const isPlex = user.plex_username !== null;
  const isAdmin = user.role === Role.enum.admin;

  return (
    <SettingsCard title={t("profile.account.title")}>
      <div className="flex items-center gap-4">
        <div className={accountAvatar()}>
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
          ) : (
            <UserIcon className="text-fg/60 size-6" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-fg truncate text-base font-semibold">{user.username}</p>
          <p className="text-fg/50 truncate text-sm">{user.email}</p>
          <div className={accountMeta()}>
            <span className="inline-flex items-center gap-1">
              {isAdmin ? <ShieldCheck className="size-3" /> : null}
              {user.role}
            </span>
            <span className="text-fg/30">·</span>
            <span>{isPlex ? t("profile.account.plexAccount") : t("profile.account.localAccount")}</span>
            <span className="text-fg/30">·</span>
            <span>
              {t("profile.account.memberSince")} {formatDate(new Date(user.created_at))}
            </span>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
