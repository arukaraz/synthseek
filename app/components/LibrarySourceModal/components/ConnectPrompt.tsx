"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { SessionConnectForm } from "@components/SessionConnectForm";
import { Button } from "@components/ui/Button";
import { useConnectLibrarySource } from "@hooks/api/mutations/library-source/useConnectLibrarySource";
import { cn } from "@utils/cn";

import { PROFILE_ROUTE } from "../constants";
import { connectPrompt, connectPromptBody, connectPromptIcon, connectPromptTitle, providerTone } from "../styles";
import { ProviderMark } from "./ProviderMark";
import type { ConnectPromptProps } from "./types";

export function ConnectPrompt({ source, expired = false, inline = false }: ConnectPromptProps) {
  const { t } = useTranslation("library");
  const connect = useConnectLibrarySource();

  if (!source) {
    return (
      <div className={connectPrompt()}>
        <span className="text-fg/60 text-sm">{t("librarySource.connect.checking")}</span>
      </div>
    );
  }

  const provider = source.name;
  const kind = source.capabilities.connect;
  const viaAccount = kind === "account";
  const viaSession = kind === "session";
  const viaOauth = kind === "oauth";
  const title = expired
    ? t("librarySource.connect.expiredTitle", { provider })
    : t("librarySource.connect.title", { provider });
  const body = expired
    ? t("librarySource.connect.bodyExpired", { provider })
    : viaAccount
      ? t("librarySource.connect.bodyAccount", { provider })
      : viaSession
        ? t("librarySource.connect.bodySession", { provider })
        : source.pending
          ? t("librarySource.connect.bodyPending", { provider })
          : t("librarySource.connect.bodyDefault", { provider });
  const action =
    expired || source.pending
      ? t("librarySource.connect.reconnect", { provider })
      : t("librarySource.connect.connect", { provider });

  return (
    <div className={connectPrompt({ fit: inline ? "inline" : viaSession ? "scroll" : "fill" })}>
      <span className={cn(connectPromptIcon(), providerTone({ provider: source.provider }))}>
        <ProviderMark provider={source.provider} size={28} />
      </span>
      <h2 className={connectPromptTitle()}>{title}</h2>
      <p className={connectPromptBody()}>{body}</p>
      {viaAccount ? (
        <Button asChild>
          <Link href={PROFILE_ROUTE}>{t("librarySource.connect.linkAccount", { provider })}</Link>
        </Button>
      ) : null}
      {viaSession ? <SessionConnectForm source={source} reconnect={expired} /> : null}
      {viaOauth ? (
        <Button
          onClick={() => connect.mutate({ provider: source.provider })}
          disabled={!source.configured || connect.isPending}
        >
          {action}
        </Button>
      ) : null}
    </div>
  );
}
