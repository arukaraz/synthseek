"use client";

import { Plug, Unplug } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { useUpdateConnectionsPlex } from "@hooks/api/mutations/settings/useUpdateConnections";
import { usePlexConnect } from "@hooks/api/mutations/settings/usePlexConnect";

import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { serverPickerButton, serverPickerCard, statusBadge } from "../../styles";
import { cn } from "@utils/cn";

interface PlexCardProps {
  initial: { url: string; token: string };
}

export function PlexCard({ initial }: PlexCardProps) {
  const updatePlex = useUpdateConnectionsPlex();
  const plexConnect = usePlexConnect();
  const [showServerPicker, setShowServerPicker] = useState(false);

  const connected = Boolean(initial.url && initial.token);

  const handleReconnect = async () => {
    setShowServerPicker(true);
    await plexConnect.start();
  };

  const handlePickServer = async (uri: string) => {
    await plexConnect.saveServer(uri);
    setShowServerPicker(false);
  };

  const handleDisconnect = async () => {
    try {
      await updatePlex.mutateAsync({ url: "", token: "" });
      toast.success("Plex disconnected");
    } catch (error) {
      void error;
    }
  };

  const badge = connected ? (
    <span className={cn(statusBadge({ tone: "success" }))}>● Connected</span>
  ) : (
    <span className={cn(statusBadge({ tone: "muted" }))}>● Not connected</span>
  );

  return (
    <SettingsCard title="Plex" description="Library scans and playlist sync." trailing={badge}>
      <SettingsField
        label="Server URL"
        helper={connected ? "Detected via OAuth. Edit by reconnecting." : "Click Reconnect to link a Plex server."}
      >
        <SettingsTextInput value={initial.url} onChange={() => undefined} disabled />
      </SettingsField>

      {showServerPicker && plexConnect.state.kind === "picking" ? (
        <div className={serverPickerCard()}>
          <span className="text-fg/70 text-xs">Pick the Plex server Synthseek should target:</span>
          <div className="flex flex-col gap-1.5">
            {plexConnect.state.servers.length === 0 ? (
              <span className="text-fg/50 text-xs">No servers found on this Plex account.</span>
            ) : (
              plexConnect.state.servers.map((server) => (
                <button
                  key={`${server.clientIdentifier}-${server.uri}`}
                  type="button"
                  onClick={() => handlePickServer(server.uri)}
                  className={serverPickerButton()}
                >
                  <span className="text-fg text-sm">{server.name}</span>
                  <span className="text-fg/40 text-xs">
                    {server.local ? "local" : "remote"} · {server.uri}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleReconnect} disabled={plexConnect.state.kind === "pending"}>
          <Plug className="size-4" />
          {plexConnect.state.kind === "pending" ? "Waiting for Plex..." : "Reconnect"}
        </Button>
        {connected ? (
          <Button variant="destructive" size="sm" onClick={handleDisconnect} disabled={updatePlex.isPending}>
            <Unplug className="size-4" />
            Disconnect
          </Button>
        ) : null}
      </div>
    </SettingsCard>
  );
}
