import { render, RenderOptions, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { ReactElement, ReactNode } from "react";

export * from "@testing-library/react";
export { userEvent };

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });

interface WrapperOptions {
  queryClient?: QueryClient;
}

export function createWrapper(options: WrapperOptions = {}) {
  const queryClient = options.queryClient ?? createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
}

export function renderWithProviders(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { queryClient, ...renderOptions } = options;
  return {
    user: userEvent.setup(),
    ...render(ui, {
      wrapper: createWrapper({ queryClient }),
      ...renderOptions,
    }),
  };
}

export function renderWithUser(ui: ReactElement, options?: RenderOptions) {
  return {
    user: userEvent.setup(),
    ...render(ui, options),
  };
}

export function renderHookWithProviders<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options: { queryClient?: QueryClient; initialProps?: TProps } = {}
) {
  const { queryClient, initialProps } = options;
  return renderHook(hook, {
    wrapper: createWrapper({ queryClient }),
    initialProps,
  });
}
