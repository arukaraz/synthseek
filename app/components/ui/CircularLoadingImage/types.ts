import type { RequestStatus } from "@api/__generated__/types";

export interface CircularLoadingImageProps {
  src?: string | null;
  alt: string;
  status: RequestStatus;
  size?: "sm" | "md";
  className?: string;
}
