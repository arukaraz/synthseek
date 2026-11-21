import { THEME_BOOT_SCRIPT, THEME_SHEET_ID } from "./constants";
import { sheetHref } from "./helpers";
import type { ThemeBoot } from "./types";

export function ThemeHead({ boot }: { boot: ThemeBoot }) {
  return (
    <>
      {boot.fingerprint !== null ? (
        <link id={THEME_SHEET_ID} rel="stylesheet" href={sheetHref(boot.fingerprint)} suppressHydrationWarning />
      ) : null}
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
    </>
  );
}
