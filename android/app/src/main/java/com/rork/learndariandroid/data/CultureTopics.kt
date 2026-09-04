package com.rork.learndariandroid.data

/**
 * Editorial culture content that lives in the app.
 *
 * There is no culture-articles field in the shared content feed, so this
 * mirrors the website's Culture & Traditions page and the iOS copy exactly.
 */
data class CultureTopic(
    val title: String,
    val icon: TopicIcon,
    val sections: List<Section>,
) {
    data class Section(val subtitle: String, val text: String)
}

enum class TopicIcon { People, Tea, Calendar, House, Music, Heart }

val cultureTopics: List<CultureTopic> = listOf(
    CultureTopic(
        title = "Greetings & Etiquette",
        icon = TopicIcon.People,
        sections = listOf(
            CultureTopic.Section(
                "Common Greetings",
                "Afghans greet each other with 'Salaam' (سلام) or 'Salaam Alaikum' (سلام علیکم). It's customary to ask about someone's health and family when greeting.",
            ),
            CultureTopic.Section(
                "Handshakes",
                "Men typically shake hands with other men. Between genders, it's respectful to wait and see if a handshake is offered, as some may prefer not to shake hands.",
            ),
            CultureTopic.Section(
                "Respect for Elders",
                "Showing respect to elders is fundamental in Afghan culture. Always greet elders first and address them with honorific titles.",
            ),
        ),
    ),
    CultureTopic(
        title = "Hospitality & Food",
        icon = TopicIcon.Tea,
        sections = listOf(
            CultureTopic.Section(
                "Afghan Hospitality",
                "Hospitality (مهمان‌نوازی - mehmaan-nawaazi) is deeply valued. Guests are treated with the utmost respect and offered the best food and accommodations.",
            ),
            CultureTopic.Section(
                "Tea Culture",
                "Tea (چای - chai) is central to Afghan culture. Green tea is often served with meals and throughout the day. Refusing tea can be seen as impolite.",
            ),
            CultureTopic.Section(
                "Traditional Foods",
                "Popular dishes include Kabuli Pulao (rice with raisins and carrots), Mantu (dumplings), and various kebabs. Meals are often shared communally.",
            ),
        ),
    ),
    CultureTopic(
        title = "Holidays & Celebrations",
        icon = TopicIcon.Calendar,
        sections = listOf(
            CultureTopic.Section(
                "Nowruz (نوروز)",
                "The Persian New Year, celebrated on the spring equinox (March 20-21). It marks the beginning of spring and is celebrated with family gatherings, special foods, and the Haft-Seen table.",
            ),
            CultureTopic.Section(
                "Eid al-Fitr & Eid al-Adha",
                "Major Islamic holidays celebrated with prayers, family gatherings, new clothes, and special foods. These are times of charity and community.",
            ),
            CultureTopic.Section(
                "Independence Day",
                "Celebrated on August 19, commemorating Afghanistan's independence from British influence in 1919.",
            ),
        ),
    ),
    CultureTopic(
        title = "Family & Social Structure",
        icon = TopicIcon.House,
        sections = listOf(
            CultureTopic.Section(
                "Extended Family",
                "Family is the cornerstone of Afghan society. Extended families often live together or in close proximity, with strong bonds across generations.",
            ),
            CultureTopic.Section(
                "Family Gatherings",
                "Regular family gatherings are common, especially on Fridays and during holidays. These gatherings strengthen family bonds and maintain traditions.",
            ),
            CultureTopic.Section(
                "Respect and Hierarchy",
                "There's a clear hierarchy based on age and position within the family. Younger members show respect to elders through language and behavior.",
            ),
        ),
    ),
    CultureTopic(
        title = "Arts & Literature",
        icon = TopicIcon.Music,
        sections = listOf(
            CultureTopic.Section(
                "Poetry",
                "Poetry holds a special place in Afghan culture. Rumi, Hafez, and other Persian poets are widely read and quoted. Poetry gatherings (mushaira) are popular social events.",
            ),
            CultureTopic.Section(
                "Music",
                "Traditional Afghan music features instruments like the rubab, tabla, and harmonium. Music is an important part of celebrations and gatherings.",
            ),
            CultureTopic.Section(
                "Calligraphy & Art",
                "Persian calligraphy is highly valued as an art form. Geometric patterns and floral designs are common in Afghan arts and crafts.",
            ),
        ),
    ),
    CultureTopic(
        title = "Core Values",
        icon = TopicIcon.Heart,
        sections = listOf(
            CultureTopic.Section(
                "Honor & Dignity (ناموس - namus)",
                "Personal and family honor are highly valued. Maintaining dignity and reputation in the community is important.",
            ),
            CultureTopic.Section(
                "Hospitality (مهمان‌نوازی)",
                "Guests are considered a blessing. The saying 'Mehman habib-ullah ast' (A guest is beloved of God) reflects this value.",
            ),
            CultureTopic.Section(
                "Community & Solidarity",
                "Strong sense of community and mutual support. Neighbors and community members help each other in times of need.",
            ),
        ),
    ),
)
