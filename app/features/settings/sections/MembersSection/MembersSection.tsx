"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { DataTable } from "@components/ui/Table";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { confirm } from "@utils/confirm";
import { useUsers } from "@hooks/api/queries/useUsers";
import { useDeleteUser } from "@hooks/api/mutations/users/useDeleteUser";
import { useBulkUpdateRole } from "@hooks/api/mutations/users/useBulkUpdateRole";
import { useBulkDeleteUsers } from "@hooks/api/mutations/users/useBulkDeleteUsers";

import { SettingsCard } from "../../components/SettingsCard";
import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { contentRoot, emptyPanel } from "../../styles";
import { ApprovalCard } from "./components/ApprovalCard";
import { BulkEditBar } from "./components/BulkEditBar";
import { CreateLocalUserDialog } from "./components/CreateLocalUserDialog";
import { EditUserDialog } from "./components/EditUserDialog";
import { ImportPlexUsersDialog } from "./components/ImportPlexUsersDialog";
import { MembersToolbar } from "./components/MembersToolbar";
import { buildMemberColumns } from "./columns";
import { sortMembers } from "./helpers";
import { useMemberSelection } from "./hooks/useMemberSelection";
import { useMemberSort } from "./hooks/useMemberSort";
import type { MemberListItem, RoleValue } from "./types";

export function MembersSection() {
  const { t } = useTranslation("settings");
  const { isAdmin, currentUser } = useAuthContext();
  const usersQuery = useUsers({ enabled: isAdmin });
  const { selected, toggle, selectAll, clear } = useMemberSelection();
  const { sort, onSort } = useMemberSort({ field: "user", direction: "asc" });

  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editMember, setEditMember] = useState<MemberListItem | null>(null);

  const deleteUser = useDeleteUser();
  const bulkRole = useBulkUpdateRole();
  const bulkDelete = useBulkDeleteUsers();

  const rows = useMemo(() => sortMembers(usersQuery.data ?? [], sort), [usersQuery.data, sort]);
  const ids = useMemo(() => rows.map((row) => row.id), [rows]);
  const selectedIds = useMemo(() => ids.filter((id) => selected.has(id)), [ids, selected]);
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));
  const someSelected = selectedIds.length > 0 && !allSelected;
  const bulkPending = bulkRole.isPending || bulkDelete.isPending;

  const toggleAll = useCallback(() => {
    if (allSelected) clear();
    else selectAll(ids);
  }, [allSelected, clear, selectAll, ids]);

  const handleDelete = useCallback(
    async (member: MemberListItem) => {
      const confirmed = await confirm({
        title: t("members.delete.title"),
        message: t("members.delete.message", { username: member.username }),
        variant: "danger",
        confirmText: t("members.delete.confirm"),
      });
      if (confirmed) deleteUser.mutate({ id: member.id });
    },
    [deleteUser, t]
  );

  const handleBulkRole = useCallback(
    (role: RoleValue) => {
      if (selectedIds.length === 0) return;
      bulkRole.mutate({ ids: selectedIds, role }, { onSuccess: clear });
    },
    [bulkRole, clear, selectedIds]
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    const confirmed = await confirm({
      title: t("members.bulk.deleteTitle"),
      message: t("members.bulk.deleteMessage"),
      variant: "danger",
      confirmText: t("members.delete.confirm"),
    });
    if (confirmed) bulkDelete.mutate({ ids: selectedIds }, { onSuccess: clear });
  }, [bulkDelete, clear, selectedIds, t]);

  const columns = useMemo(
    () =>
      buildMemberColumns({
        t,
        currentUserId: currentUser?.id,
        selectedIds: selected,
        allSelected,
        someSelected,
        onToggle: toggle,
        onToggleAll: toggleAll,
        onEdit: setEditMember,
        onDelete: handleDelete,
      }),
    [t, currentUser?.id, selected, allSelected, someSelected, toggle, toggleAll, handleDelete]
  );

  if (!isAdmin) {
    return (
      <div className={contentRoot()}>
        <SettingsPageHeader title={t("members.pageTitle")} />
        <SettingsCard title={t("members.cardTitle")}>
          <div className={emptyPanel()}>
            <span className="text-fg/60 text-sm">{t("members.adminOnly")}</span>
          </div>
        </SettingsCard>
      </div>
    );
  }

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t("members.pageTitle")} />
      <SettingsCard
        title={t("members.cardTitle")}
        description={t("members.cardDescription")}
        trailing={<MembersToolbar onCreate={() => setCreateOpen(true)} onImport={() => setImportOpen(true)} />}
      >
        {selectedIds.length > 0 ? (
          <BulkEditBar
            count={selectedIds.length}
            isPending={bulkPending}
            onSetRole={handleBulkRole}
            onDelete={handleBulkDelete}
            onClear={clear}
          />
        ) : null}

        {usersQuery.isLoading ? (
          <div className={emptyPanel()}>
            <span className="text-fg/60 text-sm">{t("members.loading")}</span>
          </div>
        ) : usersQuery.error ? (
          <div className={emptyPanel()}>
            <span className="text-sm text-red-400">
              {t("members.loadError", { message: usersQuery.error.message })}
            </span>
          </div>
        ) : rows.length === 0 ? (
          <div className={emptyPanel()}>
            <span className="text-fg/60 text-sm">{t("members.empty")}</span>
          </div>
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            getRowId={(member) => member.id}
            sortState={sort}
            onSort={onSort}
            minWidth="760px"
          />
        )}
      </SettingsCard>

      <ApprovalCard />

      <CreateLocalUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ImportPlexUsersDialog open={importOpen} onOpenChange={setImportOpen} />
      <EditUserDialog
        member={editMember}
        open={editMember !== null}
        onOpenChange={(open) => {
          if (!open) setEditMember(null);
        }}
      />
    </div>
  );
}
