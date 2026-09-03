import type { JSX } from "react";
import { Link } from "react-router-dom";

const columns: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: "Learn",
    links: [
      { to: "/learn", label: "Learn to Read" },
      { to: "/vocab", label: "Vocabulary" },
      { to: "/explore", label: "Explore" },
    ],
  },
  {
    title: "Discover",
    links: [
      { to: "/culture", label: "Culture" },
      { to: "/culture#proverbs", label: "Proverbs" },
      { to: "/culture#word-of-the-day", label: "Word of the Day" },
    ],
  },
  {
    title: "Connect",
    links: [
      { to: "/about", label: "About" },
      { to: "/feedback", label: "Contact Us" },
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms of Service" },
    ],
  },
];

export function SiteFooter(): JSX.Element {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="site-container py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/learndari-mark.png" alt="" className="h-9 w-9" />
              <span className="text-lg font-bold tracking-tight">
                Learn<span className="text-primary">Dari</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Dari Language Learning — vocabulary, reading and culture, with audio for
              every word.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to + link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} LearnDari. All rights reserved.
          </p>
          <p className="dari-display text-sm text-muted-foreground">
            به یادگیری دری خوش آمدید
          </p>
        </div>
      </div>
    </footer>
  );
}
