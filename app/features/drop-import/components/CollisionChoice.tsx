"use client";

import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { IconButton } from "@components/ui/IconButton";
import { useDiscardDropImportFile, useResolveDropImportCollision } from "@hooks/api";

import { collisionQualityLabel } from "../helpers";
import { collisionActions, collisionQualities, collisionQualityValue, collisionText } from "../styles";
import type { CollisionChoiceProps, CollisionQuality } from "../types";

export function CollisionChoice({ file, collision }: CollisionChoiceProps) {
  const { t } = useTranslation("library");
  const resolve = useResolveDropImportCollision();
  const discard = useDiscardDropImportFile();
  const busy = resolve.isPending || discard.isPending;

  const label = (quality: CollisionQuality | null): string =>
    quality === null ? t("dropImport.collision.unreadable") : collisionQualityLabel(quality);

  return (
    <>
      <p className={collisionText()}>{t("dropImport.collision.sameAs", { album: collision.album })}</p>
      <dl className={collisionQualities()}>
        <dt>{t("dropImport.collision.inLibrary")}</dt>
        <dd className={collisionQualityValue()}>{label(collision.existing)}</dd>
        <dt>{t("dropImport.collision.yours")}</dt>
        <dd className={collisionQualityValue()}>{label(collision.candidate)}</dd>
      </dl>
      <div className={collisionActions()}>
        <Button size="sm" disabled={busy} onClick={() => resolve.mutate({ fileId: file.id, choice: "existing" })}>
          {t("dropImport.collision.useExisting")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => resolve.mutate({ fileId: file.id, choice: "mine" })}
        >
          {t("dropImport.collision.useMine")}
        </Button>
        <IconButton
          icon={Trash2}
          size="sm"
          aria-label={t("dropImport.match.discardAria", { name: file.original_name })}
          onClick={() => discard.mutate({ fileId: file.id })}
          disabled={busy}
        />
      </div>
    </>
  );
}
