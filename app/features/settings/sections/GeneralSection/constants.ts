import { Moon, Sparkles, Waves } from "lucide-react";

import type { RovingNavKey, ThemeOption } from "./types";

export const THEME_CARD = {
  title: "Theme",
  description: "Pick the theme that matches your environment.",
  groupLabel: "Color theme",
} as const;

export const THEME_OPTIONS: ReadonlyArray<ThemeOption> = [
  { value: "dark", label: "Synthseek", icon: Moon, preview: "dark" },
  { value: "midnight", label: "Midnight", icon: Sparkles, preview: "midnight" },
  { value: "ocean", label: "Ocean", icon: Waves, preview: "ocean" },
];

export const ROVING_KEYS: ReadonlyArray<RovingNavKey> = [
  "ArrowRight",
  "ArrowDown",
  "ArrowLeft",
  "ArrowUp",
  "Home",
  "End",
];

export const API_CARD = {
  title: "API",
  description: "Programmatic access to Synthseek: create keys for your apps and connect AI assistants over MCP.",
} as const;

export const API_KEYS_SUB = {
  title: "API Keys",
  description: "",
  empty: "No API keys yet. Create one to connect an app or assistant.",
  loading: "Loading keys…",
  newKey: "New key",
} as const;

export const CREATE_KEY_DIALOG = {
  title: "Create API key",
  description: "Give it a name so you can recognize it later (for example, the device or app it lives on).",
  namePlaceholder: "Claude Desktop",
  create: "Create key",
  revealTitle: "Key created",
  revealWarning: "Copy it now. For your security, you will not be able to see it again.",
  copy: "Copy key",
  copied: "Copied",
  done: "Done",
} as const;

export const REVOKE_KEY_DIALOG = {
  title: "Revoke API key",
  message: "Any assistant using this key will immediately lose access. This cannot be undone.",
  confirm: "Revoke",
} as const;

export const MCP_SUB = {
  title: "MCP",
  description: "Connect an AI assistant (Claude, Cursor...) to Synthseek over the Model Context Protocol.",
  endpointLabel: "MCP endpoint",
  endpointHelper: "Add this URL as a custom connector or MCP server in your assistant.",
  copied: "Endpoint copied",
  connectTitle: "Two ways to connect",
  oauthLabel: "Sign in (OAuth)",
  oauthBody:
    "For claude.ai web and native connectors. Add the endpoint as a custom connector and sign in with your Synthseek account. No key needed, and access follows your role.",
  keyLabel: "API key",
  keyBody:
    "For Claude Code, Cursor, or Claude Desktop (via mcp-remote). Create a key above and send it as the bearer token: Authorization: Bearer <your key>.",
} as const;
