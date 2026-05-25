"use client";

import { ShieldCheck, User as UserIcon } from "lucide-react";

import { Role } from "@api/__generated__/types";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { cn } from "@utils/cn";
import { trpc } from "@utils/trpc";

import { SettingsCard } from "../../components/SettingsCard";
import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { contentRoot, emptyPanel, memberAvatar, memberRow } from "../../styles";

export function MembersSection() {
  const { isAdmin } = useAuthContext();
  const usersQuery = trpc.users.list.useQuery(undefined, { enabled: isAdmin });

  if (!isAdmin) {
    return (
      <div className={contentRoot()}>
        <SettingsPageHeader title="Members" />
        <SettingsCard title="Members" description="Manage users and invitations.">
          <div className={emptyPanel()}>
            <span className="text-fg/60 text-sm">Only administrators can view members.</span>
          </div>
        </SettingsCard>
      </div>
    );
  }

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title="Members" />
      <SettingsCard title="Members" description="Users that share this Synthseek instance.">
        {usersQuery.isLoading ? (
          <div className={emptyPanel()}>
            <span className="text-fg/60 text-sm">Loading members…</span>
          </div>
        ) : usersQuery.error ? (
          <div className={emptyPanel()}>
            <span className="text-sm text-red-400">Failed to load members: {usersQuery.error.message}</span>
          </div>
        ) : (usersQuery.data ?? []).length === 0 ? (
          <div className={emptyPanel()}>
            <span className="text-fg/60 text-sm">No members yet.</span>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {usersQuery.data?.map((user) => (
              <li key={user.id} className={memberRow()}>
                <div className={memberAvatar()}>
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="text-fg/60 h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-fg truncate text-sm font-medium">{user.username}</p>
                  <p className="text-fg/50 truncate text-xs">{user.email}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1",
                    user.role === Role.enum.admin
                      ? "bg-amber-500/10 text-amber-300 ring-amber-500/30"
                      : "ring-fg/10 bg-fg/5 text-fg/60"
                  )}
                >
                  {user.role === Role.enum.admin ? <ShieldCheck className="h-3 w-3" /> : null}
                  {user.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SettingsCard>
    </div>
  );
}
