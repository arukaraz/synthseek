import { Moon, Sparkles, Sun, Waves } from "lucide-react";

export const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "midnight", label: "Midnight", icon: Sparkles },
  { value: "ocean", label: "Ocean", icon: Waves },
] as const;

export const PUBLIC_URL_CARD = {
  title: "Public URL",
  description: "The public address this instance is reached at. Used to build external links like the MCP endpoint.",
  label: "Public base URL",
  helper: "Leave empty to use the address you are currently browsing from.",
  placeholder: "https://synthseek.example.com",
} as const;

export const API_CARD = {
  title: "API",
  description: "",
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
  auth: "Send your key as: Authorization: Bearer <your key>",
  copied: "Endpoint copied",
} as const;
