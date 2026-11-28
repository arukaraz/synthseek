"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { InlineError } from "@components/ui/InlineError";
import { Notice } from "@components/ui/Notice";
import { useOidcLinkStart } from "@hooks/api/mutations/auth/useOidcFlow";
import { useUnlinkIdentity } from "@hooks/api/mutations/auth/useSignInIdentityMutations";
import { usePlaybackSourceAccounts } from "@hooks/api";
import { useSignInIdentities } from "@hooks/api/queries/useSignInIdentities";
import { useSignInMethods } from "@hooks/api/queries/useSignInMethods";
import { confirm } from "@utils/confirm";

import { SettingsCard } from "../../../components/SettingsCard";
import { SETTINGS_PAGE_BY_ID } from "../../../constants";
import { PLEX_SERVICES_HREF } from "../constants";
import { identityOf } from "../helpers";
import { useLinkCallback } from "../hooks/useLinkCallback";
import { waysInList, waysInNote } from "../styles";
import type { SignInIdentityView } from "../types";
import { LinkJellyfinDialog } from "./LinkJellyfinDialog";
import { WayInRow } from "./WayInRow";

export function WaysInCard() {
  const { t } = useTranslation("settings");
  const identitiesQuery = useSignInIdentities();
  const methods = useSignInMethods();
  const sourceAccounts = usePlaybackSourceAccounts();
  const linkOidc = useOidcLinkStart();
  const unlink = useUnlinkIdentity();
  const callback = useLinkCallback();
  const [jellyfinOpen, setJellyfinOpen] = useState(false);

  const data = identitiesQuery.data;
  if (!data) return null;

  const oidcMethod = methods.data?.methods.find((method) => method.id === "oidc") ?? null;
  const oidcLabel = oidcMethod?.label ?? t("members.signsIn.oidcFallback");
  const plex = identityOf(data.identities, "plex");
  const oidc = identityOf(data.identities, "oidc");
  const jellyfin = identityOf(data.identities, "jellyfin");
  const jellyfinAvailable =
    methods.data?.methods.some((method) => method.id === "jellyfin") === true ||
    (sourceAccounts.data ?? []).some((account) => account.server === "jellyfin");
  const lastWayIn = !data.hasPassword && data.identities.length === 1;
  const statusOf = (identity: SignInIdentityView | null) => {
    if (identity === null) return t("profile.waysIn.notLinked");
    const name = identity.username ?? identity.email;
    return name ? t("profile.waysIn.linkedAs", { name }) : t("profile.waysIn.linked");
  };

  const handleUnlink = async (identity: SignInIdentityView, method: string) => {
    const confirmed = await confirm({
      title: t("profile.waysIn.unlinkTitle", { method }),
      message: t("profile.waysIn.unlinkMessage", { method }),
      variant: "danger",
      confirmText: t("profile.waysIn.unlinkConfirm"),
    });
    if (confirmed) unlink.mutate({ identityId: identity.id });
  };

  const unlinkButton = (identity: SignInIdentityView, method: string) =>
    lastWayIn ? null : (
      <Button
        variant="outline"
        size="sm"
        onClick={() => void handleUnlink(identity, method)}
        disabled={unlink.isPending}
        aria-label={t("profile.waysIn.unlinkLabel", { method })}
      >
        {t("profile.waysIn.unlink")}
      </Button>
    );

  return (
    <SettingsCard title={t("profile.waysIn.title")} description={t("profile.waysIn.description")} anchor="waysIn">
      {callback.linked ? (
        <Notice variant="success" title={t("profile.waysIn.linkedNotice", { method: oidcLabel })} />
      ) : null}
      {callback.failure ? (
        <Notice variant="danger" title={callback.failure.title}>
          {callback.failure.description}
        </Notice>
      ) : null}

      <ul className={waysInList()}>
        <WayInRow
          name={t("profile.waysIn.password")}
          status={data.hasPassword ? t("profile.waysIn.passwordSet") : t("profile.waysIn.passwordNone")}
        />

        <WayInRow name={t("members.signsIn.plex")} status={statusOf(plex)}>
          <Button variant="outline" size="sm" asChild>
            <Link href={PLEX_SERVICES_HREF}>{t("profile.waysIn.plexManage")}</Link>
          </Button>
        </WayInRow>

        {oidc !== null || oidcMethod !== null ? (
          <WayInRow name={oidcLabel} status={statusOf(oidc)}>
            {oidc !== null ? (
              unlinkButton(oidc, oidcLabel)
            ) : (
              <Button
                size="sm"
                onClick={() => linkOidc.mutate({ returnTo: SETTINGS_PAGE_BY_ID.account.href })}
                disabled={linkOidc.isPending || linkOidc.isSuccess}
              >
                {t("profile.waysIn.link")}
              </Button>
            )}
          </WayInRow>
        ) : null}

        {jellyfin !== null || jellyfinAvailable ? (
          <WayInRow name={t("members.signsIn.jellyfin")} status={statusOf(jellyfin)}>
            {jellyfin !== null ? (
              unlinkButton(jellyfin, t("members.signsIn.jellyfin"))
            ) : (
              <Button size="sm" onClick={() => setJellyfinOpen(true)}>
                {t("profile.waysIn.link")}
              </Button>
            )}
          </WayInRow>
        ) : null}
      </ul>

      {lastWayIn ? <p className={waysInNote()}>{t("profile.waysIn.lastWayIn")}</p> : null}
      <InlineError error={unlink.error} />

      <LinkJellyfinDialog open={jellyfinOpen} onOpenChange={setJellyfinOpen} />
    </SettingsCard>
  );
}
