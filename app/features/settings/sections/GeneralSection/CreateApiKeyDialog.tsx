"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
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
import { CREATE_KEY_DIALOG } from "./constants";
import { tokenBox } from "./styles";
import type { CreateApiKeyDialogProps, CreatedApiKey } from "./types";

export function CreateApiKeyDialog({ open, onOpenChange }: CreateApiKeyDialogProps) {
  const [name, setName] = useState("");
  const [created, setCreated] = useState<CreatedApiKey | null>(null);
  const [copied, setCopied] = useState(false);
  const create = useCreateApiKey();

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
      await navigator.clipboard.writeText(created.token);
      setCopied(true);
      toast.success(CREATE_KEY_DIALOG.copied);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy key");
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
              <DialogTitle>{CREATE_KEY_DIALOG.revealTitle}</DialogTitle>
            </DialogHeader>

            <Notice variant="warning" title={CREATE_KEY_DIALOG.revealWarning} />

            <code className={tokenBox()}>{created.token}</code>

            <DialogFooter className="gap-2">
              <Button variant="accent" size="sm" onClick={handleCopy}>
                {copied ? <Check /> : <Copy />}
                {copied ? CREATE_KEY_DIALOG.copied : CREATE_KEY_DIALOG.copy}
              </Button>
              <Button size="sm" onClick={handleClose}>
                {CREATE_KEY_DIALOG.done}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle>{CREATE_KEY_DIALOG.title}</DialogTitle>
              <DialogDescription>{CREATE_KEY_DIALOG.description}</DialogDescription>
            </DialogHeader>

            <SettingsField label="Name">
              <SettingsTextInput
                value={name}
                onChange={setName}
                placeholder={CREATE_KEY_DIALOG.namePlaceholder}
                ariaLabel="API key name"
              />
            </SettingsField>

            <DialogFooter>
              <Button type="submit" size="sm" disabled={!canCreate}>
                {CREATE_KEY_DIALOG.create}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
