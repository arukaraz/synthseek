"use client";

import { ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { LogoIcon } from "@components/ui/LogoIcon";
import { useApproveOAuth } from "@hooks/api/mutations/oauth/useApproveOAuth";
import { useDenyOAuth } from "@hooks/api/mutations/oauth/useDenyOAuth";
import { useOAuthPending } from "@hooks/api/queries/useOAuthPending";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { scopeLabel } from "./helpers";
import { consentActions, consentCard, consentColumn, consentFrame } from "./styles";

export function OAuthConsentScreen() {
  const { t } = useTranslation("auth");
  const grant = useSearchParams().get("grant");
  const { currentUser } = useAuthContext();
  const pending = useOAuthPending(grant);
  const approve = useApproveOAuth();
  const deny = useDenyOAuth();

  const go = (url: string) => {
    window.location.href = url;
  };
  const busy = approve.isPending || deny.isPending;

  return (
    <div className={consentFrame()}>
      <div className={consentColumn()}>
        <LogoIcon />
        <div className={consentCard()}>
          {!grant ? (
            <p className="text-sm text-red-400">{t("oauthConsent.missing")}</p>
          ) : pending.isLoading ? (
            <p className="text-fg/60 text-sm">{t("oauthConsent.loading")}</p>
          ) : pending.error || !pending.data ? (
            <p className="text-sm text-red-400">{t("oauthConsent.loadError")}</p>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-3">
                <ShieldCheck className="text-primary-400 size-6" />
                <h1 className="text-fg text-lg font-bold">{t("oauthConsent.title")}</h1>
              </div>

              <p className="text-fg/80 text-sm">
                {currentUser ? (
                  <Trans
                    t={t}
                    i18nKey="oauthConsent.requestForUser"
                    values={{ clientName: pending.data.clientName, username: currentUser.username }}
                    components={[
                      <span key="client" className="font-semibold" />,
                      <span key="user" className="font-semibold" />,
                    ]}
                  />
                ) : (
                  <Trans
                    t={t}
                    i18nKey="oauthConsent.request"
                    values={{ clientName: pending.data.clientName }}
                    components={[<span key="client" className="font-semibold" />]}
                  />
                )}
              </p>

              <p className="text-fg/50 mt-3 text-xs">{t("oauthConsent.scopesLabel")}</p>
              <ul className="text-fg/70 mt-1 list-disc pl-5 text-xs">
                {pending.data.scopes.map((scope) => (
                  <li key={scope}>{scopeLabel(scope)}</li>
                ))}
              </ul>

              <div className={consentActions()}>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => deny.mutate({ grant }, { onSuccess: (result) => go(result.redirectUrl) })}
                >
                  {t("oauthConsent.deny")}
                </Button>
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => approve.mutate({ grant }, { onSuccess: (result) => go(result.redirectUrl) })}
                >
                  {t("oauthConsent.allow")}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
