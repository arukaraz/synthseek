"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { headerTab, headerTabBadge, headerTabUnderline } from "../TopHeader/styles";
import type { HeaderTabProps } from "./types";

export function HeaderTab({ href, icon: Icon, label, isActive, badge }: HeaderTabProps) {
  return (
    <Link
      href={href}
      prefetch
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      className={headerTab({ active: isActive })}
    >
      <Icon />
      <span className="hidden font-medium md:inline">{label}</span>
      {badge !== undefined && badge > 0 ? <span className={headerTabBadge()}>{badge}</span> : null}
      {isActive ? <motion.span layoutId="header-tab-underline" className={headerTabUnderline()} /> : null}
    </Link>
  );
}
