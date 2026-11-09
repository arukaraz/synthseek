export interface LibraryLoadMoreProps {
  scrollRoot: HTMLElement | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}
