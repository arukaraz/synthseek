"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";

import { deviceIcon, deviceName } from "./styles";
import type { PlayerDeviceBodyProps } from "./types";

const ICONS = { computer: Monitor, phone: Smartphone, tablet: Tablet };

export function DeviceBody({ device }: PlayerDeviceBodyProps) {
  const Icon = ICONS[device.kind];

  return (
    <>
      <Icon className={deviceIcon({ state: device.playing ? "playing" : device.active ? "active" : "idle" })} />
      <span className={deviceName()}>{device.name}</span>
    </>
  );
}
