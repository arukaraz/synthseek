"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { playerPanel } from "@utils/animations";

import {
  deviceCaption,
  deviceDetail,
  deviceDot,
  deviceFootnote,
  deviceList,
  deviceName,
  deviceRow,
  panelAnchor,
  panelSurface,
} from "./styles";
import type { PlayerPanelProps } from "./types";

export function DeviceMenu({ view, chain }: PlayerPanelProps) {
  const { t } = useTranslation("player");

  return (
    <div className={panelAnchor({ width: "devices", chain })}>
      <motion.div className={panelSurface()} variants={playerPanel} initial="hidden" animate="visible" exit="exit">
        <div className={deviceList()}>
          <span className={deviceCaption()}>{t("devices.caption")}</span>
          {view.devices.map((device) => (
            <div
              key={device.id}
              className={deviceRow({ state: device.active ? "active" : "idle" })}
              aria-current={device.active ? "true" : undefined}
            >
              <span className={deviceDot({ state: device.active ? "active" : "idle" })} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className={deviceName()}>{device.name}</span>
                <span className={deviceDetail()}>{device.detail}</span>
              </span>
            </div>
          ))}
          <p className={deviceFootnote()}>{t("devices.footnote")}</p>
        </div>
      </motion.div>
    </div>
  );
}
