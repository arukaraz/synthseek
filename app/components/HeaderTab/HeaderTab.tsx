"use client";

import Link from "next/link";

import { headerTab } from "../TopHeader/styles";
import type { HeaderTabProps } from "./types";

export function HeaderTab({ href, icon: Icon, label, isActive }: HeaderTabProps) {
  return (
    <Link href={href} prefetch aria-current={isActive ? "page" : undefined} className={headerTab({ active: isActive })}>
      <Icon aria-hidden />
      <span>{label}</span>
    </Link>
  );
}
