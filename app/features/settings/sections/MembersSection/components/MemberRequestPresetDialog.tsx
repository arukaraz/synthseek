"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { InfoTooltip } from "@components/ui/InfoTooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/Dialog";
import {
  offeredSources,
  selectionFromPreset,
  summarizePreset,
} from "@features/search/components/ConfigRequestModal/helpers";
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
import { memberPresetDescription, memberPresetDialog, memberPresetLoading, memberPresetTitleRow } from "../styles";
import { MemberPresetFollowSummary } from "./MemberPresetFollowSummary";
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
  const offered = useMemo(() => offeredSources(availability, true), [availability]);
  const followed = server ?? factory;
  const base = useMemo(
    () => (followed === undefined ? null : selectionFromPreset(followed, offered)),
    [followed, offered]
  );

  useEffect(() => {
    if (member === null) setDraft(null);
  }, [member]);

  useEffect(() => {
    if (draft !== null || own === undefined || factory === undefined || isLoadingSources) return;
    setDraft(presetDraft(own, server ?? factory, offered));
  }, [draft, own, server, factory, offered, isLoadingSources]);

  const titleRowRef = useRef<HTMLDivElement>(null);
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
      <DialogContent
        className={memberPresetDialog()}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          titleRowRef.current?.focus();
        }}
      >
        <DialogHeader>
          <div ref={titleRowRef} tabIndex={-1} className={memberPresetTitleRow()}>
            <DialogTitle>{t("requestPreset.member.title", { username: member.username })}</DialogTitle>
            <InfoTooltip description={t("requestPreset.member.description")} side="bottom" align="start" />
          </div>
          <DialogDescription className={memberPresetDescription()}>
            {t("requestPreset.member.description")}
          </DialogDescription>
        </DialogHeader>
        {draft !== null && factory !== undefined && base !== null ? (
          <RequestPresetEditor
            value={draft}
            onChange={setDraft}
            base={base}
            offered={offered}
            followLabel={t("requestPreset.member.followLabel")}
            customLabel={t("requestPreset.member.customLabel")}
            followSummary={
              <MemberPresetFollowSummary
                summary={summarizePreset(server ?? factory, tSearch)}
                hasServerPreset={server !== null}
              />
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
