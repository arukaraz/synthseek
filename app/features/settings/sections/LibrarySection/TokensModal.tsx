"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/Dialog";
import { Notice } from "@components/ui/Notice";
import { useLibraryNamingSamples } from "@hooks/api/queries/useLibraryNaming";

import { sampleLabelKey } from "./helpers";
import {
  sampleLabel,
  samplePath,
  sampleRow,
  tokenCell,
  tokenExample,
  tokenGrid,
  tokenGroup,
  tokenGroupTitle,
  tokenName,
  tokensFooterInput,
  tokensRules,
} from "./styles";
import type { TokensModalProps } from "./types";

export function TokensModal({
  open,
  onOpenChange,
  template,
  onInsert,
  onTemplateChange,
  tokens,
  problem,
}: TokensModalProps) {
  const { t } = useTranslation("settings");
  const samples = useLibraryNamingSamples(template, open && template.length > 0 && problem === null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("libraryNaming.tokensModal.title")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className={tokenGroup()}>
            <span className={tokenGroupTitle()}>{t("libraryNaming.tokensModal.group")}</span>
            <div className={tokenGrid()}>
              {tokens.map((token) => (
                <button key={token.name} type="button" className={tokenCell()} onClick={() => onInsert(token.example)}>
                  <span className={tokenName()}>{token.example}</span>
                  <span className={tokenExample()}>{t(`libraryNaming.tokens.${token.name}`)}</span>
                </button>
              ))}
            </div>
            <p className={tokensRules()}>{t("libraryNaming.tokensModal.rules")}</p>
          </div>

          {problem !== null ? <Notice variant="danger" title={t(`libraryNaming.problem.${problem}`)} /> : null}

          {samples.data && problem === null ? (
            <div className={tokenGroup()}>
              <span className={tokenGroupTitle()}>{t("libraryNaming.tokensModal.examples")}</span>
              {samples.data.samples.map((sample) => {
                const label = sampleLabelKey(sample.id);
                if (label === null) return null;
                return (
                  <div key={sample.id} className={sampleRow()}>
                    <span className={sampleLabel()}>{t(label)}</span>
                    <span className={samplePath()}>{sample.path ?? t("libraryNaming.samples.unrenderable")}</span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        <DialogFooter className="sm:items-center">
          <input
            value={template}
            onChange={(event) => onTemplateChange(event.target.value)}
            aria-label={t("libraryNaming.template.label")}
            className={tokensFooterInput()}
          />
          <Button onClick={() => onOpenChange(false)}>{t("libraryNaming.tokensModal.close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
