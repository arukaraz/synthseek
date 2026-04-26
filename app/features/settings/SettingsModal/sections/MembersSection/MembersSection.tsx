"use client";

import { ShieldCheck, User as UserIcon } from "lucide-react";

import { Role } from "@api/__generated__/types";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { cn } from "@utils/cn";
import { trpc } from "@utils/trpc";

import { emptyPanel, sectionSubtitle, sectionTitle } from "../../styles";

export function MembersSection() {
  const { isAdmin } = useAuthContext();
  const usersQuery = trpc.users.list.useQuery(undefined, { enabled: isAdmin });

  if (!isAdmin) {
    return (
      <section className="flex flex-col gap-3">
        <header className="flex flex-col gap-1">
          <h2 className={sectionTitle()}>Members</h2>
          <p className={sectionSubtitle()}>Manage users and invitations.</p>
        </header>
        <div className={emptyPanel()}>
          <span className="text-fg/60 text-sm">Only administrators can view members.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <header className="flex flex-col gap-1">
        <h2 className={sectionTitle()}>Members</h2>
        <p className={sectionSubtitle()}>Users that share this Synthseek instance.</p>
      </header>

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
            <li key={user.id} className="bg-bg-soft/40 ring-fg/10 flex items-center gap-3 rounded-lg p-3 ring-1">
              <div className="bg-fg/10 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full">
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
                {user.role === Role.enum.admin && <ShieldCheck className="h-3 w-3" />}
                {user.role}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
