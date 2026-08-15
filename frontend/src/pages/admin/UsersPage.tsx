import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAdmin, deleteAdmin, fetchAdmins } from "../../api/users";
import { useAuth } from "../../context/AuthContext";

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: admins, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdmins,
  });

  const createMutation = useMutation({
    mutationFn: () => createAdmin(email.trim(), password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEmail("");
      setPassword("");
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.error ?? "Couldn't add that admin. Check the fields and try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: (err: any) => {
      setFormError(err?.response?.data?.error ?? "Couldn't remove that admin.");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    createMutation.mutate();
  }

  function handleDelete(id: string, adminEmail: string) {
    if (window.confirm(`Remove admin access for "${adminEmail}"?`)) {
      setFormError(null);
      deleteMutation.mutate(id);
    }
  }

  const canDeleteMore = (admins?.length ?? 0) > 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/admin" className="text-sm text-ink/50 dark:text-parchment/50 no-underline hover:text-mustard-dim dark:hover:text-mustard">
            ← Dashboard
          </Link>
          <h1 className="font-display text-3xl font-semibold mt-2">Admins</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-10 space-y-3 max-w-sm">
        <h2 className="font-display text-lg font-semibold">Add an admin</h2>
        <div>
          <label className="block text-sm mb-1" htmlFor="new-admin-email">
            Email
          </label>
          <input
            id="new-admin-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-ink/20 dark:border-parchment/20 rounded-sm px-3 py-2 bg-white/60 dark:bg-parchment/10 dark:text-parchment focus:outline-none focus:ring-2 focus:ring-mustard"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="new-admin-password">
            Temporary password
          </label>
          <input
            id="new-admin-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-ink/20 dark:border-parchment/20 rounded-sm px-3 py-2 bg-white/60 dark:bg-parchment/10 dark:text-parchment focus:outline-none focus:ring-2 focus:ring-mustard"
          />
          <p className="text-xs text-ink/40 dark:text-parchment/40 mt-1">At least 8 characters. Share this with them directly — there's no invite email.</p>
        </div>

        {formError && <p className="text-sm text-red-700 dark:text-red-400">{formError}</p>}

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="bg-spruce dark:bg-mustard text-parchment dark:text-spruce px-4 py-2 rounded-sm text-sm font-medium hover:bg-spruce-light dark:hover:bg-mustard-dim disabled:opacity-50"
        >
          {createMutation.isPending ? "Adding…" : "Add admin"}
        </button>
      </form>

      <h2 className="font-display text-lg font-semibold mb-3">Current admins</h2>

      {isLoading && <p className="text-ink/50 dark:text-parchment/50">Loading…</p>}

      <div className="divide-y divide-ink/10 dark:divide-parchment/10">
        {admins?.map((admin) => {
          const isSelf = admin.id === currentUser?.id;
          return (
            <div key={admin.id} className="py-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">
                  {admin.email}
                  {isSelf && <span className="text-xs text-ink/40 dark:text-parchment/40 ml-2">(you)</span>}
                </p>
                <p className="text-xs text-ink/40 dark:text-parchment/40">
                  Added {new Date(admin.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(admin.id, admin.email)}
                disabled={isSelf || !canDeleteMore || deleteMutation.isPending}
                title={
                  isSelf
                    ? "You can't remove your own account while logged in as it."
                    : !canDeleteMore
                      ? "Can't remove the last remaining admin."
                      : undefined
                }
                className="text-sm text-red-700/80 dark:text-red-400/90 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}