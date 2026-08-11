import type { ReactNode } from "react";

export interface HashLinkProps {
  href: string;
  className?: string;
  children?: ReactNode;
}

export interface HashHrefParts {
  path: string;
  hash: string;
}
