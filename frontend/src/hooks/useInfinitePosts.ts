import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPublishedPosts } from "../api/posts";

/**
 * Drives the homepage infinite scroll (FR-002) via React Query's cursor
 * pagination support — pairs directly with the backend's opaque cursor.
 */
export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ["published-posts"],
    queryFn: ({ pageParam }) => fetchPublishedPosts(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor ?? undefined : undefined),
  });
}
