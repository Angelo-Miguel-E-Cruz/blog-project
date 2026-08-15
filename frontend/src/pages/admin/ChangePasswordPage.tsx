import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

export function ChangePasswordPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isForced = user?.mustChangePassword ?? false;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      await refreshUser();
      navigate("/admin", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Couldn't change your password. Check your current password and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto py-16">
      <h1 className="font-display text-2xl font-semibold mb-2 text-center select-none">
        {isForced ? "Set a new password" : "Change password"}
      </h1>
      {isForced && (
        <p className="text-sm text-ink/60 dark:text-parchment/60 text-center mb-8 select-none">
          You're signed in with a temporary password. Set your own before continuing.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1" htmlFor="current-password select-none">
            Current password
          </label>
          <input
            id="current-password"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-ink/20 dark:border-parchment/20 rounded-sm px-3 py-2 bg-white/60 dark:bg-parchment/10 dark:text-parchment focus:outline-none focus:ring-2 focus:ring-mustard select-none"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="new-password select-none">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-ink/20 dark:border-parchment/20 rounded-sm px-3 py-2 bg-white/60 dark:bg-parchment/10 dark:text-parchment focus:outline-none focus:ring-2 focus:ring-mustard select-none"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="confirm-password select-none">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-ink/20 dark:border-parchment/20 rounded-sm px-3 py-2 bg-white/60 dark:bg-parchment/10 dark:text-parchment focus:outline-none focus:ring-2 focus:ring-mustard select-none"
          />
        </div>

        {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-spruce dark:bg-mustard text-parchment dark:text-spruce font-medium py-2 rounded-sm hover:bg-spruce-light dark:hover:bg-mustard-dim transition-colors disabled:opacity-60 select-none"
        >
          {isSubmitting ? "Saving…" : "Save new password"}
        </button>
      </form>
    </div>
  );
}