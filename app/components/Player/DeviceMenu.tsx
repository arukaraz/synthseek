"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { Dialog, DialogSurface, DialogTitle } from "@components/ui/Dialog";
import { playerPanel } from "@utils/animations";

import { DeviceBody } from "./DeviceBody";
import { DEVICES_TOGGLE_SELECTOR } from "./constants";
import { returnFocusTo } from "./helpers";
import { deviceCaption, deviceList, deviceRow, panelAnchor, panelSurface } from "./styles";
import type { PlayerDevice, PlayerPanelProps } from "./types";

function rowState(device: PlayerDevice): "playing" | "active" | "idle" {
  if (device.playing) return "playing";
  return device.active ? "active" : "idle";
}

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
        onPointerDownOutside={(event) => {
          if (event.target instanceof Element && event.target.closest(DEVICES_TOGGLE_SELECTOR) !== null) {
            event.preventDefault();
          }
        }}
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
              device.local && device.active ? (
                <div key={device.id} className={deviceRow({ state: rowState(device) })} aria-current="true">
                  <DeviceBody device={device} />
                </div>
              ) : (
                <button
                  key={device.id}
                  type="button"
                  className={deviceRow({ state: rowState(device) })}
                  onClick={device.local ? actions.playHere : () => actions.handOverTo(device.id)}
                  aria-label={`${t(device.local ? "devices.playHere" : "devices.handOver")}: ${device.name}`}
                >
                  <DeviceBody device={device} />
                </button>
              )
            )}
          </div>
        </motion.div>
      </DialogSurface>
    </Dialog>
  );
}
