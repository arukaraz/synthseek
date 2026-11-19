import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpLink } from "@trpc/client";
import type { ReactNode } from "react";
import superjson from "superjson";

import { trpc } from "@utils/trpc";

type Handler = (input: unknown) => unknown;

export interface FakeCall {
  procedure: string;
  input: unknown;
}

export class FakeServerFailure extends Error {}

export class FakeFollowServer {
  readonly calls: FakeCall[] = [];
  private readonly handlers = new Map<string, Handler>();

  on(procedure: string, handler: Handler): this {
    this.handlers.set(procedure, handler);
    return this;
  }

  callsTo(procedure: string): FakeCall[] {
    return this.calls.filter((call) => call.procedure === procedure);
  }

  readonly fetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const href = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(href);
    const procedure = url.pathname.split("/").pop() ?? "";
    const raw = init?.method === "POST" ? init.body : url.searchParams.get("input");
    const parsed: unknown = typeof raw === "string" ? superjson.deserialize(JSON.parse(raw)) : undefined;
    this.calls.push({ procedure, input: parsed });
    const handler = this.handlers.get(procedure);
    if (!handler) return json({ error: failure("no handler for " + procedure) }, 404);
    try {
      return json({ result: { data: superjson.serialize(await handler(parsed)) } }, 200);
    } catch (error) {
      if (error instanceof FakeServerFailure) return json({ error: failure(error.message) }, 500);
      throw error;
    }
  };

  wrapper(): (props: { children: ReactNode }) => ReactNode {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const client = trpc.createClient({
      links: [httpLink({ url: "http://localhost/api/v1/trpc", transformer: superjson, fetch: this.fetch })],
    });
    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <trpc.Provider client={client} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </trpc.Provider>
      );
    };
  }
}

function failure(message: string) {
  return superjson.serialize({
    message,
    code: -32603,
    data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500, appCode: null, appParams: null, zodError: null },
  });
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
