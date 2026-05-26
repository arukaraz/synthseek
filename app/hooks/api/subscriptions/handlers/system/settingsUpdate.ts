import type { SettingsUpdatePayload } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

type TrpcUtils = ReturnType<typeof trpc.useUtils>;

export function handleSettingsUpdate(_event: SettingsUpdatePayload, utils: TrpcUtils): void {
  utils.settings.get.invalidate();
}
