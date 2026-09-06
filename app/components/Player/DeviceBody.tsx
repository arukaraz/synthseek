"use client";

import { DEVICE_ICONS } from "./constants";
import { deviceIcon, deviceName } from "./styles";
import type { PlayerDeviceBodyProps } from "./types";

export function DeviceBody({ device }: PlayerDeviceBodyProps) {
  const Icon = DEVICE_ICONS[device.kind];

  return (
    <>
      <Icon className={deviceIcon({ state: device.playing ? "playing" : "idle" })} />
      <span className={deviceName()}>{device.name}</span>
    </>
  );
}
