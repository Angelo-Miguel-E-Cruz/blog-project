import { FormEvent, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      const from = (location.state as { from?: Location })?.from?.pathname ?? "/admin";
      navigate(from, { replace: true });
    } catch {
      setError("Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto py-16">
      <h1 className="font-display text-2xl font-semibold mb-8 text-center">Admin sign in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-ink/20 dark:border-parchment/20 rounded-sm px-3 py-2 bg-white/60 dark:bg-parchment/10 dark:text-parchment focus:outline-none focus:ring-2 focus:ring-mustard"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-ink/20 dark:border-parchment/20 rounded-sm px-3 py-2 bg-white/60 dark:bg-parchment/10 dark:text-parchment focus:outline-none focus:ring-2 focus:ring-mustard"
          />
        </div>

        {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-spruce dark:bg-mustard text-parchment dark:text-spruce font-medium py-2 rounded-sm hover:bg-spruce-light dark:hover:bg-mustard-dim transition-colors disabled:opacity-60"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
