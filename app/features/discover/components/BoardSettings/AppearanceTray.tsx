"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { SectionLoading } from "@components/ui/SectionLoading";
import { SegmentedControl } from "@components/ui/SegmentedControl";
import { useSetBoardAppearance } from "@hooks/api/mutations/board/useSetBoardAppearance";
import { useBoardAppearance } from "@hooks/api/queries/board/useBoardAppearance";

import { TRAY_MOTION } from "./constants";
import { densityChoices, textScaleChoices } from "./helpers";
import { trayBody, trayChoice, trayFrame, trayLabel } from "./styles";
import type { AppearanceTrayProps } from "./types";

export function AppearanceTray({ background, onBackground }: AppearanceTrayProps) {
  const { t } = useTranslation("widgets");
  const appearance = useBoardAppearance().data;
  const setAppearance = useSetBoardAppearance();
  const still = useReducedMotion();

  return (
    <motion.div
      data-board-tray
      className={trayFrame()}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={still ? { duration: 0 } : TRAY_MOTION}
    >
      <div className={trayBody()} role="group" aria-label={t("board.appearance.title")}>
        {appearance ? (
          <>
            <div className={trayChoice()}>
              <span className={trayLabel()}>{t("board.appearance.density")}</span>
              <SegmentedControl
                options={densityChoices().map((density) => ({
                  value: density,
                  label: t(`board.appearance.densities.${density}`),
                }))}
                value={appearance.density}
                onChange={(density) => setAppearance({ ...appearance, density })}
                ariaLabel={t("board.appearance.density")}
              />
            </div>
            <div className={trayChoice()}>
              <span className={trayLabel()}>{t("board.appearance.text")}</span>
              <SegmentedControl
                options={textScaleChoices().map((text) => ({
                  value: text,
                  label: t(`board.appearance.texts.${text}`),
                }))}
                value={appearance.text}
                onChange={(text) => setAppearance({ ...appearance, text })}
                ariaLabel={t("board.appearance.text")}
              />
            </div>
            <div className={trayChoice()}>
              <span className={trayLabel()}>{t("board.appearance.background")}</span>
              <SegmentedControl
                options={[
                  { value: "on", label: t("board.appearance.backgrounds.on") },
                  { value: "off", label: t("board.appearance.backgrounds.off") },
                ]}
                value={background}
                onChange={(choice) => onBackground(choice === "on")}
                ariaLabel={t("board.appearance.background")}
              />
            </div>
          </>
        ) : (
          <SectionLoading />
        )}
      </div>
    </motion.div>
  );
}
