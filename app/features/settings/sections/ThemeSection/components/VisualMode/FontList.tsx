"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { IconButton } from "@components/ui/IconButton";
import { useRemoveThemeFont } from "@hooks/api/mutations/theme";
import { formatBytes } from "@utils/formatters";

import { fontItem, fontList, fontName, fontSize, fontSpace } from "./styles";
import type { FontListProps } from "./types";

export function FontList({ fonts, onUse }: FontListProps) {
  const { t } = useTranslation("themeEditor");
  const remove = useRemoveThemeFont();
  const [pending, setPending] = useState<string | null>(null);

  if (fonts === undefined) return null;

  return (
    <div>
      {fonts.fonts.length > 0 ? (
        <ul className={fontList()}>
          {fonts.fonts.map((font) => (
            <li key={font.file} className={fontItem()}>
              <span className={fontName()}>{font.file}</span>
              <span className={fontSize()}>{formatBytes(font.bytes)}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={t("fonts.use", { file: font.file })}
                onClick={() => onUse(font.file)}
              >
                {t("fonts.useShort")}
              </Button>
              <IconButton
                icon={Trash2}
                variant="ghostRed"
                size="md"
                animated={false}
                aria-label={t("fonts.remove", { file: font.file })}
                title={t("fonts.remove", { file: font.file })}
                onClick={() => setPending(font.file)}
              />
            </li>
          ))}
        </ul>
      ) : null}
      <p className={fontSpace()}>
        {t("fonts.space", { used: formatBytes(fonts.usedBytes), max: formatBytes(fonts.maxBytes) })}
      </p>
      <ConfirmationModal
        isOpen={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (pending !== null) remove.mutate({ file: pending });
          setPending(null);
        }}
        title={t("fonts.removeTitle")}
        message={t("fonts.removeMessage", { file: pending ?? "" })}
        confirmText={t("fonts.removeConfirm")}
      />
    </div>
  );
}
