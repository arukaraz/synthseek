"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Notice } from "@components/ui/Notice";
import { useChangePassword } from "@hooks/api/mutations/auth/useChangePassword";
import { ACCOUNT_FIELD_RULES, isValidPassword } from "@utils/account";

import { SettingsCard } from "../../../components/SettingsCard";
import { SettingsField } from "../../../components/SettingsField";
import { SettingsSecretInput } from "../../../components/SettingsSecretInput";
import type { ProfileCardProps } from "../types";

export function ChangePasswordCard({ user }: ProfileCardProps) {
  const { t } = useTranslation("settings");
  const isLocal = user.plex_username === null;
  const change = useChangePassword();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");

  const canSubmit = current.length > 0 && isValidPassword(next) && !change.isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    change.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: () => {
          setCurrent("");
          setNext("");
        },
      }
    );
  };

  return (
    <SettingsCard title={t("profile.password.title")}>
      {isLocal ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <SettingsField label={t("profile.password.currentLabel")}>
            <SettingsSecretInput
              value={current}
              onChange={setCurrent}
              ariaLabel={t("profile.password.currentAriaLabel")}
            />
          </SettingsField>
          <SettingsField
            label={t("profile.password.newLabel")}
            helper={t("accountRules.passwordHint", { min: ACCOUNT_FIELD_RULES.passwordMin })}
          >
            <SettingsSecretInput value={next} onChange={setNext} ariaLabel={t("profile.password.newAriaLabel")} />
          </SettingsField>
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={!canSubmit}>
              {t("profile.password.submit")}
            </Button>
          </div>
        </form>
      ) : (
        <Notice variant="info" title={t("profile.password.managedByPlex")} />
      )}
    </SettingsCard>
  );
}
