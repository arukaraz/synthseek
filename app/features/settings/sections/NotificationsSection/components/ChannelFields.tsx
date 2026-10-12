"use client";

import { useTranslation } from "react-i18next";

import { Input } from "@components/ui/Input";
import { useRevealNotificationSecret } from "@hooks/api";

import { SettingsField } from "../../../components/SettingsField";
import { SettingsSecretInput } from "../../../components/SettingsSecretInput";
import { CHANNEL_FIELDS } from "../constants";
import { fieldGrid } from "../styles";
import type { ChannelFieldsProps } from "../types";

export function ChannelFields({ channel, config, ntfyServers, onChange }: ChannelFieldsProps) {
  const { t } = useTranslation("settings");
  const reveal = useRevealNotificationSecret();

  return (
    <div className={fieldGrid()}>
      {CHANNEL_FIELDS[channel].map((field) => {
        const id = `notification-${channel}-${field.name}`;
        const label = t(`notifications.fields.${field.name}.label`);
        const placeholder = t(`notifications.fields.${field.name}.placeholder`);
        const helper =
          channel === "ntfy" && field.name === "serverUrl" && ntfyServers !== null
            ? t("notifications.fields.serverUrl.allowed", { servers: ntfyServers.join(", ") })
            : undefined;
        return (
          <SettingsField key={field.name} label={label} htmlFor={id} helper={helper}>
            {field.secret ? (
              <SettingsSecretInput
                id={id}
                value={config[field.name] ?? ""}
                placeholder={placeholder}
                ariaLabel={label}
                onChange={(value) => onChange(field.name, value)}
                source={{ kind: "stored", reveal: () => reveal({ channel, field: field.name }) }}
              />
            ) : (
              <Input
                id={id}
                value={config[field.name] ?? ""}
                placeholder={placeholder}
                autoComplete="off"
                onChange={(event) => onChange(field.name, event.target.value)}
              />
            )}
          </SettingsField>
        );
      })}
    </div>
  );
}
