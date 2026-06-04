"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { IconButton } from "@components/ui/IconButton";
import { InfoTooltip } from "@components/ui/InfoTooltip";
import { Notice } from "@components/ui/Notice";
import { usePublicConfig } from "@hooks/api/queries/usePublicConfig";

import { SettingsField } from "../../components/SettingsField";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import {
  copyRow,
  subSection,
  subSectionDescription,
  subSectionHeader,
  subSectionHeaderText,
  subSectionTitle,
} from "../../styles";
import { mcpEndpoint } from "./helpers";
import { connectLabel, connectList } from "./styles";

export function McpSubsection() {
  const { t } = useTranslation("settings");
  const { data: publicConfig } = usePublicConfig();
  const [endpoint, setEndpoint] = useState("/api/v1/mcp");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEndpoint(mcpEndpoint(publicConfig?.publicBaseUrl || undefined));
  }, [publicConfig?.publicBaseUrl]);

  const handleCopy = async () => {
    if (!endpoint) return;
    try {
      await navigator.clipboard.writeText(endpoint);
      setCopied(true);
      toast.success(t("mcp.copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("mcp.copyFailed"));
    }
  };

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

      <SettingsField label={t("mcp.endpointLabel")} helper={t("mcp.endpointHelper")}>
        <div className={copyRow()}>
          <div className="flex-1">
            <SettingsTextInput value={endpoint} onChange={() => undefined} disabled />
          </div>
          <IconButton
            icon={copied ? Check : Copy}
            variant="accent"
            size="md"
            onClick={handleCopy}
            disabled={!endpoint}
            aria-label={t("mcp.copyEndpointLabel")}
            title={t("mcp.copyEndpointLabel")}
            animated={false}
          />
        </div>
      </SettingsField>

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
