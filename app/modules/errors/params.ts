import { formatBytes, formatDateTime } from "@utils/formatters";

import type { AppErrorCode } from "./appCode";
import { ERROR_META } from "./constants";
import type { AppErrorParams, ErrorParamFormat } from "./types";

function formatParam(format: ErrorParamFormat | undefined, value: string | number): string | number {
  if (format === "bytes" && typeof value === "number") return formatBytes(value);
  if (format === "dateTime" && typeof value === "string") {
    const instant = new Date(value);
    return Number.isNaN(instant.getTime()) ? value : formatDateTime(instant);
  }
  return value;
}

export function formatErrorParams(appCode: AppErrorCode, params: AppErrorParams | null): AppErrorParams {
  if (params === null) return {};
  const formats = ERROR_META[appCode]?.params ?? {};
  return Object.fromEntries(Object.entries(params).map(([name, value]) => [name, formatParam(formats[name], value)]));
}
