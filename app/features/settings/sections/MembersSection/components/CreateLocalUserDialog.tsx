"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/Dialog";
import { Role } from "@api/__generated__/types";
import { useCreateLocalUser } from "@hooks/api/mutations/users/useCreateLocalUser";
import { ACCOUNT_FIELD_RULES, isValidPassword, isValidUsername } from "@utils/account";

import { SettingsField } from "../../../components/SettingsField";
import { SettingsTextInput } from "../../../components/SettingsTextInput";
import { SettingsSecretInput } from "../../../components/SettingsSecretInput";
import { SegmentedControl } from "../../../components/SegmentedControl";
import { buildRoleOptions } from "../helpers";
import type { CreateLocalUserDialogProps, RoleValue } from "../types";

export function CreateLocalUserDialog({ open, onOpenChange }: CreateLocalUserDialogProps) {
  const { t } = useTranslation("settings");
  const roleOptions = buildRoleOptions(t);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleValue>(Role.enum.member);
  const create = useCreateLocalUser();

  const canSubmit =
    email.trim().length > 0 && isValidUsername(username) && isValidPassword(password) && !create.isPending;

  const handleClose = () => {
    setEmail("");
    setUsername("");
    setPassword("");
    setRole(Role.enum.member);
    onOpenChange(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    create.mutate({ email: email.trim(), username: username.trim(), password, role }, { onSuccess: handleClose });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{t("members.create.title")}</DialogTitle>
            <DialogDescription>{t("members.create.description")}</DialogDescription>
          </DialogHeader>

          <SettingsField label={t("members.create.emailLabel")}>
            <SettingsTextInput
              type="email"
              value={email}
              onChange={setEmail}
              placeholder={t("members.create.emailPlaceholder")}
              ariaLabel={t("members.create.emailAriaLabel")}
            />
          </SettingsField>

          <SettingsField
            label={t("members.create.usernameLabel")}
            helper={t("accountRules.usernameHint", {
              min: ACCOUNT_FIELD_RULES.usernameMin,
              max: ACCOUNT_FIELD_RULES.usernameMax,
            })}
          >
            <SettingsTextInput
              value={username}
              onChange={setUsername}
              placeholder={t("members.create.usernamePlaceholder")}
              ariaLabel={t("members.create.usernameAriaLabel")}
            />
          </SettingsField>

          <SettingsField
            label={t("members.create.passwordLabel")}
            helper={t("accountRules.passwordHint", { min: ACCOUNT_FIELD_RULES.passwordMin })}
          >
            <SettingsSecretInput
              value={password}
              onChange={setPassword}
              ariaLabel={t("members.create.passwordAriaLabel")}
            />
          </SettingsField>

          <SettingsField label={t("members.create.roleLabel")}>
            <SegmentedControl<RoleValue>
              value={role}
              options={roleOptions}
              onChange={setRole}
              ariaLabel={t("members.create.roleAriaLabel")}
            />
          </SettingsField>

          <DialogFooter>
            <Button type="submit" size="sm" disabled={!canSubmit}>
              {t("members.create.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
