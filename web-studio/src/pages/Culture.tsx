import { ArrowRight, Calendar, Landmark, MessageCircle } from "lucide-react";
import { useMemo } from "react";
import type { JSX } from "react";
import { Link } from "react-router-dom";

import { SiteLayout } from "@/components/site/SiteLayout";
import { useContent } from "@/hooks/useContent";
import type { StudioProverb } from "@/lib/content";

/** Stable Proverb of the Day: rotates once per day rather than per render. */
function pickDailyProverb(proverbs: StudioProverb[]): StudioProverb | null {
  if (proverbs.length === 0) return null;
  const daysSinceEpoch = Math.floor(Date.now() / 86_400_000);
  return proverbs[daysSinceEpoch % proverbs.length];
}

const cultureItems: {
  id: string;
  title: string;
  description: string;
  icon: typeof MessageCircle;
  href: string;
  bgColor: string;
  textColor: string;
}[] = [
  {
    id: "proverbs",
    title: "Dari Proverbs",
    description: "Explore traditional Afghan wisdom and sayings",
    icon: MessageCircle,
    href: "/culture/proverbs",
    bgColor: "bg-pink-100",
    textColor: "text-pink-600",
  },
  {
    id: "traditions",
    title: "Culture & Traditions",
    description: "Afghan food culture, holidays, and customs",
    icon: Landmark,
    href: "/culture/traditions",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-600",
  },
  {
    id: "word-of-the-day",
    title: "Word of the Day",
    description: "Learn a new Dari word every day",
    icon: Calendar,
    href: "/culture/word-of-the-day",
    bgColor: "bg-purple-100",
    textColor: "text-purple-600",
  },
];

export default function Culture(): JSX.Element {
  const { content } = useContent();
  const dailyProverb = useMemo(() => pickDailyProverb(content.proverbs), [content.proverbs]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">Discover</h1>
          <p className="text-xl text-gray-600">
            Explore Afghan culture, wisdom, and traditions
          </p>
        </div>

        {/* Proverb of the Day banner */}
        {dailyProverb && (
          <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-green-600 shadow-xl">
            <div className="p-6 text-white sm:p-8">
              <p className="mb-6 text-sm font-semibold uppercase tracking-wider text-white/60">
                Proverb of the Day
              </p>

              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                {/* Right: Dari + phonetic */}
                <div className="md:order-2 md:w-1/2">
                  <p className="mb-2 text-right text-2xl font-bold sm:text-3xl" dir="rtl">
                    {dailyProverb.dari}
                  </p>
                  <p className="text-right text-lg italic text-white/60">
                    {dailyProverb.phonetic}
                  </p>
                </div>

                {/* Left: English + meaning */}
                <div className="md:order-1 md:w-1/2">
                  <p className="mb-3 text-xl font-semibold">
                    &ldquo;{dailyProverb.english}&rdquo;
                  </p>
                  {dailyProverb.meaning && (
                    <div className="mb-4 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-white/90">
                        <span className="font-semibold text-white">Meaning:</span>{" "}
                        {dailyProverb.meaning}
                      </p>
                    </div>
                  )}
                  {dailyProverb.category && (
                    <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white/90">
                      {dailyProverb.category}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-white/20 pt-4">
                <Link
                  to="/culture/proverbs"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
                >
                  Browse all proverbs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Culture & Language */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Culture &amp; Language</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cultureItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className="group flex h-full flex-col rounded-xl border-2 border-gray-200 bg-white p-6 transition-all hover:border-gray-400 hover:shadow-xl"
                >
                  <div
                    className={`mb-4 flex h-14 w-14 items-center justify-center rounded-lg ${item.bgColor} transition-transform group-hover:scale-110`}
                  >
                    <Icon className={`h-7 w-7 ${item.textColor}`} />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-red-600">
                    {item.title}
                  </h3>
                  <p className="mb-4 text-gray-600">{item.description}</p>
                  <div className="mt-auto text-2xl text-gray-400 transition-all group-hover:translate-x-2 group-hover:text-gray-900">
                    →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
