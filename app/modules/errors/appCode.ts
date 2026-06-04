import { z } from "zod";

import enErrors from "@locale/messages/en/errors.json";

export type AppErrorCode = keyof typeof enErrors;

const APP_ERROR_CODES = Object.keys(enErrors);

const appCodeEnvelopeSchema = z.object({
  data: z
    .object({
      appCode: z.string().nullish(),
    })
    .nullish(),
});

function isKnownAppErrorCode(value: string): value is AppErrorCode {
  return APP_ERROR_CODES.includes(value);
}

export function extractAppCode(error: unknown): AppErrorCode | null {
  const parsed = appCodeEnvelopeSchema.safeParse(error);
  if (!parsed.success) return null;
  const code = parsed.data.data?.appCode;
  if (!code) return null;
  return isKnownAppErrorCode(code) ? code : null;
}
