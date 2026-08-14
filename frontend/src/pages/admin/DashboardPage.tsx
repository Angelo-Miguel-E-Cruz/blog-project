import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAdminPost, fetchAdminPosts } from "../../api/posts";
import { useAuth } from "../../context/AuthContext";

function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" }) {
  const isDraft = status === "DRAFT";
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full uppercase tracking-wide ${
        isDraft
          ? "bg-ink/10 text-ink/60 dark:bg-parchment/10 dark:text-parchment/60"
          : "bg-mustard/20 text-mustard-dim dark:bg-mustard/25 dark:text-mustard"
      }`}
    >
      {status}
    </span>
  );
}

export function DashboardPage() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const [flash, setFlash] = useState<string | null>((location.state as { flash?: string })?.flash ?? null);

  useEffect(() => {
    if (flash) {
      navigate(location.pathname, { replace: true, state: {} });
      const timer = setTimeout(() => setFlash(null), 5000);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: fetchAdminPosts,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminPost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-posts"] }),
  });

  function handleDelete(id: string, title: string) {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div>
      {flash && (
        <div className="mb-6 bg-mustard/15 dark:bg-mustard/20 border border-mustard/40 text-mustard-dim dark:text-mustard text-sm rounded-sm px-4 py-2">
          {flash}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <div className="flex gap-3">
          <Link
            to="/admin/posts/new"
            className="bg-spruce dark:bg-mustard text-parchment dark:text-spruce px-4 py-2 rounded-sm text-sm font-medium no-underline hover:bg-spruce-light dark:hover:bg-mustard-dim"
          >
            New post
          </Link>
          <button onClick={() => logout()} className="text-sm text-ink/50 dark:text-parchment/50 hover:text-ink dark:hover:text-parchment">
            Sign out
          </button>
        </div>
      </div>

      {isLoading && <p className="text-ink/50 dark:text-parchment/50">Loading…</p>}

      {posts && posts.length === 0 && <p className="text-ink/50 dark:text-parchment/50">No posts yet. Create your first one.</p>}

      <div className="divide-y divide-ink/10 dark:divide-parchment/10">
        {posts?.map((post) => (
          <div key={post.id} className="py-4 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={post.status} />
                <span className="text-xs text-ink/40 dark:text-parchment/40">
                  Updated {new Date(post.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="font-medium">{post.title}</p>
            </div>
            <div className="flex gap-3 shrink-0 text-sm">
              <Link to={`/admin/posts/${post.id}`} className="text-mustard-dim dark:text-mustard">
                Edit
              </Link>
              <button onClick={() => handleDelete(post.id, post.title)} className="text-red-700/80 dark:text-red-400/90 hover:text-red-700 dark:hover:text-red-400">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}