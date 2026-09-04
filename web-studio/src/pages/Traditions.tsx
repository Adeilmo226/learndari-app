import { ArrowLeft, Calendar, Coffee, Heart, Home, Music, Users } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router-dom";

import { SiteLayout } from "@/components/site/SiteLayout";

/**
 * Culture & Traditions.
 *
 * Editorial content about Afghan culture. This lives in the site (not the
 * Studio content feed, which has no culture-articles field), matching the
 * original learndari.com.
 */
interface CulturalTopic {
  id: string;
  title: string;
  icon: typeof Users;
  content: { subtitle: string; text: string }[];
}

const culturalTopics: CulturalTopic[] = [
  {
    id: "greetings",
    title: "Greetings & Etiquette",
    icon: Users,
    content: [
      {
        subtitle: "Common Greetings",
        text: "Afghans greet each other with 'Salaam' (سلام) or 'Salaam Alaikum' (سلام علیکم). It's customary to ask about someone's health and family when greeting.",
      },
      {
        subtitle: "Handshakes",
        text: "Men typically shake hands with other men. Between genders, it's respectful to wait and see if a handshake is offered, as some may prefer not to shake hands.",
      },
      {
        subtitle: "Respect for Elders",
        text: "Showing respect to elders is fundamental in Afghan culture. Always greet elders first and address them with honorific titles.",
      },
    ],
  },
  {
    id: "hospitality",
    title: "Hospitality & Food",
    icon: Coffee,
    content: [
      {
        subtitle: "Afghan Hospitality",
        text: "Hospitality (مهمان‌نوازی - mehmaan-nawaazi) is deeply valued. Guests are treated with the utmost respect and offered the best food and accommodations.",
      },
      {
        subtitle: "Tea Culture",
        text: "Tea (چای - chai) is central to Afghan culture. Green tea is often served with meals and throughout the day. Refusing tea can be seen as impolite.",
      },
      {
        subtitle: "Traditional Foods",
        text: "Popular dishes include Kabuli Pulao (rice with raisins and carrots), Mantu (dumplings), and various kebabs. Meals are often shared communally.",
      },
    ],
  },
  {
    id: "holidays",
    title: "Holidays & Celebrations",
    icon: Calendar,
    content: [
      {
        subtitle: "Nowruz (نوروز)",
        text: "The Persian New Year, celebrated on the spring equinox (March 20-21). It marks the beginning of spring and is celebrated with family gatherings, special foods, and the Haft-Seen table.",
      },
      {
        subtitle: "Eid al-Fitr & Eid al-Adha",
        text: "Major Islamic holidays celebrated with prayers, family gatherings, new clothes, and special foods. These are times of charity and community.",
      },
      {
        subtitle: "Independence Day",
        text: "Celebrated on August 19, commemorating Afghanistan's independence from British influence in 1919.",
      },
    ],
  },
  {
    id: "family",
    title: "Family & Social Structure",
    icon: Home,
    content: [
      {
        subtitle: "Extended Family",
        text: "Family is the cornerstone of Afghan society. Extended families often live together or in close proximity, with strong bonds across generations.",
      },
      {
        subtitle: "Family Gatherings",
        text: "Regular family gatherings are common, especially on Fridays and during holidays. These gatherings strengthen family bonds and maintain traditions.",
      },
      {
        subtitle: "Respect and Hierarchy",
        text: "There's a clear hierarchy based on age and position within the family. Younger members show respect to elders through language and behavior.",
      },
    ],
  },
  {
    id: "arts",
    title: "Arts & Literature",
    icon: Music,
    content: [
      {
        subtitle: "Poetry",
        text: "Poetry holds a special place in Afghan culture. Rumi, Hafez, and other Persian poets are widely read and quoted. Poetry gatherings (mushaira) are popular social events.",
      },
      {
        subtitle: "Music",
        text: "Traditional Afghan music features instruments like the rubab, tabla, and harmonium. Music is an important part of celebrations and gatherings.",
      },
      {
        subtitle: "Calligraphy & Art",
        text: "Persian calligraphy is highly valued as an art form. Geometric patterns and floral designs are common in Afghan arts and crafts.",
      },
    ],
  },
  {
    id: "values",
    title: "Core Values",
    icon: Heart,
    content: [
      {
        subtitle: "Honor & Dignity (ناموس - namus)",
        text: "Personal and family honor are highly valued. Maintaining dignity and reputation in the community is important.",
      },
      {
        subtitle: "Hospitality (مهمان‌نوازی)",
        text: "Guests are considered a blessing. The saying 'Mehman habib-ullah ast' (A guest is beloved of God) reflects this value.",
      },
      {
        subtitle: "Community & Solidarity",
        text: "Strong sense of community and mutual support. Neighbors and community members help each other in times of need.",
      },
    ],
  },
];

export default function Traditions(): JSX.Element {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/culture"
          className="mb-8 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Discover
        </Link>

        <div className="mb-6 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
            Afghan Culture &amp; Traditions
          </h1>
          <p className="text-xl text-gray-600">
            Understanding the rich cultural heritage of Afghanistan
          </p>
        </div>

        <div className="space-y-4">
          {culturalTopics.map((topic) => (
            <CulturalTopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}

function CulturalTopicCard({ topic }: { topic: CulturalTopic }): JSX.Element {
  const Icon = topic.icon;

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg">
      <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/20">
            <Icon className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{topic.title}</h2>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {topic.content.map((section, index) => (
          <div key={index}>
            <h3 className="mb-2 text-xl font-bold text-gray-900">{section.subtitle}</h3>
            <p className="leading-relaxed text-gray-700">{section.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
