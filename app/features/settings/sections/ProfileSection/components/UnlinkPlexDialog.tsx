"use client";

import { useEffect, useState } from "react";
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
import { useUnlinkPlexWithPassword } from "@hooks/api/mutations/auth/usePlexUnlink";
import { ACCOUNT_FIELD_RULES, isValidPassword } from "@utils/account";

import { TYPED_SECRET } from "../../../components/constants";
import { SettingsField } from "../../../components/SettingsField";
import { SettingsSecretInput } from "../../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../../components/SettingsTextInput";
import type { UnlinkPlexDialogProps } from "../types";

export function UnlinkPlexDialog({ email: currentEmail, open, onOpenChange }: UnlinkPlexDialogProps) {
  const { t } = useTranslation("settings");
  const unlink = useUnlinkPlexWithPassword();
  const [email, setEmail] = useState(currentEmail);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!open) return;
    setEmail(currentEmail);
    setPassword("");
  }, [open, currentEmail]);

  const canSubmit = email.trim().length > 0 && isValidPassword(password) && !unlink.isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    unlink.mutate({ email: email.trim(), password }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{t("profile.connected.plex.unlinkDialog.title")}</DialogTitle>
            <DialogDescription>{t("profile.connected.plex.unlinkDialog.description")}</DialogDescription>
          </DialogHeader>

          <SettingsField
            label={t("profile.connected.plex.unlinkDialog.emailLabel")}
            helper={t("profile.connected.plex.unlinkDialog.emailHint")}
          >
            <SettingsTextInput
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              ariaLabel={t("profile.connected.plex.unlinkDialog.emailLabel")}
            />
          </SettingsField>

          <SettingsField
            label={t("profile.connected.plex.unlinkDialog.passwordLabel")}
            helper={t("accountRules.passwordHint", { min: ACCOUNT_FIELD_RULES.passwordMin })}
          >
            <SettingsSecretInput
              value={password}
              onChange={setPassword}
              source={TYPED_SECRET}
              autoComplete="new-password"
              ariaLabel={t("profile.connected.plex.unlinkDialog.passwordLabel")}
            />
          </SettingsField>

          <DialogFooter>
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              {t("profile.connected.plex.unlinkDialog.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={!canSubmit}>
              {unlink.isPending
                ? t("profile.connected.plex.unlinkDialog.submitting")
                : t("profile.connected.plex.unlinkDialog.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
