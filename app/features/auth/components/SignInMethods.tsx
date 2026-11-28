"use client";

import { useTranslation } from "react-i18next";

import { Spinner } from "@components/ui/Spinner";
import { useSignInMethods } from "@hooks/api/queries/useSignInMethods";
import { useArrivalSearch } from "@hooks/ui/useArrivalSearch";

import { escapeHrefOf, signInPlanOf } from "../helpers";
import { useCallbackFailure } from "../hooks/useCallbackFailure";
import { useOidcSignIn } from "../hooks/useOidcSignIn";
import { authDivider, authDividerLabel, authDividerRule, signInLoading, signInMethodsColumn } from "../styles";
import { JellyfinSignIn } from "./JellyfinSignIn";
import { LocalSignInFold } from "./LocalSignInFold";
import { LoginForm } from "./LoginForm";
import { OidcRedirectNotice } from "./OidcRedirectNotice";
import { OidcSignInButton } from "./OidcSignInButton";
import { PlexLoginButton } from "./PlexLoginButton";
import { SignInFailureNotice } from "./SignInFailureNotice";
import { SignInNotice } from "./SignInNotice";

export function SignInMethods() {
  const { t } = useTranslation("auth");
  const search = useArrivalSearch();
  const { data, isPending } = useSignInMethods(search);
  const callbackFailure = useCallbackFailure();
  const plan = signInPlanOf(data);
  const oidc = useOidcSignIn(plan.autoRedirect !== null, !isPending);

  if (isPending) {
    return (
      <div className={signInLoading()}>
        <Spinner size="md" label={t("auth.methods.loading")} />
      </div>
    );
  }

  if (oidc.redirecting && plan.autoRedirect !== null && data !== undefined) {
    return (
      <OidcRedirectNotice label={plan.autoRedirect.label} escapeHref={escapeHrefOf(search, data.localEscapeParam)} />
    );
  }

  if (!plan.usable) return <SignInNotice tone="neutral">{t("auth.login.noMethods")}</SignInNotice>;

  const folded = plan.primary !== null && plan.local;

  return (
    <div className={signInMethodsColumn()}>
      {callbackFailure ? <SignInFailureNotice failure={callbackFailure} /> : null}

      {plan.external.map((method) => {
        if (method.id === "oidc") {
          return (
            <OidcSignInButton
              key={method.id}
              label={method.label}
              prominent={plan.primary?.id === method.id}
              phase={oidc.phase}
              failure={oidc.failure}
              onStart={oidc.begin}
            />
          );
        }
        if (method.id === "jellyfin") {
          return (
            <JellyfinSignIn
              key={method.id}
              label={method.label}
              initiallyOpen={!plan.local && plan.external.length === 1}
            />
          );
        }
        return <PlexLoginButton key={method.id} />;
      })}

      {plan.external.length > 0 && plan.local && !folded ? (
        <div className={authDivider()}>
          <span className={authDividerRule()} />
          <span className={authDividerLabel()}>{t("auth.login.dividerLabel")}</span>
          <span className={authDividerRule()} />
        </div>
      ) : null}

      {folded ? <LocalSignInFold /> : plan.local ? <LoginForm /> : null}
    </div>
  );
}
