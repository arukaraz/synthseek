"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { InlineError } from "@components/ui/InlineError";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/Dialog";
import { useLinkJellyfin } from "@hooks/api/mutations/auth/useSignInIdentityMutations";

import { TYPED_SECRET } from "../../../components/constants";
import { SettingsField } from "../../../components/SettingsField";
import { SettingsSecretInput } from "../../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../../components/SettingsTextInput";
import type { LinkJellyfinDialogProps } from "../types";

export function LinkJellyfinDialog({ open, onOpenChange }: LinkJellyfinDialogProps) {
  const { t } = useTranslation("settings");
  const link = useLinkJellyfin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!open) return;
    setUsername("");
    setPassword("");
  }, [open]);

  const canSubmit = username.trim().length > 0 && password.length > 0 && !link.isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    link.mutate({ username: username.trim(), password }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{t("profile.waysIn.jellyfin.title")}</DialogTitle>
            <DialogDescription>{t("profile.waysIn.jellyfin.description")}</DialogDescription>
          </DialogHeader>

          <SettingsField label={t("profile.waysIn.jellyfin.usernameLabel")}>
            <SettingsTextInput
              value={username}
              onChange={setUsername}
              autoComplete="username"
              ariaLabel={t("profile.waysIn.jellyfin.usernameLabel")}
            />
          </SettingsField>

          <SettingsField label={t("profile.waysIn.jellyfin.passwordLabel")}>
            <SettingsSecretInput
              value={password}
              onChange={setPassword}
              source={TYPED_SECRET}
              autoComplete="current-password"
              ariaLabel={t("profile.waysIn.jellyfin.passwordLabel")}
            />
          </SettingsField>

          <InlineError error={link.error} />
          <DialogFooter>
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              {t("profile.waysIn.jellyfin.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={!canSubmit}>
              {link.isPending ? t("profile.waysIn.jellyfin.submitting") : t("profile.waysIn.jellyfin.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
