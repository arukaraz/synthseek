import { describe, expect, it, vi } from "vitest";

import { useJobs } from "../useJobs";

const useQuery = vi.fn();

vi.mock("@utils/trpc", () => ({
  trpc: { jobs: { list: { useQuery: (input: unknown, opts: unknown) => useQuery(input, opts) } } },
}));

type JobFlags = { running: boolean; listed: boolean; enabled: boolean };

const job = (over: Partial<JobFlags> = {}): JobFlags => ({ running: false, listed: true, enabled: true, ...over });

const intervalFrom = (data: JobFlags[] | undefined): number => {
  const [, options] = useQuery.mock.calls.at(-1);
  return options.refetchInterval({ state: { data } });
};

describe("useJobs", () => {
  it("polls slowly while nothing is running", () => {
    useJobs();
    expect(intervalFrom([job(), job()])).toBe(60_000);
  });

  it("polls faster while a job the page actually shows is running", () => {
    useJobs();
    expect(intervalFrom([job(), job({ running: true })])).toBe(8_000);
  });

  it("stays above the background gate's quiet window so an open panel cannot starve the scan it watches", () => {
    useJobs();
    expect(intervalFrom([job({ running: true })])).toBeGreaterThan(5_000);
  });

  it("ignores a running job the page does not render, so an unlisted job cannot engage the fast poll", () => {
    useJobs();
    expect(intervalFrom([job({ running: true, listed: false })])).toBe(60_000);
    expect(intervalFrom([job({ running: true, enabled: false })])).toBe(60_000);
  });

  it("polls slowly before the first response has arrived", () => {
    useJobs();
    expect(intervalFrom(undefined)).toBe(60_000);
  });
});
