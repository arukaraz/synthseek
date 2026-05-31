"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { IconButton } from "@components/ui/IconButton";
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
import { MCP_SUB } from "./constants";
import { mcpEndpoint } from "./helpers";

export function McpSubsection() {
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
      toast.success(MCP_SUB.copied);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy endpoint");
    }
  };

  return (
    <section className={subSection()}>
      <header className={subSectionHeader()}>
        <div className={subSectionHeaderText()}>
          <h3 className={subSectionTitle()}>{MCP_SUB.title}</h3>
          <p className={subSectionDescription()}>{MCP_SUB.description}</p>
        </div>
      </header>

      <SettingsField label={MCP_SUB.endpointLabel} helper={MCP_SUB.auth}>
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
            aria-label="Copy MCP endpoint"
            title="Copy MCP endpoint"
            animated={false}
          />
        </div>
      </SettingsField>
    </section>
  );
}
