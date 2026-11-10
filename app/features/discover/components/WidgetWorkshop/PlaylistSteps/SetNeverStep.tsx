"use client";

import { Undo2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@components/ui/IconButton";
import { useVeto, useVetoTracks } from "@hooks/api/queries/widgets/useVeto";

import { StepRow } from "../StepRow";
import { stepText } from "../styles";
import { hint, line, stack, tag, tagList, tagText } from "./styles";
import type { SetStepProps } from "./types";

export function SetNeverStep({ set, onChange }: Pick<SetStepProps, "set" | "onChange">) {
  const { t } = useTranslation("widgets");
  const veto = useVeto();
  const vetoTracks = useVetoTracks();
  const entries = [
    ...(veto.data?.artists ?? []).map((artist) => ({ key: `artists|${artist}`, label: artist })),
    ...(vetoTracks.data ?? []).map((track) => ({ key: `tracks|${track.id}`, label: track.title })),
  ];
  const toggle = (key: string) =>
    onChange((current) => ({
      ...current,
      allow: current.allow.includes(key) ? current.allow.filter((entry) => entry !== key) : [...current.allow, key],
    }));

  return (
    <StepRow label={t("set.never")} flush>
      <div className={stack()}>
        <div className={line()}>
          {entries.length === 0 ? <span className={stepText()}>{t("set.neverEmpty")}</span> : null}
          {entries.length > 0 ? (
            <span className={tagList()}>
              {entries.map((entry) => {
                const allowed = set.allow.includes(entry.key);
                return (
                  <span key={entry.key} className={tag({ allowed })}>
                    <span className={tagText()}>{entry.label}</span>
                    <IconButton
                      icon={allowed ? Undo2 : X}
                      size="sm"
                      animated={false}
                      aria-pressed={allowed}
                      aria-label={t(allowed ? "set.excludeHere" : "set.allowHere", { name: entry.label })}
                      title={t(allowed ? "set.excludeHere" : "set.allowHere", { name: entry.label })}
                      onClick={() => toggle(entry.key)}
                    />
                  </span>
                );
              })}
            </span>
          ) : null}
        </div>
        <span className={hint()}>{t("set.neverHint")}</span>
      </div>
    </StepRow>
  );
}
