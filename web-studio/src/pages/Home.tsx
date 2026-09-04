import {
  BookOpen,
  GraduationCap,
  Heart,
  Search,
  Sparkles,
  Users,
  Volume2,
} from "lucide-react";
import type { JSX, ReactNode } from "react";
import { Link } from "react-router-dom";

import { SiteLayout } from "@/components/site/SiteLayout";

/**
 * Home / landing page.
 *
 * Ported from the original learndari.com so the website keeps its familiar
 * look: two-column hero with dual CTAs, "How It Works", "Why LearnDari",
 * and the mission banner.
 */
export default function Home(): JSX.Element {
  return (
    <SiteLayout flush>
      <div className="flex flex-1 flex-col bg-white">
        {/* Section 1: Hero */}
        <section className="relative overflow-hidden">
          {/* Background image overlay */}
          <div className="absolute inset-0">
            <img
              src="/homepage_background.jpg"
              alt=""
              className="h-full w-full object-cover opacity-[0.10]"
            />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
            <div className="grid items-center gap-12 md:grid-cols-2">
              {/* Left: text content */}
              <div className="space-y-4">
                <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl lg:text-5xl">
                  The easiest way to learn Dari online
                </h1>
                <p className="text-lg leading-relaxed text-gray-600">
                  Learn words, pronunciation, and reading.
                </p>

                {/* CTA buttons */}
                <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                  <Link
                    to="/vocab"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-red-700 hover:shadow-xl"
                  >
                    <BookOpen className="h-5 w-5" />
                    Start with Vocabulary
                  </Link>
                  <Link
                    to="/learn"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-green-700 hover:shadow-xl"
                  >
                    <GraduationCap className="h-5 w-5" />
                    Learn to Read Dari
                  </Link>
                </div>
              </div>

              {/* Right: hero image */}
              <div className="relative">
                <div className="aspect-square overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
                  <img
                    src="/education.avif"
                    alt="Learn Dari - Language Learning Platform"
                    width={600}
                    height={600}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: How It Works */}
        <section className="bg-gray-50 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                How It Works
              </h2>
              <p className="text-xl text-gray-600">Everything you need to master Dari</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <HowItWorksCard
                icon={<Search className="h-8 w-8" />}
                title="Explore"
                description="Search for words in English or Dari from our database"
                color="bg-blue-50 text-blue-600"
              />
              <HowItWorksCard
                icon={<BookOpen className="h-8 w-8" />}
                title="Learn Vocab"
                description="Flashcards and quizzes with audio pronunciation"
                color="bg-red-50 text-red-600"
              />
              <HowItWorksCard
                icon={<GraduationCap className="h-8 w-8" />}
                title="Learn to Read"
                description="Alphabet, sounds, and phrases with native pronunciation"
                color="bg-green-50 text-green-600"
              />
              <HowItWorksCard
                icon={<Sparkles className="h-8 w-8" />}
                title="Discover More"
                description="Daily words, proverbs, and cultural insights"
                color="bg-purple-50 text-purple-600"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Why LearnDari */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                Why LearnDari?
              </h2>
            </div>

            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
              <WhyCard
                icon={<Heart className="h-6 w-6" />}
                title="Built specially for Dari"
                description="Designed with Dari language structure and culture in mind"
              />
              <WhyCard
                icon={<Volume2 className="h-6 w-6" />}
                title="Audio-first pronunciation"
                description="Speaker audio for every word and phrase"
              />
              <WhyCard
                icon={<Users className="h-6 w-6" />}
                title="For beginners & heritage learners"
                description="Whether starting fresh or reconnecting with roots"
              />
            </div>
          </div>
        </section>

        {/* Section 4: Mission banner */}
        <section className="flex flex-1 items-center bg-gradient-to-br from-red-600 to-green-600 py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              Why LearnDari Exists
            </h2>
            <p className="mb-8 text-xl leading-relaxed text-white/90">
              Finding quality Dari resources online shouldn&apos;t be this hard. LearnDari
              was built to preserve our language for future generations and give heritage
              speakers the tools to reconnect with their roots.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 font-semibold text-red-600 shadow-lg transition-colors hover:bg-gray-50"
            >
              Read Our Mission
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}

function HowItWorksCard({
  icon,
  title,
  description,
  color,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
}): JSX.Element {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-shadow hover:shadow-xl">
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-lg ${color}`}
      >
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
      <p className="leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}

function WhyCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}): JSX.Element {
  return (
    <div className="space-y-3 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
