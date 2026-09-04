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
      { to: "/culture/traditions", label: "Culture & Traditions" },
      { to: "/culture/proverbs", label: "Proverbs" },
      { to: "/culture/word-of-the-day", label: "Word of the Day" },
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
    <footer className="bg-gray-900 text-white">
      <div className="site-container py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img src="/Logo.png" alt="LearnDari" className="h-16 w-auto" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-400">
              Dari Language Learning — vocabulary, reading and culture, with audio for
              every word.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-lg font-semibold text-white">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to + link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-gray-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} LearnDari. All rights reserved.
          </p>
          <p className="dari-display text-sm text-gray-400">
            به یادگیری دری خوش آمدید
          </p>
        </div>
      </div>
    </footer>
  );
}
