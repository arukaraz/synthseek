"use client";

import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useTranslation } from "react-i18next";

import { playerPanel } from "@utils/animations";

import { DeviceBody } from "./DeviceBody";
import { deviceCaption, deviceFootnote, deviceList, deviceRow, iconButton, panelAnchor, panelSurface } from "./styles";
import type { PlayerPanelProps } from "./types";

export function DeviceMenu({ view, actions, chain }: PlayerPanelProps) {
  const { t } = useTranslation("player");

  return (
    <div className={panelAnchor({ width: "devices", chain })}>
      <motion.div className={panelSurface()} variants={playerPanel} initial="hidden" animate="visible" exit="exit">
        <div className={deviceList()}>
          <span className={deviceCaption()}>{t("devices.caption")}</span>
          {view.devices.map((device) =>
            device.local ? (
              <div key={device.id} className={deviceRow({ state: "active" })} aria-current="true">
                <DeviceBody device={device} />
              </div>
            ) : (
              <div key={device.id} className={deviceRow({ state: "idle" })}>
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  onClick={() => actions.handOverTo(device.id)}
                  aria-label={`${t("devices.handOver")}: ${device.name}`}
                >
                  <DeviceBody device={device} />
                </button>
                {device.armed ? (
                  <button
                    type="button"
                    className={iconButton({ tone: device.playing ? "active" : "muted", size: "compact" })}
                    onClick={() => actions.toggleRemote(device.id, device.playing)}
                    aria-label={device.playing ? t("controls.pause") : t("controls.play")}
                  >
                    {device.playing ? (
                      <Pause className="size-3.5 fill-current" />
                    ) : (
                      <Play className="size-3.5 fill-current" />
                    )}
                  </button>
                ) : null}
              </div>
            )
          )}
          <p className={deviceFootnote()}>{t("devices.footnote")}</p>
        </div>
      </motion.div>
    </div>
  );
}
