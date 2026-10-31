"use client";

import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { SegmentedControl } from "@components/ui/SegmentedControl";
import { SelectMenu } from "@components/ui/SelectMenu";

import { NUMBER_BOUNDS } from "../constants";
import { NumberField } from "../NumberField";
import { StepRow } from "../StepRow";
import { stepText } from "../styles";
import { LENGTH_STEP, MINUTES_STEP } from "./constants";
import { windowChoiceOf, windowFrom } from "./helpers";
import { lengthSlider, lengthValue, line, stack } from "./styles";
import type { SetMix, SetStepProps } from "./types";

export function SetMixStep({ set, grammar, onChange }: SetStepProps) {
  const { t } = useTranslation("widgets");
  const { mix } = set;
  const { limits } = grammar;
  const update = (patch: Partial<SetMix>) => onChange((current) => ({ ...current, mix: { ...current.mix, ...patch } }));
  const { repeatWindow, length } = mix;

  return (
    <StepRow label={t("set.mix")} flush>
      <div className={stack()}>
        <div className={line()}>
          <span className={stepText()}>{t("set.eachList")}</span>
          <SegmentedControl
            ariaLabel={t("set.eachList")}
            value={length.by}
            options={[
              { value: "tracks", label: t("set.byTracks") },
              { value: "minutes", label: t("set.byMinutes") },
            ]}
            onChange={(by) =>
              update({
                length: by === "tracks" ? { by, value: limits.tracksDefault } : { by, value: limits.minutesDefault },
              })
            }
          />
          {length.by === "tracks" ? (
            <>
              <input
                type="range"
                className={lengthSlider()}
                aria-label={t("set.tracksPerList")}
                min={limits.tracksMin}
                max={limits.tracksMax}
                step={LENGTH_STEP}
                value={length.value}
                onChange={(event) => update({ length: { by: "tracks", value: Number(event.target.value) } })}
              />
              <span className={lengthValue()}>{length.value}</span>
              <span className={stepText()}>{t("set.lengthTracks")}</span>
            </>
          ) : (
            <>
              <NumberField
                label={t("set.minutesPerList")}
                value={length.value}
                min={limits.minutesMin}
                max={limits.minutesMax}
                step={MINUTES_STEP}
                onChange={(value) => update({ length: { by: "minutes", value } })}
              />
              <span className={stepText()}>{t("set.minutesMost", { max: limits.tracksMax })}</span>
            </>
          )}
        </div>
        <div className={line()}>
          <span className={stepText()}>{t("set.atMost")}</span>
          <NumberField
            label={t("set.perArtistLabel")}
            value={mix.perArtist}
            min={1}
            max={limits.capMax}
            onChange={(perArtist) => update({ perArtist })}
          />
          <span className={stepText()}>{t("set.perArtist")}</span>
          <NumberField
            label={t("set.perAlbumLabel")}
            value={mix.perAlbum}
            min={1}
            max={limits.capMax}
            onChange={(perAlbum) => update({ perAlbum })}
          />
          <span className={stepText()}>{t("set.perAlbum")}</span>
        </div>
        <div className={line()}>
          <span className={stepText()}>{t("set.noRepeat")}</span>
          <SelectMenu
            ariaLabel={t("set.noRepeat")}
            value={windowChoiceOf(repeatWindow)}
            options={[
              { value: "auto", label: t("set.windowAuto") },
              { value: "custom", label: t("set.windowCustom") },
              { value: "off", label: t("set.windowOff") },
            ]}
            onChange={(choice) => update({ repeatWindow: windowFrom(choice) })}
          />
          {typeof repeatWindow === "number" ? (
            <>
              <NumberField
                label={t("set.windowDays")}
                value={repeatWindow}
                min={NUMBER_BOUNDS.daysMin}
                max={limits.windowDaysMax}
                onChange={(value) => update({ repeatWindow: value })}
              />
              <span className={stepText()}>{t("rules.ops.days")}</span>
            </>
          ) : null}
        </div>
        <div className={line()}>
          <span className={stepText()}>{t("set.dial")}</span>
          <InfoTooltip title={t("set.dial")} description={t("set.dialHelp")} triggerLabel={t("set.dialHelpLabel")} />
          <SegmentedControl
            ariaLabel={t("set.dial")}
            value={mix.dial}
            options={grammar.dials.map((dial) => ({ value: dial, label: t(`set.dials.${dial}`) }))}
            onChange={(dial) => update({ dial })}
          />
        </div>
        <div className={line()}>
          <span className={stepText()}>{t("set.order")}</span>
          <SegmentedControl
            ariaLabel={t("set.order")}
            value={mix.order}
            options={grammar.orders.map((order) => ({ value: order, label: t(`set.orders.${order}`) }))}
            onChange={(order) => update({ order })}
          />
        </div>
      </div>
    </StepRow>
  );
}
