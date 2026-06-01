"use client";

import { useState } from "react";

import { Button } from "@components/ui/Button";
import { Notice } from "@components/ui/Notice";
import { useChangePassword } from "@hooks/api/mutations/auth/useChangePassword";

import { SettingsCard } from "../../../components/SettingsCard";
import { SettingsField } from "../../../components/SettingsField";
import { SettingsSecretInput } from "../../../components/SettingsSecretInput";
import { PROFILE_COPY } from "../constants";
import type { ProfileCardProps } from "../types";

export function ChangePasswordCard({ user }: ProfileCardProps) {
  const isLocal = user.plex_username === null;
  const change = useChangePassword();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");

  const canSubmit = current.length > 0 && next.length >= 8 && !change.isPending;

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
    <SettingsCard title={PROFILE_COPY.passwordTitle} description={PROFILE_COPY.passwordDescription}>
      {isLocal ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <SettingsField label={PROFILE_COPY.currentPasswordLabel}>
            <SettingsSecretInput value={current} onChange={setCurrent} ariaLabel="Current password" />
          </SettingsField>
          <SettingsField label={PROFILE_COPY.newPasswordLabel}>
            <SettingsSecretInput
              value={next}
              onChange={setNext}
              placeholder={PROFILE_COPY.newPasswordPlaceholder}
              ariaLabel="New password"
            />
          </SettingsField>
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={!canSubmit}>
              {PROFILE_COPY.changePassword}
            </Button>
          </div>
        </form>
      ) : (
        <Notice variant="info" title={PROFILE_COPY.passwordManagedByPlex} />
      )}
    </SettingsCard>
  );
}
