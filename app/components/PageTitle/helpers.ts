import { PAGE_TITLE_ROUTES } from "./constants";
import type { PageTitleRoute } from "./types";

function coversPath(route: PageTitleRoute, pathname: string): boolean {
  if (pathname === route.path) return true;
  return !route.exact && pathname.startsWith(`${route.path}/`);
}

export function pageTitleRouteFor(pathname: string): PageTitleRoute | null {
  const covering = PAGE_TITLE_ROUTES.filter((route) => coversPath(route, pathname));
  const exact = covering.find((route) => route.exact);
  if (exact !== undefined) return exact;
  return covering.reduce<PageTitleRoute | null>(
    (best, route) => (best === null || route.path.length > best.path.length ? route : best),
    null
  );
}
