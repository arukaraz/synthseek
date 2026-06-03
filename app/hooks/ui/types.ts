export type SetupRedirectContext = "app" | "login" | "setup";

export type SetupGate = { status: "resolving" } | { status: "error" } | { status: "redirecting" } | { status: "ready" };
