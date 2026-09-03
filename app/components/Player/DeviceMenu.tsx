"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { playerPanel } from "@utils/animations";

import {
  deviceCapability,
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

export function DeviceMenu({ view, actions, chain }: PlayerPanelProps) {
  const { t } = useTranslation("player");

  return (
    <div className={panelAnchor({ width: "devices", chain })}>
      <motion.div className={panelSurface()} variants={playerPanel} initial="hidden" animate="visible" exit="exit">
        <div className={deviceList()}>
          <span className={deviceCaption()}>{t("devices.caption")}</span>
          {view.devices.map((device) => (
            <button
              key={device.id}
              type="button"
              className={deviceRow({
                state: device.kind === "unarmed" ? "unarmed" : device.active ? "active" : "idle",
              })}
              onClick={() => actions.selectDevice(device.id)}
              aria-current={device.active ? "true" : undefined}
            >
              <span
                className={deviceDot({
                  state:
                    device.kind === "own"
                      ? device.active
                        ? "active"
                        : "idle"
                      : device.kind === "third"
                        ? "third"
                        : "unarmed",
                })}
              />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className={deviceName()}>{device.name}</span>
                <span className={deviceDetail()}>{device.detail}</span>
              </span>
              <span className={deviceCapability({ kind: device.kind })}>{t(`devices.capability.${device.kind}`)}</span>
            </button>
          ))}
          <p className={deviceFootnote()}>{t("devices.footnote")}</p>
        </div>
      </motion.div>
    </div>
  );
}
