export interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
  lowLabel: string;
  highLabel: string;
  className?: string;
}
