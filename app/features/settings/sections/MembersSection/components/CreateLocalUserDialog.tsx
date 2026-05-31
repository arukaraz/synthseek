"use client";

import { useState } from "react";

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

import { SettingsField } from "../../../components/SettingsField";
import { SettingsTextInput } from "../../../components/SettingsTextInput";
import { SettingsSecretInput } from "../../../components/SettingsSecretInput";
import { SegmentedControl } from "../../../components/SegmentedControl";
import { CREATE_USER_COPY, ROLE_OPTIONS } from "../constants";
import type { CreateLocalUserDialogProps, RoleValue } from "../types";

export function CreateLocalUserDialog({ open, onOpenChange }: CreateLocalUserDialogProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleValue>(Role.enum.member);
  const create = useCreateLocalUser();

  const canSubmit = email.trim().length > 0 && username.trim().length >= 3 && password.length >= 8 && !create.isPending;

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
            <DialogTitle>{CREATE_USER_COPY.title}</DialogTitle>
            <DialogDescription>{CREATE_USER_COPY.description}</DialogDescription>
          </DialogHeader>

          <SettingsField label={CREATE_USER_COPY.emailLabel}>
            <SettingsTextInput
              type="email"
              value={email}
              onChange={setEmail}
              placeholder={CREATE_USER_COPY.emailPlaceholder}
              ariaLabel="User email"
            />
          </SettingsField>

          <SettingsField label={CREATE_USER_COPY.usernameLabel}>
            <SettingsTextInput
              value={username}
              onChange={setUsername}
              placeholder={CREATE_USER_COPY.usernamePlaceholder}
              ariaLabel="Username"
            />
          </SettingsField>

          <SettingsField label={CREATE_USER_COPY.passwordLabel}>
            <SettingsSecretInput
              value={password}
              onChange={setPassword}
              placeholder={CREATE_USER_COPY.passwordPlaceholder}
              ariaLabel="Password"
            />
          </SettingsField>

          <SettingsField label={CREATE_USER_COPY.roleLabel}>
            <SegmentedControl<RoleValue> value={role} options={ROLE_OPTIONS} onChange={setRole} ariaLabel="User role" />
          </SettingsField>

          <DialogFooter>
            <Button type="submit" size="sm" disabled={!canSubmit}>
              {CREATE_USER_COPY.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
