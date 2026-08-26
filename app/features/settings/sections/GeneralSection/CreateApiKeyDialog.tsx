"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCopiedFlag } from "@hooks/ui/useCopiedFlag";
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
import { useCreateApiKey } from "@hooks/api/mutations/api-keys/useCreateApiKey";

import { SettingsField } from "../../components/SettingsField";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { tokenBox } from "./styles";
import type { CreateApiKeyDialogProps, CreatedApiKey } from "./types";

export function CreateApiKeyDialog({ open, onOpenChange }: CreateApiKeyDialogProps) {
  const { t } = useTranslation("settings");
  const [name, setName] = useState("");
  const [created, setCreated] = useState<CreatedApiKey | null>(null);
  const { copied, markCopied, resetCopied } = useCopiedFlag();
  const create = useCreateApiKey();

  const canCreate = name.trim().length > 0 && !create.isPending;

  const handleClose = () => {
    setName("");
    setCreated(null);
    resetCopied();
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
      await navigator.clipboard.writeText(created.token);
      markCopied();
      toast.success(t("api.create.copied"));
    } catch {
      toast.error(t("api.create.copyFailed"));
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
              <DialogTitle>{t("api.create.revealTitle")}</DialogTitle>
            </DialogHeader>

            <Notice variant="warning" title={t("api.create.revealWarning")} />

            <code className={tokenBox()}>{created.token}</code>

            <DialogFooter className="gap-2">
              <Button variant="accent" size="sm" onClick={handleCopy}>
                {copied ? <Check /> : <Copy />}
                {copied ? t("api.create.copied") : t("api.create.copy")}
              </Button>
              <Button size="sm" onClick={handleClose}>
                {t("api.create.done")}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle>{t("api.create.title")}</DialogTitle>
              <DialogDescription>{t("api.create.description")}</DialogDescription>
            </DialogHeader>

            <SettingsField label={t("api.create.nameLabel")}>
              <SettingsTextInput
                value={name}
                onChange={setName}
                placeholder={t("api.create.namePlaceholder")}
                ariaLabel={t("api.create.nameAriaLabel")}
              />
            </SettingsField>

            <DialogFooter>
              <Button type="submit" size="sm" disabled={!canCreate}>
                {t("api.create.create")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
