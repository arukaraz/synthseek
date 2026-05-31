import { ADVANCED_ITEMS, TOP_LEVEL } from "./constants";

const ADMIN_ONLY_HREFS = [...TOP_LEVEL, ...ADVANCED_ITEMS].filter((item) => item.adminOnly).map((item) => item.href);

export function isAdminOnlySettingsPath(pathname: string): boolean {
  return ADMIN_ONLY_HREFS.some((href) => pathname === href || pathname.startsWith(`${href}/`));
}
