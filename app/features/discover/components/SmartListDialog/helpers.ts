import i18n from "@locale";

import type { SetNote } from "@hooks/api/queries/widgets/types";
import { formatDateTime } from "@utils/formatters";

export function noteText(note: SetNote): string {
  switch (note.kind) {
    case "analyzedOnly":
      return i18n.t("discover:smartList.notes.analyzedOnly", { used: note.used, of: note.of });
    case "windowRelaxed":
      return i18n.t("discover:smartList.notes.windowRelaxed", { days: note.days });
    case "capRaised":
      return i18n.t("discover:smartList.notes.capRaised", { to: note.to });
    case "capLifted":
      return i18n.t("discover:smartList.notes.capLifted");
  }
}

export function dateText(value: Date | string | null): string {
  if (value === null) return i18n.t("discover:smartList.never");
  return formatDateTime(new Date(value));
}
