"use client";

import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogSurface, DialogTitle } from "@components/ui/Dialog";
import { playerPanel } from "@utils/animations";

import { DeviceBody } from "./DeviceBody";
import { DEVICES_TOGGLE_SELECTOR } from "./constants";
import { returnFocusTo } from "./helpers";
import { deviceCaption, deviceFootnote, deviceList, deviceRow, iconButton, panelAnchor, panelSurface } from "./styles";
import type { PlayerPanelProps } from "./types";

export function DeviceMenu({ view, actions, chain }: PlayerPanelProps) {
  const { t } = useTranslation("player");

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) actions.toggleDevices();
      }}
    >
      <DialogSurface
        className={panelAnchor({ width: "devices", chain })}
        aria-describedby={undefined}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusTo(DEVICES_TOGGLE_SELECTOR);
        }}
      >
        <motion.div className={panelSurface()} variants={playerPanel} initial="hidden" animate="visible" exit="exit">
          <div className={deviceList()}>
            <DialogTitle asChild>
              <span className={deviceCaption()}>{t("devices.caption")}</span>
            </DialogTitle>
            {view.devices.map((device) =>
              device.local ? (
                device.active ? (
                  <div key={device.id} className={deviceRow({ state: "active" })} aria-current="true">
                    <DeviceBody device={device} />
                  </div>
                ) : (
                  <button
                    key={device.id}
                    type="button"
                    className={deviceRow({ state: "idle" })}
                    onClick={actions.playHere}
                    aria-label={`${t("devices.playHere")}: ${device.name}`}
                  >
                    <DeviceBody device={device} />
                  </button>
                )
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
      </DialogSurface>
    </Dialog>
  );
}
