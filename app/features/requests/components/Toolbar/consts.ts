import type { Variants } from "framer-motion";
import { Activity, CheckCircle, Layers, XCircle } from "lucide-react";
import { titleCase } from "@utils/formatters";
import { SORT_FIELD_VALUES } from "../../types";
import type { StatusFilterOption } from "./types";

export const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { value: "all", label: "All", icon: Layers },
  { value: "active", label: "Active", icon: Activity },
  { value: "done", label: "Done", icon: CheckCircle },
  { value: "failed", label: "Failed", icon: XCircle },
];

export const REQUESTS_SORT_OPTIONS = SORT_FIELD_VALUES.map((value) => ({
  value,
  label: titleCase(value),
}));

export const SEARCH_INPUT_VARIANTS: Variants = {
  hidden: { opacity: 0, width: 0, marginLeft: 0 },
  visible: {
    opacity: 1,
    width: "auto",
    marginLeft: 8,
    transition: {
      width: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.15, delay: 0.05 },
    },
  },
  exit: {
    opacity: 0,
    width: 0,
    marginLeft: 0,
    transition: {
      width: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.1 },
    },
  },
};

export const SEARCH_CLEAR_BUTTON_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};
