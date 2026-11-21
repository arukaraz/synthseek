import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { getQueryKey } from "@trpc/react-query";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { trpc } from "@utils/trpc";

import { useForgetTheme } from "../useThemeQueries";

const STATE_KEY = getQueryKey(trpc.theme.state, undefined, "query");
const FILES_KEY = getQueryKey(trpc.theme.files, undefined, "query");
const HISTORY_KEY = getQueryKey(trpc.theme.history, { path: "custom.css" }, "query");
const ACCOUNT_KEY = getQueryKey(trpc.auth.me, undefined, "query");

function setup() {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useForgetTheme(), { wrapper });
  return { queryClient, forget: result.current };
}

describe("useForgetTheme", () => {
  it("drops every answer the theme router gave and leaves the other routers alone", async () => {
    const { queryClient, forget } = setup();
    queryClient.setQueryData(STATE_KEY, { theme: "custom" });
    queryClient.setQueryData(FILES_KEY, { files: ["custom.css"] });
    queryClient.setQueryData(HISTORY_KEY, [{ id: "v1" }]);
    queryClient.setQueryData(ACCOUNT_KEY, { id: "u1" });

    await act(() => forget());

    expect(queryClient.getQueryData(STATE_KEY)).toBeUndefined();
    expect(queryClient.getQueryData(FILES_KEY)).toBeUndefined();
    expect(queryClient.getQueryData(HISTORY_KEY)).toBeUndefined();
    expect(queryClient.getQueryData(ACCOUNT_KEY)).toEqual({ id: "u1" });
  });
});
