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
import { offeredSources, summarizePreset } from "@features/search/components/ConfigRequestModal/helpers";
import {
  useDownloadSourcesAvailability,
  useMemberRequestPreset,
  useMyRequestPreset,
  useSetMemberRequestPreset,
} from "@hooks/api";

import {
  presetDraft,
  presetFromDraft,
  RequestPresetEditor,
  type RequestPresetDraft,
} from "../../../components/RequestPreset";
import { memberPresetDialog, memberPresetLoading } from "../styles";
import type { MemberRequestPresetDialogProps } from "../types";

export function MemberRequestPresetDialog({ member, onClose }: MemberRequestPresetDialogProps) {
  const { t } = useTranslation("settings");
  const { t: tSearch } = useTranslation("search");
  const memberPreset = useMemberRequestPreset(member?.id ?? null);
  const mine = useMyRequestPreset();
  const { data: availability, isPending: isLoadingSources } = useDownloadSourcesAvailability();
  const save = useSetMemberRequestPreset();
  const [draft, setDraft] = useState<RequestPresetDraft | null>(null);

  const own = memberPreset.data;
  const server = mine.data?.server ?? null;
  const factory = mine.data?.factory;

  useEffect(() => {
    if (member === null) setDraft(null);
  }, [member]);

  useEffect(() => {
    if (draft !== null || own === undefined || factory === undefined || isLoadingSources) return;
    setDraft(presetDraft(own, server ?? factory, offeredSources(availability, true)));
  }, [draft, own, server, factory, availability, isLoadingSources]);

  const unavailable = memberPreset.isError || mine.isError;

  if (!member) return null;

  const handleSave = () => {
    if (draft === null) return;
    save.mutate({ userId: member.id, preset: presetFromDraft(draft) }, { onSuccess: onClose });
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className={memberPresetDialog()}>
        <DialogHeader>
          <DialogTitle>{t("requestPreset.member.title", { username: member.username })}</DialogTitle>
          <DialogDescription>{t("requestPreset.member.description")}</DialogDescription>
        </DialogHeader>
        {draft !== null && factory !== undefined ? (
          <RequestPresetEditor
            value={draft}
            onChange={setDraft}
            followLabel={t("requestPreset.member.followLabel")}
            customLabel={t("requestPreset.member.customLabel")}
            followSummary={
              server
                ? t("requestPreset.member.followServer", { summary: summarizePreset(server, tSearch) })
                : t("requestPreset.member.followDefault", { summary: summarizePreset(factory, tSearch) })
            }
          />
        ) : (
          <p className={memberPresetLoading()} data-cy="member-preset-status">
            {unavailable ? t("requestPreset.member.unavailable") : t("header.loading")}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={save.isPending}>
            {t("requestPreset.member.cancel")}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={draft === null || save.isPending}>
            {t("requestPreset.member.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
