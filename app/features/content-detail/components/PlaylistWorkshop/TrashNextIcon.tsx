import type { SVGProps } from "react";

export function TrashNextIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M2 8h10M5 8V5.5h4V8M3.5 8l.7 11h5.6l.7-11" />
      <path d="M15.5 9v7l5-3.5z" fill="currentColor" />
      <path d="M22.5 9v7" />
    </svg>
  );
}
