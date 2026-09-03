import {
  BookOpen,
  Compass,
  GraduationCap,
  Heart,
  Languages,
  Volume2,
} from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router-dom";

import { AudioButton } from "@/components/site/AudioButton";
import { SiteLayout } from "@/components/site/SiteLayout";
import { WaitlistForm } from "@/components/site/WaitlistForm";
import { useContent } from "@/hooks/useContent";
import type { StudioWord } from "@/lib/content";

/** Shown in the hero until the live feed arrives, so the page never flashes empty. */
const fallbackWord: StudioWord = {
  id: "hero-salaam",
  english: "Hello",
  dari: "سلام",
  phonetic: "salaam",
};

const sections: {
  to: string;
  title: string;
  body: string;
  icon: typeof BookOpen;
}[] = [
  {
    to: "/vocab",
    title: "Learn Vocab",
    body: "Flashcards and quizzes with audio pronunciation",
    icon: BookOpen,
  },
  {
    to: "/learn",
    title: "Learn to Read",
    body: "Alphabet, sounds, and phrases with native pronunciation",
    icon: GraduationCap,
  },
  {
    to: "/culture",
    title: "Discover More",
    body: "Daily words, proverbs, and cultural insights",
    icon: Compass,
  },
];

const reasons: { title: string; body: string; icon: typeof Languages }[] = [
  {
    title: "Built specially for Dari",
    body: "Designed with Dari language structure and culture in mind",
    icon: Languages,
  },
  {
    title: "Audio-first pronunciation",
    body: "Speaker audio for every word and phrase",
    icon: Volume2,
  },
  {
    title: "For beginners & heritage learners",
    body: "Whether starting fresh or reconnecting with roots",
    icon: Heart,
  },
];

const steps: { step: string; title: string; body: string }[] = [
  {
    step: "01",
    title: "Meet the word",
    body: "Every new word arrives on its own card — Dari script, how it sounds, what it means.",
  },
  {
    step: "02",
    title: "Practice it",
    body: "Multiple choice, listening and matching keep coming back until the word sticks.",
  },
  {
    step: "03",
    title: "Keep it",
    body: "Words you find hard return more often, so revision happens on its own.",
  },
];

export default function Home(): JSX.Element {
  const { content } = useContent();
  const heroWord = content.popularWords[0] ?? fallbackWord;

  return (
    <SiteLayout flush>
      {/* Hero */}
      <section className="hero-wash border-b border-border">
        <div className="site-container grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="animate-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Dari Language Learning
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              The easiest way to
              <br />
              learn <span className="text-primary">Dari</span> online
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Learn words, pronunciation, and reading — with audio recorded by a native
              speaker for every single word.
            </p>

            <div className="mt-8 max-w-lg">
              <WaitlistForm source="home-hero" label="Get early access" />
              <p className="mt-3 pl-1 text-sm text-muted-foreground">
                The iPhone app is coming soon.{" "}
                <Link
                  to="/learn"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Or start learning free on the web →
                </Link>
              </p>
            </div>
          </div>

          {/* A real word from the live feed, playable right on the homepage. */}
          <div className="animate-in-up [animation-delay:120ms]">
            <div className="app-card mx-auto max-w-sm p-8 text-center shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.28)]">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Try it — tap to listen
              </p>
              <p className="dari-display mt-5 text-6xl font-semibold text-foreground">
                {heroWord.dari}
              </p>
              <p className="mt-4 text-lg italic text-muted-foreground">
                {heroWord.phonetic}
              </p>
              <div className="my-5 h-px bg-border" />
              <p className="text-2xl font-bold text-foreground">{heroWord.english}</p>
              <div className="mt-6 flex justify-center">
                <AudioButton
                  audioKey={heroWord.audioKey}
                  text={heroWord.dari}
                  size="lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="site-container py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          How It Works
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.step} className="app-card p-7">
              <span className="text-sm font-bold tracking-wider text-primary">
                {step.step}
              </span>
              <h3 className="mt-3 text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Three sections */}
      <section className="border-y border-border bg-secondary/40 py-16 sm:py-20">
        <div className="site-container">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to master Dari
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {sections.map((section) => (
              <Link key={section.to} to={section.to} className="app-card-interactive group p-7">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                  <section.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-foreground">
                  {section.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{section.body}</p>
                <span className="mt-5 inline-block text-sm font-semibold text-primary">
                  Start now
                  <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why LearnDari */}
      <section className="site-container py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Why LearnDari?
        </h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {reasons.map((reason) => (
            <div key={reason.title} className="text-center">
              <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
                <reason.icon className="h-7 w-7" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{reason.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{reason.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="border-t border-border bg-secondary/40 py-16 sm:py-20">
        <div className="site-container max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why LearnDari Exists
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Dari is spoken by millions, yet there is almost nowhere good to learn it. For
            families raised outside Afghanistan, the language slips away a generation at a
            time. LearnDari exists so that anyone — a complete beginner, or someone
            reconnecting with where they came from — can pick the language back up, hear it
            spoken properly, and pass it on.
          </p>
          <Link
            to="/about"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            Read Our Mission →
          </Link>
        </div>
      </section>

      {/* Closing waitlist */}
      <section className="site-container py-16 sm:py-20">
        <div className="app-card mx-auto max-w-3xl p-8 text-center sm:p-12">
          <p className="dari-display text-4xl font-semibold text-primary">دری</p>
          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Be first to know when the app lands
          </h2>
          <p className="mx-auto mt-3 max-w-lg leading-relaxed text-muted-foreground">
            Everything here, in your pocket — with lessons that adapt to the words you find
            hard. Leave your email and we'll tell you the day it's live.
          </p>
          <WaitlistForm source="home-footer" className="mx-auto mt-7 max-w-md" label="Notify me" />
        </div>
      </section>
    </SiteLayout>
  );
}
