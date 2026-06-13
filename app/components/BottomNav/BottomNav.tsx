"use client";

import { usePrimaryNav } from "@hooks/ui/usePrimaryNav";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { UserAvatarMenu } from "../UserAvatarMenu";
import { bottomNavContainer, bottomNavItem, bottomNavLabel, bottomNavList, bottomNavUnderline } from "./styles";

export function BottomNav() {
  const { t } = useTranslation("components");
  const navItems = usePrimaryNav();

  return (
    <nav aria-label={t("header.mobileNav")} className={bottomNavContainer()} data-cy="bottom-nav">
      <ul className={bottomNavList()}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex min-w-0 flex-1">
              <Link
                href={item.href}
                prefetch
                aria-label={item.label}
                aria-current={item.isActive ? "page" : undefined}
                className={bottomNavItem({ active: item.isActive })}
              >
                {item.isActive ? (
                  <motion.span layoutId="bottom-nav-underline" className={bottomNavUnderline()} />
                ) : null}
                <Icon />
                <span className={bottomNavLabel()}>{item.label}</span>
              </Link>
            </li>
          );
        })}

        <li className="flex min-w-0 flex-1 items-center justify-center pb-1">
          <UserAvatarMenu />
        </li>
      </ul>
    </nav>
  );
}
