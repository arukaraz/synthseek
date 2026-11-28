import type { AppRouter } from "@api/__generated__/types";
import type { inferRouterOutputs } from "@trpc/server";
import type { ReactNode } from "react";

export interface AuthTransitionValue {
  isNavigating: boolean;
  markNavigating: () => void;
}

export type SignInMethodsData = inferRouterOutputs<AppRouter>["auth"]["signInMethods"];

export type SignInMethod = SignInMethodsData["methods"][number];

export interface SignInPlan {
  external: SignInMethod[];
  local: boolean;
  usable: boolean;
  primary: SignInMethod | null;
  autoRedirect: SignInMethod | null;
}

export interface FailureMessage {
  title: string;
  description?: string;
}

export type SignInFailure =
  | { kind: "throttled"; retryAfterSeconds: number }
  | { kind: "needsSetup" }
  | { kind: "pendingApproval" }
  | ({ kind: "message" } & FailureMessage);

export type PlexFailure = { kind: "needsSetup" } | { kind: "pendingApproval" } | ({ kind: "message" } & FailureMessage);

export type CallbackFailure = { kind: "pendingApproval" } | ({ kind: "message" } & FailureMessage);

export type LoginAttemptState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "rejected"; message: FailureMessage }
  | { kind: "pendingApproval" }
  | { kind: "throttled"; deadline: number; retryAfterSeconds: number }
  | { kind: "released" };

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface JellyfinCredentials {
  username: string;
  password: string;
}

export interface SignInAttemptOptions<Credentials> {
  run: (credentials: Credentials) => Promise<unknown>;
  invalidCredentialsTitle: string;
}

export interface SignInFailureNoticeProps {
  failure: CallbackFailure;
  id?: string;
}

export interface SignInAttemptNoticesProps {
  state: LoginAttemptState;
  noticeId: string;
}

export type OidcSignInPhase = "idle" | "pending" | "error";

export interface OidcSignInButtonProps {
  label: string;
  prominent: boolean;
  phase: OidcSignInPhase;
  failure: CallbackFailure | null;
  onStart: () => void;
}

export interface OidcRedirectNoticeProps {
  label: string;
  escapeHref: string;
}

export interface JellyfinSignInProps {
  label: string;
  initiallyOpen: boolean;
}

export interface JellyfinSignInFormProps {
  id: string;
}

export type SignInNoticeTone = "error" | "neutral";

export interface SignInNoticeProps {
  tone: SignInNoticeTone;
  id?: string;
  children: ReactNode;
}

export interface ThrottleNoticeProps {
  deadline: number;
  retryAfterSeconds: number;
}
