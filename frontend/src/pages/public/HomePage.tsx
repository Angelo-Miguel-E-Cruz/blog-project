import { useEffect, useRef } from "react";
import { useInfinitePosts } from "../../hooks/useInfinitePosts";
import { PostCard } from "../../components/PostCard";

export function HomePage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfinitePosts();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Detects when the visitor approaches the end of loaded posts and requests the next batch (FR-002).
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (isLoading) return <div className="text-center py-20 text-ink/50">Loading posts…</div>;
  if (isError) return <div className="text-center py-20 text-ink/50">Couldn't load posts. Try refreshing.</div>;

  if (posts.length === 0) {
    return <div className="text-center py-20 text-ink/50">No posts published yet — check back soon.</div>;
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && <p className="text-center py-8 text-ink/50 text-sm">Loading more…</p>}
      {!hasNextPage && posts.length > 0 && (
        <p className="text-center py-8 text-ink/40 text-sm">You've reached the end.</p>
      )}
    </div>
  );
}
