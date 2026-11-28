export interface ScrollRegionProps {
  role?: "region";
  tabIndex?: 0;
  "aria-label"?: string;
}

export function scrollRegionProps(overflowing: boolean, label: string): ScrollRegionProps {
  return overflowing ? { role: "region", tabIndex: 0, "aria-label": label } : {};
}
