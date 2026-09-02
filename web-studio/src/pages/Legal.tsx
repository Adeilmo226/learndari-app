import type { JSX } from "react";

import { PageHeading, SiteLayout } from "@/components/site/SiteLayout";

const EFFECTIVE = "1 September 2026";

function Prose({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="site-container max-w-3xl space-y-5 text-base leading-relaxed text-muted-foreground [&_h2]:pt-5 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc">
      {children}
    </div>
  );
}

export function Privacy(): JSX.Element {
  return (
    <SiteLayout>
      <PageHeading title="Privacy Policy" subtitle={`Effective ${EFFECTIVE}`} />
      <Prose>
        <p>
          LearnDari is a language-learning website and app. This policy explains what we
          collect and why. The short version: we collect as little as we can, we don't sell
          anything to anyone, and you can ask us to delete it all at any time.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>If you sign in</strong> with Google or Apple, we receive your email
            address and name from that provider. We never see your password.
          </li>
          <li>
            <strong>Your learning progress</strong> — lessons completed, points earned, and
            how well you know each word — so it can follow you between your devices.
          </li>
          <li>
            <strong>Your email address</strong>, if you choose to join the app waitlist.
          </li>
        </ul>

        <h2>What we don't collect</h2>
        <p>
          We don't use advertising trackers, we don't build a profile of you, and we don't
          sell or share your data with third parties for marketing. If you use the site
          without signing in, your progress stays in your own browser and never reaches us.
        </p>

        <h2>How we use it</h2>
        <p>
          Only to run the service: to keep your progress in sync, to sign you in, and — if
          you asked for it — to email you once when the app launches. Waitlist emails are
          used for that announcement and nothing else.
        </p>

        <h2>Where it's stored</h2>
        <p>
          Data is stored on our hosting provider's infrastructure and protected in transit
          with encryption. Sign-in is handled by Google and Apple, whose own privacy
          policies apply to that step.
        </p>

        <h2>Deleting your data</h2>
        <p>
          You can delete your account from your profile page at any time. Doing so removes
          your account and all associated progress. To be removed from the waitlist, use the
          unsubscribe link in the email or contact us.
        </p>

        <h2>Children</h2>
        <p>
          LearnDari is suitable for all ages, but accounts are not intended for children
          under 13. We do not knowingly collect data from children under 13.
        </p>

        <h2>Changes</h2>
        <p>
          If this policy changes in a way that materially affects you, we'll say so on this
          page and update the date above.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about privacy can be sent through the contact page and we'll respond
          directly.
        </p>
      </Prose>
    </SiteLayout>
  );
}

export function Terms(): JSX.Element {
  return (
    <SiteLayout>
      <PageHeading title="Terms of Service" subtitle={`Effective ${EFFECTIVE}`} />
      <Prose>
        <p>
          These terms cover your use of the LearnDari website and app. By using them, you
          agree to what follows.
        </p>

        <h2>Using LearnDari</h2>
        <p>
          The learning content on this website is free to use for your own personal study.
          You're welcome to use it as much as you like. Please don't scrape the site,
          republish the lessons or audio recordings elsewhere, or resell the content.
        </p>

        <h2>Your account</h2>
        <p>
          You're responsible for activity under your account. Signing in is handled by
          Google or Apple, so keeping that account secure keeps this one secure. We may
          suspend accounts that abuse the service or attempt to disrupt it for others.
        </p>

        <h2>Content and accuracy</h2>
        <p>
          Dari varies by region and by speaker. We work to keep translations and
          pronunciation accurate and natural, but we can't guarantee every entry is right
          for every dialect or context. LearnDari is a learning aid, not a substitute for
          professional translation.
        </p>

        <h2>Our content</h2>
        <p>
          The lessons, written material and audio recordings are owned by LearnDari and
          protected by copyright. The Dari language itself, of course, belongs to everyone.
        </p>

        <h2>Availability</h2>
        <p>
          We aim to keep the service running and available, but it is provided as-is,
          without warranty. Features may change, and we may occasionally need to take the
          service down for maintenance.
        </p>

        <h2>Liability</h2>
        <p>
          To the extent permitted by law, LearnDari is not liable for indirect or
          consequential losses arising from your use of the service.
        </p>

        <h2>Ending your use</h2>
        <p>
          You can stop using LearnDari and delete your account whenever you like, from your
          profile page.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms. Continued use after an update means you accept the
          revised version.
        </p>
      </Prose>
    </SiteLayout>
  );
}
