"use client";

import { Plus } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Checkbox } from "@components/ui/Checkbox";
import { InfoTooltip } from "@components/ui/InfoTooltip";
import { useLibraryPlaylists } from "@hooks/api/queries/library/useLibraryPlaylists";
import { useSetGrammar } from "@hooks/api/queries/widgets/useSetGrammar";

import { ruleListOf } from "../helpers";
import { NumberField } from "../NumberField";
import { StepRow } from "../StepRow";
import { SubjectSelect } from "../SubjectSelect";
import { compareField, readback, stepList, stepText } from "../styles";
import type { PlaylistStepsProps } from "../types";
import { playlistReadbackOf, withNewSlot, withSlotCount } from "./helpers";
import { SetMixStep } from "./SetMixStep";
import { SetNeverStep } from "./SetNeverStep";
import { SetOnRefreshStep } from "./SetOnRefreshStep";
import { SetOutsideStep } from "./SetOutsideStep";
import { SetRefreshStep } from "./SetRefreshStep";
import { SetWhereStep } from "./SetWhereStep";
import { SlotRow } from "./SlotRow";
import { line, listOptions, stack } from "./styles";

export function PlaylistSteps({ workshop, set, context, preview }: Omit<PlaylistStepsProps, "grammar">) {
  const { t } = useTranslation("widgets");
  const { data: grammar } = useSetGrammar();
  const library = useLibraryPlaylists({}, true);
  const playlists = useMemo(
    () => (library.items ?? []).map((playlist) => ({ id: playlist.id, name: playlist.name })),
    [library.items]
  );

  if (!grammar) return null;

  const onChange = workshop.updateSet;
  const step = { set, grammar, onChange };
  const result = preview?.type === "playlists" ? preview : undefined;
  const { limits } = grammar;

  return (
    <>
      <div className={stepList()}>
        <StepRow label={t("steps.show")} flush>
          <NumberField
            label={t("set.listCount")}
            value={set.slots.length}
            min={1}
            max={limits.slotsMax}
            onChange={(count) => onChange((current) => withSlotCount(current, grammar, count))}
          />
          <SubjectSelect workshop={workshop} value="playlists" grammar={context.grammar} />
          <span className={stepText()}>{t("set.upToLists", { max: limits.slotsMax })}</span>
        </StepRow>
        <StepRow
          label={t("set.buildFrom")}
          info={
            <InfoTooltip
              title={t("set.buildFrom")}
              description={t("set.buildFromHelp")}
              triggerLabel={t("set.buildFromHelpLabel")}
            />
          }
          flush
        >
          <div className={stack()}>
            {set.slots.map((slot, index) => (
              <SlotRow key={slot.id} slot={slot} index={index} result={result} {...step} />
            ))}
            <div className={listOptions()}>
              <div className={line()}>
                {set.slots.length < limits.slotsMax ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange((current) => withNewSlot(current, grammar))}
                  >
                    <Plus />
                    {t("set.addList")}
                  </Button>
                ) : null}
                <label className={compareField()}>
                  <Checkbox
                    checked={set.mix.distinct}
                    onCheckedChange={(checked) =>
                      onChange((current) => ({ ...current, mix: { ...current.mix, distinct: checked === true } }))
                    }
                  />
                  {t("set.distinct")}
                </label>
              </div>
              <div className={line()}>
                <span className={stepText()}>{t("set.hideUnder")}</span>
                <NumberField
                  label={t("set.minTracks")}
                  value={set.mix.minTracks}
                  min={1}
                  max={limits.tracksMax}
                  onChange={(minTracks) => onChange((current) => ({ ...current, mix: { ...current.mix, minTracks } }))}
                />
                <span className={stepText()}>{t("set.tracks")}</span>
              </div>
            </div>
          </div>
        </StepRow>
        <SetWhereStep
          workshop={workshop}
          rules={ruleListOf(set.rules)}
          fields={grammar.ruleFields}
          limits={context.grammar.limits}
          people={context.people}
          playlists={playlists}
        />
        <SetMixStep {...step} />
        <SetRefreshStep result={result} {...step} />
        <SetOnRefreshStep {...step} />
        <SetOutsideStep {...step} />
        <SetNeverStep set={set} onChange={onChange} />
      </div>
      <p className={readback()} aria-live="polite">
        {playlistReadbackOf(set, context.people, playlists)}
      </p>
    </>
  );
}
