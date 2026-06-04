"use client";

import { useTranslation } from "react-i18next";
import { LidarrProfileFields } from "./LidarrProfileFields";
import { AlbumMonitorControl, ArtistMonitorControl } from "./MonitorControl";
import type { LidarrInputsProps } from "./types";

export function LidarrInputs(props: LidarrInputsProps) {
  const { t } = useTranslation("search");

  if (props.monitorMode === "album") {
    return (
      <LidarrProfileFields
        value={props.value}
        onChange={props.onChange}
        monitorSlot={
          <AlbumMonitorControl
            label={t("config.fields.lidarrMonitor")}
            value={props.value.monitor}
            onChange={(monitor) => props.onChange({ ...props.value, monitor })}
          />
        }
      />
    );
  }

  return (
    <LidarrProfileFields
      value={props.value}
      onChange={props.onChange}
      monitorSlot={
        <ArtistMonitorControl
          label={t("config.fields.lidarrMonitor")}
          value={props.value.monitor}
          onChange={(monitor) => props.onChange({ ...props.value, monitor })}
        />
      }
    />
  );
}
