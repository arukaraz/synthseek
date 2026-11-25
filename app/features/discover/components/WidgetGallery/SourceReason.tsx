import { useTranslation } from "react-i18next";

import { sourceReasonWho, sourceReasonWhy } from "./styles";
import type { SourceReasonProps } from "./types";

export function SourceReason({ reason }: SourceReasonProps) {
  const { t } = useTranslation("widgets");
  return (
    <>
      <span className={sourceReasonWhy()}>{t(`gallery.sources.reasons.${reason}.why`)}</span>
      <span className={sourceReasonWho()}>{t(`gallery.sources.reasons.${reason}.who`)}</span>
    </>
  );
}
