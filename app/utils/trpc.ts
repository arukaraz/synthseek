import { httpBatchLink, httpLink, httpSubscriptionLink, splitLink, type TRPCLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@api/__generated__/types";
import { observable } from "@trpc/server/observable";
import superjson from "superjson";

import { API_URL } from "@utils/env";
import { generateCorrelationId } from "@utils/correlationId";

export const trpc = createTRPCReact<AppRouter>();

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return API_URL;
}

const CORRELATION_ID_HEADER = "x-correlation-id";

/**
 * Adds `x-correlation-id: ${clientSessionId}/${randomUUID()}` to every mutation.
 * Queries and subscriptions do not receive the header — they carry no user
 * action to attribute back to this tab.
 */
function correlationIdLink(clientSessionId: string): TRPCLink<AppRouter> {
  return () =>
    ({ next, op }) =>
      observable((observer) => {
        const nextOp =
          op.type === "mutation"
            ? {
                ...op,
                context: {
                  ...op.context,
                  headers: {
                    ...(op.context?.headers as Record<string, string> | undefined),
                    [CORRELATION_ID_HEADER]: generateCorrelationId(clientSessionId),
                  },
                },
              }
            : op;

        return next(nextOp).subscribe(observer);
      });
}

export function getTRPCClientConfig(clientSessionId: string) {
  const baseUrl = `${getBaseUrl()}/api/v1/trpc`;

  return {
    links: [
      correlationIdLink(clientSessionId),
      splitLink({
        condition: (op) => op.type === "subscription",
        true: httpSubscriptionLink({ url: baseUrl, transformer: superjson }),
        false: splitLink({
          condition: (op) => op.context.skipBatch === true,
          true: httpLink({ url: baseUrl, transformer: superjson }),
          false: httpBatchLink({ url: baseUrl, transformer: superjson }),
        }),
      }),
    ],
  };
}
