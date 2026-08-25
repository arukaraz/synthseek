"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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
import { useCreateSubsonicCredential } from "@hooks/api/mutations/subsonic/useCreateSubsonicCredential";

import { SettingsField } from "../../components/SettingsField";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { tokenBox } from "./styles";
import type { CreatedSubsonicCredential, CreateSubsonicCredentialDialogProps } from "./types";

export function CreateSubsonicCredentialDialog({ open, onOpenChange }: CreateSubsonicCredentialDialogProps) {
  const { t } = useTranslation("settings");
  const [name, setName] = useState("");
  const [created, setCreated] = useState<CreatedSubsonicCredential | null>(null);
  const [copied, setCopied] = useState(false);
  const create = useCreateSubsonicCredential();

  const canCreate = name.trim().length > 0 && !create.isPending;

  const handleClose = () => {
    setName("");
    setCreated(null);
    setCopied(false);
    onOpenChange(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canCreate) return;
    create.mutate({ name: name.trim() }, { onSuccess: (result) => setCreated(result) });
  };

  const handleCopy = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.secret);
      setCopied(true);
      toast.success(t("subsonic.create.copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("subsonic.create.copyFailed"));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        {created ? (
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>{t("subsonic.create.revealTitle")}</DialogTitle>
              <DialogDescription>{t("subsonic.create.revealDescription")}</DialogDescription>
            </DialogHeader>

            <Notice variant="warning" title={t("subsonic.create.revealWarning")} />

            <code className={tokenBox()}>{created.secret}</code>

            <DialogFooter className="gap-2">
              <Button variant="accent" size="sm" onClick={handleCopy}>
                {copied ? <Check /> : <Copy />}
                {copied ? t("subsonic.create.copied") : t("subsonic.create.copy")}
              </Button>
              <Button size="sm" onClick={handleClose}>
                {t("subsonic.create.done")}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle>{t("subsonic.create.title")}</DialogTitle>
              <DialogDescription>{t("subsonic.create.description")}</DialogDescription>
            </DialogHeader>

            <SettingsField label={t("subsonic.create.nameLabel")}>
              <SettingsTextInput
                value={name}
                onChange={setName}
                placeholder={t("subsonic.create.namePlaceholder")}
                ariaLabel={t("subsonic.create.nameAriaLabel")}
              />
            </SettingsField>

            <DialogFooter>
              <Button type="submit" size="sm" disabled={!canCreate}>
                {t("subsonic.create.create")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
