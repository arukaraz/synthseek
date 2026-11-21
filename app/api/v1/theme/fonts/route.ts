import { streamUploadToApi, uploadUnreachable } from "@api/upload-proxy";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    return await streamUploadToApi(request, "/api/v1/theme/fonts");
  } catch (error) {
    console.error("Theme font upload proxy error:", error);
    return uploadUnreachable();
  }
}

export const dynamic = "force-dynamic";
