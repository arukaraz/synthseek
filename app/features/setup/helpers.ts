import { ADMIN_EMAIL_SCHEMA } from "./constants";

const TIMEOUT_MARKER = "timed out";

export function isPlexTimeoutMessage(message: string): boolean {
  return message.toLowerCase().includes(TIMEOUT_MARKER);
}

export function isValidAdminEmail(value: string): boolean {
  return ADMIN_EMAIL_SCHEMA.safeParse(value).success;
}
