import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

interface AdminMenuProps {
  onSignOut: () => void;
}

export function AdminMenu({ onSignOut }: AdminMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="More options"
        aria-expanded={isOpen}
        className="w-9 h-9 flex items-center justify-center rounded-full border border-ink/15 dark:border-parchment/20 text-ink/70 dark:text-parchment/80 hover:bg-ink/5 dark:hover:bg-parchment/10 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-parchment dark:bg-spruce-light border border-ink/10 dark:border-parchment/15 rounded-sm shadow-lg py-1 z-10"
          role="menu"
        >
          <Link
            to="/admin/change-password"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm no-underline text-ink dark:text-parchment hover:bg-ink/5 dark:hover:bg-parchment/10"
            role="menuitem"
          >
            Change password
          </Link>
          <Link
            to="/admin/users"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm no-underline text-ink dark:text-parchment hover:bg-ink/5 dark:hover:bg-parchment/10"
            role="menuitem"
          >
            Manage admins
          </Link>
          <div className="my-1 border-t border-ink/10 dark:border-parchment/15" />
          <button
            onClick={() => {
              setIsOpen(false);
              onSignOut();
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-700/80 dark:text-red-400/90 hover:bg-ink/5 dark:hover:bg-parchment/10"
            role="menuitem"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}