"use client";

import { useCallback, useMemo, useState } from "react";

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
import { BulkEditBar } from "./components/BulkEditBar";
import { CreateLocalUserDialog } from "./components/CreateLocalUserDialog";
import { EditUserDialog } from "./components/EditUserDialog";
import { ImportPlexUsersDialog } from "./components/ImportPlexUsersDialog";
import { MembersToolbar } from "./components/MembersToolbar";
import { buildMemberColumns } from "./columns";
import { sortMembers } from "./helpers";
import { useMemberSelection } from "./hooks/useMemberSelection";
import { useMemberSort } from "./hooks/useMemberSort";
import { BULK_COPY, DELETE_USER_COPY, MEMBERS_COPY } from "./constants";
import type { MemberListItem, RoleValue } from "./types";

export function MembersSection() {
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
        title: DELETE_USER_COPY.title,
        message: `Delete ${member.username}? ${DELETE_USER_COPY.message}`,
        variant: "danger",
        confirmText: DELETE_USER_COPY.confirm,
      });
      if (confirmed) deleteUser.mutate({ id: member.id });
    },
    [deleteUser]
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
      title: BULK_COPY.deleteTitle,
      message: BULK_COPY.deleteMessage,
      variant: "danger",
      confirmText: DELETE_USER_COPY.confirm,
    });
    if (confirmed) bulkDelete.mutate({ ids: selectedIds }, { onSuccess: clear });
  }, [bulkDelete, clear, selectedIds]);

  const columns = useMemo(
    () =>
      buildMemberColumns({
        currentUserId: currentUser?.id,
        selectedIds: selected,
        allSelected,
        someSelected,
        onToggle: toggle,
        onToggleAll: toggleAll,
        onEdit: setEditMember,
        onDelete: handleDelete,
      }),
    [currentUser?.id, selected, allSelected, someSelected, toggle, toggleAll, handleDelete]
  );

  if (!isAdmin) {
    return (
      <div className={contentRoot()}>
        <SettingsPageHeader title={MEMBERS_COPY.pageTitle} />
        <SettingsCard title={MEMBERS_COPY.cardTitle}>
          <div className={emptyPanel()}>
            <span className="text-fg/60 text-sm">{MEMBERS_COPY.adminOnly}</span>
          </div>
        </SettingsCard>
      </div>
    );
  }

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={MEMBERS_COPY.pageTitle} />
      <SettingsCard
        title={MEMBERS_COPY.cardTitle}
        description={MEMBERS_COPY.cardDescription}
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
            <span className="text-fg/60 text-sm">{MEMBERS_COPY.loading}</span>
          </div>
        ) : usersQuery.error ? (
          <div className={emptyPanel()}>
            <span className="text-sm text-red-400">Failed to load members: {usersQuery.error.message}</span>
          </div>
        ) : rows.length === 0 ? (
          <div className={emptyPanel()}>
            <span className="text-fg/60 text-sm">{MEMBERS_COPY.empty}</span>
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
