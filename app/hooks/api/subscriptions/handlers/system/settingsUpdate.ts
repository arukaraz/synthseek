import { throttledInvalidation } from "../../shared/throttledInvalidation";

interface SettingsReader {
  settings: { get: { invalidate: () => unknown } };
}

const settings = throttledInvalidation<SettingsReader>((utils) => {
  void utils.settings.get.invalidate();
});

export const handleSettingsUpdate = settings.run;
