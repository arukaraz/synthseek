"use client";

import { deviceDetail, deviceDot, deviceName } from "./styles";
import type { PlayerDeviceBodyProps } from "./types";

export function DeviceBody({ device }: PlayerDeviceBodyProps) {
  return (
    <>
      <span className={deviceDot({ state: device.active ? "active" : "idle" })} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={deviceName()}>{device.name}</span>
        <span className={deviceDetail()}>{device.detail}</span>
      </span>
    </>
  );
}
