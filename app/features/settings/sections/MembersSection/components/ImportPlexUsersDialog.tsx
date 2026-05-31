"use client";

import { User as UserIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@components/ui/Button";
import { Checkbox } from "@components/ui/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/Dialog";
import { Notice } from "@components/ui/Notice";
import { Role } from "@api/__generated__/types";
import { usePlexImportableUsers } from "@hooks/api/queries/usePlexImportableUsers";
import { useImportPlexUsers } from "@hooks/api/mutations/users/useImportPlexUsers";

import { SettingsField } from "../../../components/SettingsField";
import { SegmentedControl } from "../../../components/SegmentedControl";
import { IMPORT_PLEX_COPY, ROLE_OPTIONS } from "../constants";
import { importEmpty, importList, importRow, pill, userAvatar, userEmail, userName } from "../styles";
import type { ImportPlexUsersDialogProps, RoleValue } from "../types";

export function ImportPlexUsersDialog({ open, onOpenChange }: ImportPlexUsersDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [role, setRole] = useState<RoleValue>(Role.enum.member);
  const importable = usePlexImportableUsers({ enabled: open });
  const importUsers = useImportPlexUsers();

  const users = importable.data ?? [];
  const selectableIds = users.filter((u) => !u.alreadyImported).map((u) => u.plexId);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  const toggle = (plexId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(plexId)) next.delete(plexId);
      else next.add(plexId);
      return next;
    });
  };

  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(selectableIds));

  const handleClose = () => {
    setSelected(new Set());
    setRole(Role.enum.member);
    onOpenChange(false);
  };

  const handleImport = () => {
    if (selected.size === 0) return;
    importUsers.mutate({ plexUserIds: [...selected], role }, { onSuccess: handleClose });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <div className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{IMPORT_PLEX_COPY.title}</DialogTitle>
            <DialogDescription>{IMPORT_PLEX_COPY.description}</DialogDescription>
          </DialogHeader>

          {importable.isLoading ? (
            <div className={importEmpty()}>{IMPORT_PLEX_COPY.loading}</div>
          ) : importable.error ? (
            <Notice variant="warning" title={importable.error.message} />
          ) : users.length === 0 ? (
            <div className={importEmpty()}>{IMPORT_PLEX_COPY.empty}</div>
          ) : (
            <>
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  disabled={selectableIds.length === 0}
                  aria-label={IMPORT_PLEX_COPY.selectAll}
                />
                <span className="text-fg/70 text-sm">{IMPORT_PLEX_COPY.selectAll}</span>
              </label>

              <div className={importList()}>
                {users.map((user) => (
                  <div
                    key={user.plexId}
                    className={importRow({ disabled: user.alreadyImported })}
                    onClick={() => !user.alreadyImported && toggle(user.plexId)}
                  >
                    <Checkbox
                      checked={selected.has(user.plexId)}
                      disabled={user.alreadyImported}
                      onCheckedChange={() => toggle(user.plexId)}
                      aria-label={`Select ${user.username}`}
                    />
                    <div className={userAvatar()}>
                      {user.thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.thumb} alt={user.username} className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon className="text-fg/60 h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={userName()}>{user.title || user.username}</p>
                      <p className={userEmail()}>{user.email}</p>
                    </div>
                    {user.alreadyImported ? (
                      <span className={pill({ tone: "local" })}>{IMPORT_PLEX_COPY.imported}</span>
                    ) : null}
                  </div>
                ))}
              </div>

              <SettingsField label={IMPORT_PLEX_COPY.roleLabel}>
                <SegmentedControl<RoleValue>
                  value={role}
                  options={ROLE_OPTIONS}
                  onChange={setRole}
                  ariaLabel="Role for imported users"
                />
              </SettingsField>
            </>
          )}

          <DialogFooter>
            <Button size="sm" onClick={handleImport} disabled={selected.size === 0 || importUsers.isPending}>
              {IMPORT_PLEX_COPY.submit}
              {selected.size > 0 ? ` (${selected.size})` : ""}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
