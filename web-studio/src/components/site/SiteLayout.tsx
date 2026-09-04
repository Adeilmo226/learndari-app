import type { JSX, ReactNode } from "react";

import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

interface SiteLayoutProps {
  children: ReactNode;
  /** Hero pages draw their own top spacing. */
  flush?: boolean;
}

export function SiteLayout({ children, flush = false }: SiteLayoutProps): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className={flush ? "flex flex-1 flex-col" : "flex-1 py-10 sm:py-14"}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

/** Standard page heading used across the inner pages. */
export function PageHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}): JSX.Element {
  return (
    <div className="site-container mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
      {subtitle && (
        <p className="mt-2.5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}
