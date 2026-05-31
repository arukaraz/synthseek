"use client";

import { useEffect, useState } from "react";

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

import { SettingsField } from "../../../components/SettingsField";
import { SettingsTextInput } from "../../../components/SettingsTextInput";
import { SettingsSecretInput } from "../../../components/SettingsSecretInput";
import { SegmentedControl } from "../../../components/SegmentedControl";
import { EDIT_USER_COPY, ROLE_OPTIONS } from "../constants";
import type { EditUserDialogProps, RoleValue } from "../types";

export function EditUserDialog({ member, open, onOpenChange }: EditUserDialogProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleValue>("member");
  const [password, setPassword] = useState("");
  const update = useUpdateUser();

  useEffect(() => {
    if (!member) return;
    setUsername(member.username);
    setEmail(member.email);
    setRole(member.role);
    setPassword("");
  }, [member]);

  if (!member) return null;

  const canSubmit = username.trim().length >= 3 && email.trim().length > 0 && !update.isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    update.mutate(
      {
        id: member.id,
        username: username.trim() === member.username ? undefined : username.trim(),
        email: email.trim() === member.email ? undefined : email.trim(),
        role: role === member.role ? undefined : role,
        password: password.length > 0 ? password : undefined,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{EDIT_USER_COPY.title}</DialogTitle>
            <DialogDescription>{EDIT_USER_COPY.description}</DialogDescription>
          </DialogHeader>

          <SettingsField label="Username">
            <SettingsTextInput value={username} onChange={setUsername} ariaLabel="Username" />
          </SettingsField>

          <SettingsField label="Email">
            <SettingsTextInput type="email" value={email} onChange={setEmail} ariaLabel="User email" />
          </SettingsField>

          <SettingsField label="Role">
            <SegmentedControl<RoleValue>
              value={role}
              options={ROLE_OPTIONS}
              onChange={setRole}
              disabled={member.isOwner}
              ariaLabel="User role"
            />
          </SettingsField>

          {member.isOwner ? <Notice variant="info" title={EDIT_USER_COPY.ownerRoleNote} /> : null}

          <SettingsField label="Password">
            <SettingsSecretInput
              value={password}
              onChange={setPassword}
              placeholder={EDIT_USER_COPY.passwordPlaceholder}
              ariaLabel="New password"
            />
          </SettingsField>

          <DialogFooter>
            <Button type="submit" size="sm" disabled={!canSubmit}>
              {EDIT_USER_COPY.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
