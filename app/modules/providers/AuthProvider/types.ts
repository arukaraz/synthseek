import type { PublicUser } from "@api/__generated__/types";

export interface AuthContextValue {
  currentUser: PublicUser | null;
  isLoading: boolean;
  isError: boolean;
  isAdmin: boolean;
  refetch: () => void;
}
