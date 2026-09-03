import { Menu, User, X } from "lucide-react";
import { useState } from "react";
import type { JSX } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const links: { to: string; label: string }[] = [
  { to: "/learn", label: "Learn" },
  { to: "/vocab", label: "Vocab" },
  { to: "/explore", label: "Explore" },
  { to: "/culture", label: "Culture" },
];

function Wordmark(): JSX.Element {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="LearnDari home">
      <img src="/learndari-mark.png" alt="" className="h-9 w-9" />
      <span className="text-lg font-bold tracking-tight text-foreground">
        Learn<span className="text-primary">Dari</span>
      </span>
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

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="site-container flex h-16 items-center justify-between gap-4">
        <Wordmark />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          <Link
            to="/learn"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:brightness-110 active:scale-95"
          >
            Start learning
          </Link>
          <AccountButton />
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
        <div className="border-t border-border bg-background md:hidden">
          <nav className="site-container flex flex-col py-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-3 text-base font-medium",
                  location.pathname.startsWith(link.to)
                    ? "text-primary"
                    : "text-foreground",
                )}
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/learn"
              onClick={() => setIsOpen(false)}
              className="mt-2 mb-3 rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              Start learning
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
