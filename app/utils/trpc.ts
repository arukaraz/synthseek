import { httpBatchLink, httpLink, httpSubscriptionLink, splitLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@api/__generated__/types";
import superjson from "superjson";
import { API_URL } from "@utils/env";

export const trpc = createTRPCReact<AppRouter>();

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return API_URL;
}

export function getTRPCClientConfig() {
  const baseUrl = `${getBaseUrl()}/api/v1/trpc`;

  return {
    links: [
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
