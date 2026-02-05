import { vi } from "vitest";

export interface MockQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
  isFetching: boolean;
  isSuccess: boolean;
}

export interface MockMutationResult {
  mutate: ReturnType<typeof vi.fn>;
  mutateAsync: ReturnType<typeof vi.fn>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: ReturnType<typeof vi.fn>;
  isSuccess: boolean;
}

export function createMockQuery<T>(
  data: T,
  overrides: Partial<MockQueryResult<T>> = {}
): MockQueryResult<T> {
  return {
    data,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn().mockResolvedValue({ data }),
    isFetching: false,
    isSuccess: true,
    ...overrides,
  };
}

export function createMockMutation(
  overrides: Partial<MockMutationResult> = {}
): MockMutationResult {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
    isSuccess: false,
    ...overrides,
  };
}

export function createLoadingQuery<T>(): MockQueryResult<T> {
  return createMockQuery<T>(undefined as T, {
    isLoading: true,
    data: undefined,
    isSuccess: false,
  });
}

export function createErrorQuery<T>(error: Error): MockQueryResult<T> {
  return createMockQuery<T>(undefined as T, {
    isError: true,
    error,
    data: undefined,
    isSuccess: false,
  });
}

export function createSuccessMutation(): MockMutationResult {
  return createMockMutation({
    isSuccess: true,
  });
}

export function createPendingMutation(): MockMutationResult {
  return createMockMutation({
    isPending: true,
  });
}

export function createErrorMutation(error: Error): MockMutationResult {
  return createMockMutation({
    isError: true,
    error,
  });
}

export const createMockTrpcUtils = () => ({
  requests: {
    getAll: {
      invalidate: vi.fn().mockResolvedValue(undefined),
      setData: vi.fn(),
      getData: vi.fn().mockReturnValue([]),
    },
    getLibrarySummary: {
      invalidate: vi.fn().mockResolvedValue(undefined),
    },
  },
  spotify: {
    search: {
      invalidate: vi.fn().mockResolvedValue(undefined),
    },
    getCategories: {
      invalidate: vi.fn().mockResolvedValue(undefined),
    },
  },
});
