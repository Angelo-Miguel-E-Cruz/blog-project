import { Link, Outlet } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink/10 dark:border-parchment/10">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-semibold tracking-tight no-underline select-none">
            On These Empty Pages
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-ink/10 dark:border-parchment/10">
        <div className="max-w-3xl mx-auto px-6 py-8 text-sm text-ink/60 dark:text-parchment/60 select-none">
          <p>&copy; {new Date().getFullYear()} Joseph Allan B. Cruz</p>
        </div>
      </footer>
    </div>
  );
}