"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Role } from "@api/__generated__/types";
import { Button } from "@components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/Dialog";
import { Notice } from "@components/ui/Notice";
import { useUpdateUser } from "@hooks/api/mutations/users/useUpdateUser";
import { ACCOUNT_FIELD_RULES, isValidPassword, isValidUsername } from "@utils/account";

import { SettingsField } from "../../../components/SettingsField";
import { SettingsTextInput } from "../../../components/SettingsTextInput";
import { SettingsSecretInput } from "../../../components/SettingsSecretInput";
import { SegmentedControl } from "../../../components/SegmentedControl";

import { buildRoleOptions, isValidQuotaInput, parseQuotaInput, quotaInputOf } from "../helpers";
import type { EditUserDialogProps, RoleValue } from "../types";

export function EditUserDialog({ member, open, onOpenChange }: EditUserDialogProps) {
  const { t } = useTranslation("settings");
  const roleOptions = buildRoleOptions(t);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleValue>("member");
  const [password, setPassword] = useState("");
  const [quotaTracks, setQuotaTracks] = useState("");
  const [quotaStorage, setQuotaStorage] = useState("");
  const update = useUpdateUser();

  useEffect(() => {
    if (!member) return;
    setUsername(member.username);
    setEmail(member.email);
    setRole(member.role);
    setPassword("");
    setQuotaTracks(quotaInputOf(member.quotaTracks));
    setQuotaStorage(quotaInputOf(member.quotaStorageGb));
  }, [member]);

  if (!member) return null;

  const limitsMember = role === Role.enum.member;
  const quotasValid = !limitsMember || (isValidQuotaInput(quotaTracks, true) && isValidQuotaInput(quotaStorage, false));
  const passwordValid = password.length === 0 || isValidPassword(password);
  const canSubmit =
    isValidUsername(username) && email.trim().length > 0 && passwordValid && quotasValid && !update.isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    const nextTracks = parseQuotaInput(quotaTracks);
    const nextStorage = parseQuotaInput(quotaStorage);
    update.mutate(
      {
        id: member.id,
        username: username.trim() === member.username ? undefined : username.trim(),
        email: email.trim() === member.email ? undefined : email.trim(),
        role: role === member.role ? undefined : role,
        password: password.length > 0 ? password : undefined,
        quotaTracks: limitsMember && nextTracks !== member.quotaTracks ? nextTracks : undefined,
        quotaStorageGb: limitsMember && nextStorage !== member.quotaStorageGb ? nextStorage : undefined,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{t("members.edit.title")}</DialogTitle>
            <DialogDescription>{t("members.edit.description")}</DialogDescription>
          </DialogHeader>

          <SettingsField
            label={t("members.edit.usernameLabel")}
            helper={t("accountRules.usernameHint", {
              min: ACCOUNT_FIELD_RULES.usernameMin,
              max: ACCOUNT_FIELD_RULES.usernameMax,
            })}
          >
            <SettingsTextInput
              value={username}
              onChange={setUsername}
              ariaLabel={t("members.edit.usernameAriaLabel")}
            />
          </SettingsField>

          <SettingsField label={t("members.edit.emailLabel")}>
            <SettingsTextInput
              type="email"
              value={email}
              onChange={setEmail}
              ariaLabel={t("members.edit.emailAriaLabel")}
            />
          </SettingsField>

          <SettingsField label={t("members.edit.roleLabel")}>
            <SegmentedControl<RoleValue>
              value={role}
              options={roleOptions}
              onChange={setRole}
              disabled={member.isOwner}
              ariaLabel={t("members.edit.roleAriaLabel")}
            />
          </SettingsField>

          {member.isOwner ? <Notice variant="info" title={t("members.edit.ownerRoleNote")} /> : null}
          {!member.isOwner && role === "trusted" ? (
            <Notice variant="info" title={t("members.roleDescriptions.trusted")} />
          ) : null}

          {limitsMember ? (
            <SettingsField label={t("members.edit.quotaTracksLabel")} helper={t("members.edit.quotaNote")}>
              <SettingsTextInput
                value={quotaTracks}
                onChange={setQuotaTracks}
                placeholder={t("members.edit.quotaPlaceholder")}
                ariaLabel={t("members.edit.quotaTracksAriaLabel")}
              />
            </SettingsField>
          ) : null}

          {limitsMember ? (
            <SettingsField label={t("members.edit.quotaStorageLabel")}>
              <SettingsTextInput
                value={quotaStorage}
                onChange={setQuotaStorage}
                placeholder={t("members.edit.quotaPlaceholder")}
                ariaLabel={t("members.edit.quotaStorageAriaLabel")}
              />
            </SettingsField>
          ) : null}

          <SettingsField
            label={t("members.edit.passwordLabel")}
            helper={t("accountRules.passwordHint", { min: ACCOUNT_FIELD_RULES.passwordMin })}
          >
            <SettingsSecretInput
              value={password}
              onChange={setPassword}
              placeholder={t("members.edit.passwordPlaceholder")}
              ariaLabel={t("members.edit.passwordAriaLabel")}
            />
          </SettingsField>

          <DialogFooter>
            <Button type="submit" size="sm" disabled={!canSubmit}>
              {t("members.edit.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
