import { useTranslation } from "react-i18next";

import { downloadSourceLabelKey } from "@utils/download-source";

export function useDownloadSourceLabel(): (source: string) => string {
  const { t } = useTranslation("settings");
  return (source) => {
    const labelKey = downloadSourceLabelKey(source);
    return labelKey ? t(labelKey) : source;
  };
}
