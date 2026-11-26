import type { APIRoute } from "astro";

import { CHANNEL_MANIFEST } from "../lib/site";

export const GET: APIRoute = () =>
  new Response(JSON.stringify(CHANNEL_MANIFEST), { headers: { "Content-Type": "application/json" } });
