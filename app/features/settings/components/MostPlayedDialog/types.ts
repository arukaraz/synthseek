import type { FollowBulkStatus } from "@hooks/api/queries/artist-follow/types";

export interface MostPlayedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface MostPlayedBodyProps {
  follow: (input: { names: string[]; autoRequest: boolean }) => Promise<boolean>;
  running: boolean;
  progress: FollowBulkStatus | null;
  onClose: () => void;
}
