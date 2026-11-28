import type { ParseKeys } from "i18next";

import type { OidcTestFailure } from "./types";

export const SERVER_PRESET_HREF = "/settings/download/engine#engine.requestPreset";

export const OIDC_CALLBACK_PATH = "/api/v1/auth/oidc/callback";

export const OIDC_TEST_FAILURE_KEYS: Readonly<Record<OidcTestFailure, ParseKeys<"settings">>> = {
  notConfigured: "members.oidc.failures.notConfigured",
  addressRefused: "members.oidc.failures.addressRefused",
  unreachable: "members.oidc.failures.unreachable",
  timeout: "members.oidc.failures.timeout",
  notAnIssuer: "members.oidc.failures.notAnIssuer",
  issuerMismatch: "members.oidc.failures.issuerMismatch",
  noAuthorizationEndpoint: "members.oidc.failures.noAuthorizationEndpoint",
  noTokenEndpoint: "members.oidc.failures.noTokenEndpoint",
  codeFlowUnsupported: "members.oidc.failures.codeFlowUnsupported",
  noUsableSigningAlgorithm: "members.oidc.failures.noUsableSigningAlgorithm",
  jwksUnreachable: "members.oidc.failures.jwksUnreachable",
  jwksInvalid: "members.oidc.failures.jwksInvalid",
  unexpected: "members.oidc.failures.unexpected",
};
