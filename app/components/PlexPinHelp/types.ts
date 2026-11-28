import type { PlexPinPhase, PlexPinSession } from "@hooks/ui/types";

export interface PlexPinHelpProps {
  session: PlexPinSession | null;
  phase: PlexPinPhase;
}
