import type { CSSProperties } from "react";

export const gridBackgroundStyle: CSSProperties = {
  backgroundImage: `
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
  `,
  backgroundSize: "50px 50px",
};
