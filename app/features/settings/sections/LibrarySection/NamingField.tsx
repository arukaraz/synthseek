"use client";

import { Eye, HelpCircle, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { IconButton } from "@components/ui/IconButton";
import { Notice } from "@components/ui/Notice";

import { SettingsField } from "../../components/SettingsField";
import { refuseExtensionTyping, templateHint, withExtension } from "./helpers";
import { OrganiseProgress } from "./OrganiseProgress";
import { PreviewModal } from "./PreviewModal";
import { fieldMessage, namingFooter, templateRow, tokensFooterInput } from "./styles";
import { TokensModal } from "./TokensModal";
import type { NamingFieldProps } from "./types";

export function NamingField({
  path,
  edited,
  onEditedChange,
  tokens,
  preview,
  settled,
  organise,
  refused,
}: NamingFieldProps) {
  const { t } = useTranslation("settings");
  const id = useId();
  const [pickingTokens, setPickingTokens] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const template = withExtension(edited);
  const readonly = path?.access === "readonly";
  const ownsOrganise = path !== null && organise !== undefined && organise.pathId === path.id;
  const moving = ownsOrganise && organise.running;
  const busy = organise?.running === true;
  const problem = preview?.outcome === "invalid" ? preview.problem : null;
  const moves = preview?.outcome === "valid" ? preview.moves : 0;
  const locked = readonly || moving;

  const hint = templateHint({ path, settled, invalid: problem !== null, moves });

  return (
    <>
      <SettingsField label={t("libraryNaming.template.label")} htmlFor={id}>
        <div className={templateRow()}>
          <input
            id={id}
            value={edited}
            onChange={(event) => onEditedChange(refuseExtensionTyping(event.target.value))}
            disabled={locked}
            spellCheck={false}
            className={tokensFooterInput()}
          />
          <IconButton
            icon={HelpCircle}
            variant="primary"
            aria-label={t("libraryNaming.tokensModal.open")}
            onClick={() => setPickingTokens(true)}
            disabled={locked}
          />
        </div>
      </SettingsField>

      {problem !== null ? <Notice variant="danger" title={t(`libraryNaming.problem.${problem}`)} /> : null}
      {problem === null && refused ? <Notice variant="danger" title={t("libraryPaths.naming.invalid")} /> : null}

      <div className={namingFooter()}>
        <span className={fieldMessage()}>{hint}</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPreviewing(true)}
          disabled={path === null || locked || busy || problem !== null || !settled || moves === 0}
        >
          {settled || path === null ? (
            <Eye className="size-4" aria-hidden />
          ) : (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          )}
          {t("libraryPaths.naming.preview")}
        </Button>
      </div>

      {ownsOrganise ? <OrganiseProgress status={organise} /> : null}

      <TokensModal
        open={pickingTokens}
        onOpenChange={setPickingTokens}
        template={template}
        edited={edited}
        tokens={tokens}
        problem={problem}
        onTemplateChange={onEditedChange}
      />
      {path === null ? null : (
        <PreviewModal
          open={previewing}
          onOpenChange={setPreviewing}
          pathId={path.id}
          pathLabel={path.label}
          template={template}
        />
      )}
    </>
  );
}
