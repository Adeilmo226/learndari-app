import { BookOpen, Earth, GraduationCap, Menu, Search, User, X } from "lucide-react";
import { useState } from "react";
import type { JSX } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const links: { to: string; label: string; icon: typeof Search }[] = [
  { to: "/explore", label: "Explore", icon: Search },
  { to: "/vocab", label: "Vocab", icon: BookOpen },
  { to: "/learn", label: "Learn", icon: GraduationCap },
  { to: "/culture", label: "Culture", icon: Earth },
];

function Wordmark(): JSX.Element {
  return (
    <Link to="/" className="flex items-center" aria-label="LearnDari home">
      <img src="/learndari-logo.png" alt="LearnDari" className="h-12 w-auto" />
    </Link>
  );
}

/** Avatar when signed in, a neutral glyph when not. */
function AccountButton({ onNavigate }: { onNavigate?: () => void }): JSX.Element {
  const { user } = useAuth();

  return (
    <Link
      to="/profile"
      onClick={onNavigate}
      aria-label={user ? "Your profile" : "Sign in"}
      className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
    >
      {user?.picture ? (
        <img src={user.picture} alt="" className="h-full w-full object-cover" />
      ) : user ? (
        <span className="text-sm font-bold text-primary">
          {(user.name ?? user.email).charAt(0).toUpperCase()}
        </span>
      ) : (
        <User className="h-4 w-4" />
      )}
    </Link>
  );
}

export function SiteHeader(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const location = useLocation();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="site-container flex h-20 items-center justify-between gap-4">
        <Wordmark />

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-foreground hover:bg-secondary",
                  )
                }
              >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          {user ? (
            <AccountButton />
          ) : (
            <Link
              to="/profile"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:brightness-110 active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1.5 md:hidden">
          <AccountButton />
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-border bg-white md:hidden">
          <nav className="site-container flex flex-col py-2">
            {links.map((link) => {
              const Icon = link.icon;
              const active = location.pathname.startsWith(link.to);
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-3 text-base font-medium",
                    active ? "bg-primary text-primary-foreground" : "text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </NavLink>
              );
            })}
            {!user && (
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="mt-2 mb-3 rounded-lg bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
