"use client";

import { User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Checkbox } from "@components/ui/Checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/Dialog";
import { Notice } from "@components/ui/Notice";
import { Role } from "@api/__generated__/types";
import { usePlexImportableUsers } from "@hooks/api/queries/usePlexImportableUsers";
import { useImportPlexUsers } from "@hooks/api/mutations/users/useImportPlexUsers";

import { SettingsField } from "../../../components/SettingsField";
import { SegmentedControl } from "../../../components/SegmentedControl";
import { buildRoleOptions } from "../helpers";
import { importEmpty, importList, importRow, pill, userAvatar, userEmail, userName } from "../styles";
import type { ImportPlexUsersDialogProps, RoleValue } from "../types";

export function ImportPlexUsersDialog({ open, onOpenChange }: ImportPlexUsersDialogProps) {
  const { t } = useTranslation("settings");
  const roleOptions = buildRoleOptions(t);
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
            <DialogTitle>{t("members.import.title")}</DialogTitle>
          </DialogHeader>

          {importable.isLoading ? (
            <div className={importEmpty()}>{t("members.import.loading")}</div>
          ) : importable.error ? (
            <Notice variant="warning" title={importable.error.message} />
          ) : users.length === 0 ? (
            <div className={importEmpty()}>{t("members.import.empty")}</div>
          ) : (
            <>
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  disabled={selectableIds.length === 0}
                  aria-label={t("members.import.selectAll")}
                />
                <span className="text-fg/70 text-sm">{t("members.import.selectAll")}</span>
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
                      aria-label={t("members.import.selectUser", { username: user.username })}
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
                      <span className={pill({ tone: "local" })}>{t("members.import.imported")}</span>
                    ) : null}
                  </div>
                ))}
              </div>

              <SettingsField label={t("members.import.roleLabel")}>
                <SegmentedControl<RoleValue>
                  value={role}
                  options={roleOptions}
                  onChange={setRole}
                  ariaLabel={t("members.import.roleAriaLabel")}
                />
              </SettingsField>
            </>
          )}

          <DialogFooter>
            <Button size="sm" onClick={handleImport} disabled={selected.size === 0 || importUsers.isPending}>
              {t("members.import.submit")}
              {selected.size > 0 ? ` (${selected.size})` : ""}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
