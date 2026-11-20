import { streamUploadToApi, uploadUnreachable } from "@api/upload-proxy";
import type { NextRequest } from "next/server";

interface CoverRouteContext {
  params: Promise<{ playlistId: string }>;
}

export async function POST(request: NextRequest, context: CoverRouteContext): Promise<Response> {
  const { playlistId } = await context.params;
  try {
    return await streamUploadToApi(request, `/api/v1/playlist-covers/${encodeURIComponent(playlistId)}`);
  } catch (error) {
    console.error("Playlist cover upload proxy error:", error);
    return uploadUnreachable();
  }
}

export const dynamic = "force-dynamic";
