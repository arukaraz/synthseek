import type { FactItem } from "../../types";

export interface DetailsFactsProps {
  facts: FactItem[];
}

export interface FactListProps {
  label: string;
  items: string[];
}
