import { REVIEW_QUEUE_HASH } from "./constants";

export function hashRequestsReview(): boolean {
  return window.location.hash.slice(1) === REVIEW_QUEUE_HASH;
}
