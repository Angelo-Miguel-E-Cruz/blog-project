import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPublishedPostBySlug } from "../../api/posts";
import { RichTextRenderer } from "../../components/RichTextRenderer";

export function PostPage() {
  const { slug = "" } = useParams();
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPublishedPostBySlug(slug),
  });

  if (isLoading) return <div className="text-center py-20 text-ink/50">Loading…</div>;
  if (isError || !post) {
    return (
      <div className="text-center py-20">
        <p className="text-ink/60 mb-4">This post doesn't exist or isn't published.</p>
        <Link to="/" className="text-mustard-dim">
          Back to all posts
        </Link>
      </div>
    );
  }

  return (
    <article>
      <Link to="/" className="text-sm text-ink/50 dark:text-parchment/50 no-underline hover:text-mustard-dim dark:hover:text-mustard">
        ← All posts
      </Link>

      <h1 className="font-display text-4xl font-bold mt-6 mb-3 leading-tight">{post.title}</h1>
      {post.publishedAt && (
        <p className="text-xs uppercase tracking-widest text-mustard-dim dark:text-mustard mb-8">
          {new Date(post.publishedAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}

      {post.featuredImageUrl && (
        <img src={post.featuredImageUrl} alt="" className="w-full rounded-sm mb-8 object-cover" />
      )}

      <RichTextRenderer content={post.content} />
    </article>
  );
}
