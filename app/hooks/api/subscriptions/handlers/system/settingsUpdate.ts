import { throttledInvalidation } from "../../shared/throttledInvalidation";

const settings = throttledInvalidation((utils) => {
  void utils.settings.get.invalidate();
});

export const handleSettingsUpdate = settings.run;
