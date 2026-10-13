"use client";

import { useEffect, useState } from "react";

import { Dialog, DialogContent } from "@components/ui/Dialog";

import { MatchAlbumPanel } from "./components/MatchAlbumPanel";
import { MatchSongPanel } from "./components/MatchSongPanel";
import { ReviewList } from "./components/ReviewList";
import { listSlot, modalRoot } from "./styles";
import type { ReviewStep, UnidentifiedFilesModalProps } from "./types";

export function UnidentifiedFilesModal({ open, onOpenChange }: UnidentifiedFilesModalProps) {
  const [step, setStep] = useState<ReviewStep>({ kind: "list" });

  useEffect(() => {
    if (!open) setStep({ kind: "list" });
  }, [open]);

  const backToList = () => setStep({ kind: "list" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={modalRoot()}>
        {step.kind === "album" ? (
          <MatchAlbumPanel key={step.group.key} group={step.group} onBack={backToList} />
        ) : step.kind === "song" ? (
          <MatchSongPanel key={step.file.id} group={step.group} file={step.file} onBack={backToList} />
        ) : null}
        <div className={listSlot({ visible: step.kind === "list" })}>
          <ReviewList
            enabled={open}
            active={step.kind === "list"}
            onMatchAlbum={(group) => setStep({ kind: "album", group })}
            onMatchSong={(group, file) => setStep({ kind: "song", group, file })}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
