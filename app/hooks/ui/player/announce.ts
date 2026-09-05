import { toast } from "sonner";

import type { PlayerNotice } from "@components/Player";

export function announce({ text, tone }: PlayerNotice): void {
  if (tone === "danger") toast.error(text);
  else if (tone === "warning") toast.warning(text);
  else toast.info(text);
}
