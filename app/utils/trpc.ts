import { httpBatchLink, httpLink, httpSubscriptionLink, splitLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@api/__generated__/types";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return `http://localhost:${process.env.API_PORT || "4401"}`;
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
