import { Link } from "react-router-dom";
import type { PostSummary } from "../types/post";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="group border-b border-ink/10 dark:border-parchment/10 py-8 first:pt-0">
      <Link to={`/blog/${post.slug}`} className="no-underline select-none">
        <div className="flex gap-6 items-start">
          {post.featuredImageUrl && (
            <img
              src={post.featuredImageUrl}
              alt=""
              className="w-28 h-28 object-cover rounded-sm shrink-0 hidden sm:block"
              loading="lazy"
            />
          )}
          <div>
            <p className="text-xs uppercase tracking-widest text-mustard-dim dark:text-mustard mb-2">
              {formatDate(post.publishedAt)}
            </p>
            <h2 className="font-display text-2xl font-semibold text-ink dark:text-parchment group-hover:text-mustard-dim dark:group-hover:text-mustard transition-colors">
              {post.title}
            </h2>
            {post.excerpt && <p className="mt-2 text-ink/70 dark:text-parchment/70 leading-relaxed">{post.excerpt}</p>}
          </div>
        </div>
      </Link>
    </article>
  );
}
