"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { triggerHashTargetGlow } from "@utils/hash-target-glow";

import { splitHashHref } from "./helpers";
import type { HashLinkProps } from "./types";

export function HashLink({ href, className, children }: HashLinkProps) {
  const pathname = usePathname();
  const { path, hash } = splitHashHref(href);

  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        if (path === pathname) triggerHashTargetGlow(hash);
      }}
    >
      {children}
    </Link>
  );
}
