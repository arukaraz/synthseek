"use client";

import { Notice } from "@components/ui/Notice";
import { cn } from "@utils/cn";

import {
  sectionCount,
  sectionDivider,
  sectionHeaderRow,
  sectionRoot,
  sectionSkeleton,
  sectionTitle,
  sectionTrailing,
} from "../../styles";
import type { DetailSectionProps } from "../../types";

export function DetailSection({
  title,
  isLoading,
  isEmpty = false,
  skeletonHeight,
  count,
  inlineSlot,
  trailingSlot,
  children,
  errorMessage,
}: DetailSectionProps) {
  if (errorMessage) {
    return (
      <section className={sectionRoot()}>
        <h3 className={sectionTitle()}>{title}</h3>
        <Notice variant="danger" title={errorMessage} />
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className={sectionRoot()}>
        <h3 className={sectionTitle()}>{title}</h3>
        <div className={cn(sectionSkeleton(), skeletonHeight ?? "h-40")} />
      </section>
    );
  }

  if (isEmpty) return null;

  return (
    <section className={sectionRoot()}>
      <div className={sectionHeaderRow()}>
        <h3 className={sectionTitle()}>{title}</h3>
        {count !== undefined && count !== null ? <span className={sectionCount()}>{count}</span> : null}
        {inlineSlot}
        <span aria-hidden className={sectionDivider()} />
        {trailingSlot ? <div className={sectionTrailing()}>{trailingSlot}</div> : null}
      </div>
      {children}
    </section>
  );
}
