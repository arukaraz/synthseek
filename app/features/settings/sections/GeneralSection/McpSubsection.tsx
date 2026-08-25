"use client";

import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { Notice } from "@components/ui/Notice";
import { usePublicConfig } from "@hooks/api/queries/usePublicConfig";

import {
  subSection,
  subSectionDescription,
  subSectionHeader,
  subSectionHeaderText,
  subSectionTitle,
} from "../../styles";
import { ConnectionValueField } from "./ConnectionValueField";
import { publicEndpoint } from "./helpers";
import { connectLabel, connectList } from "./styles";

export function McpSubsection() {
  const { t } = useTranslation("settings");
  const publicConfig = usePublicConfig();
  const endpoint = publicEndpoint("/api/v1/mcp", publicConfig.data?.publicBaseUrl || undefined);

  const tools = [
    t("mcp.tools.discovery"),
    t("mcp.tools.downloads"),
    t("mcp.tools.requests"),
    t("mcp.tools.library"),
    t("mcp.tools.settings"),
    t("mcp.tools.operations"),
  ];

  return (
    <section className={subSection()}>
      <header className={subSectionHeader()}>
        <div className={subSectionHeaderText()}>
          <div className="flex items-center gap-1.5">
            <h3 className={subSectionTitle()}>{t("mcp.title")}</h3>
            <InfoTooltip
              trigger="click"
              side="bottom"
              title={t("mcp.toolsTitle")}
              description={t("mcp.toolsDescription")}
              points={tools}
            />
          </div>
          <p className={subSectionDescription()}>{t("mcp.description")}</p>
        </div>
      </header>

      <ConnectionValueField
        label={t("mcp.endpointLabel")}
        value={endpoint}
        helper={t("mcp.endpointHelper")}
        copyAriaLabel={t("mcp.copyEndpointLabel")}
        copiedMessage={t("mcp.copied")}
        copyFailedMessage={t("mcp.copyFailed")}
      />

      <Notice variant="info" title={t("mcp.connectTitle")} collapsible defaultOpen={false}>
        <ul className={connectList()}>
          <li>
            <span className={connectLabel()}>{t("mcp.oauthLabel")}.</span> {t("mcp.oauthBody")}
          </li>
          <li>
            <span className={connectLabel()}>{t("mcp.keyLabel")}.</span> {t("mcp.keyBody")}
          </li>
        </ul>
      </Notice>
    </section>
  );
}
