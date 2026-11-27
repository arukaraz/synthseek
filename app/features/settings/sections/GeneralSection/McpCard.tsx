"use client";

import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { usePublicConfig } from "@hooks/api/queries/usePublicConfig";

import { Pill } from "../../components/Pill";
import { AI_ASSISTANTS_ANCHOR } from "../../constants";
import { SettingsCard } from "../../components/SettingsCard";
import { fieldLabel } from "../../styles";
import { ConnectionValueField } from "./ConnectionValueField";
import { MCP_TOOLS_DOCS_URL } from "./constants";
import { publicEndpoint } from "./helpers";
import { connectMethod, connectMethodBody, connectMethods } from "./styles";

export function McpCard() {
  const { t } = useTranslation("settings");
  const publicConfig = usePublicConfig();
  const endpoint = publicEndpoint("/api/v1/mcp", publicConfig.data?.publicBaseUrl || undefined);

  return (
    <SettingsCard
      title={t("mcp.title")}
      description={t("mcp.description")}
      anchor={AI_ASSISTANTS_ANCHOR}
      titleTrailing={
        <InfoTooltip
          trigger="click"
          side="bottom"
          title={t("mcp.toolsTitle")}
          learnMore={{ label: t("mcp.toolsDocs"), href: MCP_TOOLS_DOCS_URL }}
        />
      }
    >
      <ConnectionValueField
        label={t("mcp.endpointLabel")}
        value={endpoint}
        helper={t("mcp.endpointHelper")}
        copyAriaLabel={t("mcp.copyEndpointLabel")}
        copiedMessage={t("mcp.copied")}
        copyFailedMessage={t("mcp.copyFailed")}
      />

      <div className="flex flex-col gap-2">
        <span className={fieldLabel()}>{t("mcp.connectTitle")}</span>
        <div className={connectMethods()}>
          <div className={connectMethod()}>
            <Pill tone="info">{t("mcp.oauthLabel")}</Pill>
            <p className={connectMethodBody()}>{t("mcp.oauthBody")}</p>
          </div>
          <div className={connectMethod()}>
            <Pill tone="muted">{t("mcp.keyLabel")}</Pill>
            <p className={connectMethodBody()}>{t("mcp.keyBody")}</p>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
