import type { JSX } from "react";
import { Link } from "react-router-dom";

import { PageHeading, SiteLayout } from "@/components/site/SiteLayout";
import { WaitlistForm } from "@/components/site/WaitlistForm";

export default function About(): JSX.Element {
  return (
    <SiteLayout>
      <PageHeading
        title="About LearnDari"
        subtitle="Why this exists, and who it's for."
      />

      <div className="site-container max-w-3xl space-y-6 text-base leading-relaxed text-muted-foreground">
        <p>
          Dari is one of the two official languages of Afghanistan and is spoken by
          millions of people. Despite that, there is remarkably little available for
          someone who wants to learn it properly — no mainstream course, very little audio,
          and almost nothing designed around how Dari actually works rather than how
          European languages do.
        </p>

        <p>
          LearnDari was built to close that gap. Every word here is recorded by a native
          speaker rather than read out by a machine, because pronunciation is the part
          learners struggle with most and the part textbooks serve worst. The lessons are
          short, they repeat the words you find difficult, and they are built around the
          vocabulary people actually use.
        </p>

        <h2 className="pt-4 text-2xl font-bold tracking-tight text-foreground">
          For heritage learners
        </h2>
        <p>
          A lot of people who come here aren't starting from nothing. They grew up hearing
          Dari at home, understand more than they can say, and feel the language slipping
          away. That experience shaped the whole design: you can skip ahead, search for a
          word you half-remember, and listen to how something is really said rather than
          how it is spelled.
        </p>

        <h2 className="pt-4 text-2xl font-bold tracking-tight text-foreground">
          What's next
        </h2>
        <p>
          The website is free and stays free. An iPhone app is on the way, with the same
          content and lessons that adapt to the words you keep forgetting. If you'd like to
          know when it lands, leave your email below.
        </p>

        <WaitlistForm source="about" className="max-w-md pt-2" label="Notify me" />

        <p className="pt-4">
          Got a correction, a word you'd like added, or just want to say hello?{" "}
          <Link
            to="/feedback"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Get in touch
          </Link>
          .
        </p>
      </div>
    </SiteLayout>
  );
}
