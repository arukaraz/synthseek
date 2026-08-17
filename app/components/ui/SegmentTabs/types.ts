export interface SegmentTabItem<TValue extends string> {
  value: TValue;
  label: string;
  count?: number;
}

export interface SegmentTabsProps<TValue extends string> {
  items: SegmentTabItem<TValue>[];
  value: TValue;
  onValueChange: (value: TValue) => void;
  layoutId: string;
  ariaLabel: string;
  className?: string;
}
