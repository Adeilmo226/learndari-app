import { Mail, MessageSquare, Plus } from "lucide-react";
import type { JSX } from "react";

import { PageHeading, SiteLayout } from "@/components/site/SiteLayout";

const CONTACT_EMAIL = "hello@learndari.com";

const reasons: { title: string; body: string; icon: typeof Mail }[] = [
  {
    title: "A word is wrong",
    body: "Spotted a translation, spelling or pronunciation that isn't right? Tell us and it gets fixed the same week.",
    icon: MessageSquare,
  },
  {
    title: "A word is missing",
    body: "Looked for something and couldn't find it? Send it over and we'll record it and add it.",
    icon: Plus,
  },
  {
    title: "Anything else",
    body: "Ideas, questions, or just want to say hello — we read everything that comes in.",
    icon: Mail,
  },
];

export default function Feedback(): JSX.Element {
  return (
    <SiteLayout>
      <PageHeading
        title="Feedback & Contact"
        subtitle="This is built by a very small team, and learner feedback is how it gets better."
      />

      <div className="site-container max-w-3xl">
        <div className="grid gap-5 sm:grid-cols-3">
          {reasons.map((reason) => (
            <div key={reason.title} className="app-card p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                <reason.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-semibold text-foreground">{reason.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {reason.body}
              </p>
            </div>
          ))}
        </div>

        <div className="app-card mt-8 p-8 text-center">
          <p className="text-muted-foreground">Send anything to</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-2 inline-block text-2xl font-bold text-primary underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            If you're reporting a word, including the English and how you'd expect it to be
            said in Dari helps us get to it faster.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
