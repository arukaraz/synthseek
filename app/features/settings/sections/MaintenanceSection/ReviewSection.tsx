"use client";

import { ReviewContent } from "@features/import-review";

import { MaintenancePage } from "./MaintenancePage";

export function ReviewSection() {
  return (
    <MaintenancePage surface="review">
      <ReviewContent />
    </MaintenancePage>
  );
}
