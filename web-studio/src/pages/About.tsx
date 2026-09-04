import { GraduationCap, Monitor, Target, Volume2 } from "lucide-react";
import type { JSX, ReactNode } from "react";

import { SiteLayout } from "@/components/site/SiteLayout";

/**
 * About / mission page. Ported from the original learndari.com.
 */
export default function About(): JSX.Element {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
            About LearnDari
          </h1>
          <p className="text-xl text-gray-600">
            Keeping our language alive for the next generation
          </p>
        </div>

        {/* Our mission */}
        <div className="mb-8 overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
            <h2 className="text-center text-3xl font-bold text-white">Our mission</h2>
          </div>
          <div className="space-y-4 p-6 text-lg leading-relaxed text-gray-700">
            <p>
              LearnDari started because we were tired of watching our language slip away. Too
              many of us grew up understanding Dari but never learning to read or write it. Too
              many of us wished we had better tools when we were younger.
            </p>
            <p>
              We&apos;re building what we wish existed: a modern platform tailored specifically
              for Afghan Dari. Not adapted from Farsi. Not a generic translation app. Something
              made with our language, our pronunciation, and our culture in mind.
            </p>
            <p>
              Dari is spoken by millions of people around the world, but it doesn&apos;t get the
              same attention as other languages on major learning platforms. We&apos;re here to
              change that. We&apos;re committed to making sure Dari doesn&apos;t become a dying
              language and that we continue to keep our heritage alive.
            </p>
          </div>
        </div>

        {/* What makes us different */}
        <div className="mb-8 overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
            <h2 className="text-center text-3xl font-bold text-white">
              What makes us different
            </h2>
          </div>
          <div className="grid gap-6 p-6 sm:grid-cols-2">
            <DifferenceCard
              icon={<Target className="h-5 w-5 text-red-600" />}
              iconBg="bg-red-100"
              title="Dari-Specific"
              body="Built exclusively for Dari, not adapted from Farsi or Persian resources."
            />
            <DifferenceCard
              icon={<Volume2 className="h-5 w-5 text-blue-600" />}
              iconBg="bg-blue-100"
              title="Audio-First"
              body="Every word includes pronunciation to help you sound natural."
            />
            <DifferenceCard
              icon={<Monitor className="h-5 w-5 text-green-600" />}
              iconBg="bg-green-100"
              title="Modern & Accessible"
              body="Clean interface, and works on any device."
            />
            <DifferenceCard
              icon={<GraduationCap className="h-5 w-5 text-purple-600" />}
              iconBg="bg-purple-100"
              title="Structured Learning"
              body="Clear progression from alphabet to sentences, with quizzes to track your progress."
            />
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function DifferenceCard({
  icon,
  iconBg,
  title,
  body,
}: {
  icon: ReactNode;
  iconBg: string;
  title: string;
  body: string;
}): JSX.Element {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <h3 className="mb-1 text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600">{body}</p>
    </div>
  );
}
