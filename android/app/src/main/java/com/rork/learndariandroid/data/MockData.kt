package com.rork.learndariandroid.data

/**
 * The copy of the content bundled with the app.
 *
 * Used for a brand-new install before the first download from the backend, and
 * as a permanent safety net if the network is never reachable. Once content has
 * been fetched, [ContentRepository] serves the live document instead.
 *
 * Kept identical to the iOS `MockData` so both platforms teach the same course.
 */
object MockData {

    /** Stable, human-readable ids so progress survives a content refresh. */
    private fun w(
        prefix: String,
        english: String,
        dari: String,
        phonetic: String,
        category: String? = null,
    ): Word = Word(
        id = prefix + "-" + english.lowercase()
            .replace(Regex("[^a-z0-9]+"), "-")
            .trim('-'),
        english = english,
        dari = dari,
        phonetic = phonetic,
        category = category,
    )

    // MARK: - Vocab

    val colours = VocabSet(
        id = "colours",
        emoji = "🎨",
        name = "Colours",
        summary = "Learn basic colour names",
        words = listOf(
            w("colours", "Red", "سرخ", "surkh", "Colours"),
            w("colours", "Blue", "آبی", "ahbee", "Colours"),
            w("colours", "Green", "سبز", "sabz", "Colours"),
            w("colours", "Black", "سیاه", "siyaah", "Colours"),
            w("colours", "White", "سفید", "safed", "Colours"),
            w("colours", "Yellow", "زرد", "zard", "Colours"),
            w("colours", "Orange", "نارنجی", "naarenji", "Colours"),
            w("colours", "Purple", "بنفش", "banafsh", "Colours"),
            w("colours", "Brown", "نصواری", "naswaari", "Colours"),
            w("colours", "Grey", "خاکستری", "khaakestari", "Colours"),
            w("colours", "Pink", "گلابی", "gulaabi", "Colours"),
            w("colours", "Gold", "طلایی", "talaayi", "Colours"),
        ),
    )

    val animals = VocabSet(
        id = "animals",
        emoji = "🐾",
        name = "Animals",
        summary = "Learn animal names",
        words = listOf(
            w("animals", "Cat", "پشک", "pishak", "Animals"),
            w("animals", "Dog", "سگ", "sag", "Animals"),
            w("animals", "Horse", "اسپ", "asp", "Animals"),
            w("animals", "Bird", "پرنده", "parinda", "Animals"),
            w("animals", "Sheep", "گوسفند", "gosfand", "Animals"),
            w("animals", "Cow", "گاو", "gaaw", "Animals"),
            w("animals", "Camel", "اشتر", "ushtur", "Animals"),
            w("animals", "Donkey", "خر", "khar", "Animals"),
            w("animals", "Fish", "ماهی", "maahi", "Animals"),
            w("animals", "Lion", "شیر", "sher", "Animals"),
            w("animals", "Wolf", "گرگ", "gurg", "Animals"),
            w("animals", "Fox", "روباه", "roobaah", "Animals"),
            w("animals", "Chicken", "مرغ", "murgh", "Animals"),
            w("animals", "Goat", "بز", "buz", "Animals"),
        ),
    )

    val food = VocabSet(
        id = "food",
        emoji = "🍽️",
        name = "Food",
        summary = "Common food items",
        words = listOf(
            w("food", "Bread", "نان", "naan", "Food"),
            w("food", "Water", "آب", "aab", "Food"),
            w("food", "Rice", "برنج", "birinj", "Food"),
            w("food", "Meat", "گوشت", "gosht", "Food"),
            w("food", "Tea", "چای", "chaay", "Food"),
            w("food", "Milk", "شیر", "sheer", "Food"),
            w("food", "Salt", "نمک", "namak", "Food"),
            w("food", "Sugar", "بوره", "bora", "Food"),
        ),
    )

    val fruits = VocabSet(
        id = "fruits",
        emoji = "🍎",
        name = "Fruits",
        summary = "Learn fruit names",
        words = listOf(
            w("fruits", "Apple", "سیب", "seb", "Fruits"),
            w("fruits", "Pear", "ناک", "naak", "Fruits"),
            w("fruits", "Grape", "انگور", "angoor", "Fruits"),
            w("fruits", "Pomegranate", "انار", "anaar", "Fruits"),
            w("fruits", "Melon", "خربوزه", "kharbooza", "Fruits"),
            w("fruits", "Watermelon", "تربوز", "tarbooz", "Fruits"),
            w("fruits", "Peach", "شفتالو", "shaftaaloo", "Fruits"),
            w("fruits", "Apricot", "زردالو", "zardaaloo", "Fruits"),
            w("fruits", "Fig", "انجیر", "anjeer", "Fruits"),
            w("fruits", "Cherry", "آلوبالو", "aaloobaaloo", "Fruits"),
            w("fruits", "Orange", "مالته", "maalta", "Fruits"),
            w("fruits", "Banana", "کیله", "kela", "Fruits"),
            w("fruits", "Lemon", "لیمو", "leemoo", "Fruits"),
            w("fruits", "Mulberry", "توت", "toot", "Fruits"),
            w("fruits", "Raisin", "کشمش", "kishmish", "Fruits"),
        ),
    )

    val vegetables = VocabSet(
        id = "vegetables",
        emoji = "🥕",
        name = "Vegetables",
        summary = "Learn vegetable names",
        words = listOf(
            w("vegetables", "Carrot", "زردک", "zardak", "Vegetables"),
            w("vegetables", "Potato", "کچالو", "kachaaloo", "Vegetables"),
            w("vegetables", "Onion", "پیاز", "piyaaz", "Vegetables"),
            w("vegetables", "Tomato", "بادنجان رومی", "baadenjaan-e roomi", "Vegetables"),
            w("vegetables", "Cucumber", "بادرنگ", "baadrang", "Vegetables"),
            w("vegetables", "Spinach", "پالک", "paalak", "Vegetables"),
            w("vegetables", "Garlic", "سیر", "seer", "Vegetables"),
            w("vegetables", "Pumpkin", "کدو", "kadoo", "Vegetables"),
            w("vegetables", "Cabbage", "کرم", "karam", "Vegetables"),
            w("vegetables", "Pepper", "مرچ", "murch", "Vegetables"),
            w("vegetables", "Eggplant", "بادنجان سیاه", "baadenjaan-e siyaah", "Vegetables"),
        ),
    )

    val bodyParts = VocabSet(
        id = "body",
        emoji = "🦴",
        name = "Body Parts",
        summary = "Learn body part names",
        words = listOf(
            w("body", "Head", "سر", "sar", "Body"),
            w("body", "Hand", "دست", "dast", "Body"),
            w("body", "Foot", "پا", "paa", "Body"),
            w("body", "Eye", "چشم", "chashm", "Body"),
            w("body", "Ear", "گوش", "gosh", "Body"),
            w("body", "Nose", "بینی", "beeni", "Body"),
            w("body", "Mouth", "دهن", "dahan", "Body"),
            w("body", "Tooth", "دندان", "dandaan", "Body"),
            w("body", "Hair", "موی", "moy", "Body"),
            w("body", "Heart", "دل", "dil", "Body"),
            w("body", "Face", "روی", "roy", "Body"),
            w("body", "Finger", "انگشت", "angusht", "Body"),
        ),
    )

    val daysMonths = VocabSet(
        id = "days",
        emoji = "📅",
        name = "Days & Months",
        summary = "Days of the week and months",
        words = listOf(
            w("days", "Saturday", "شنبه", "shambe", "Time"),
            w("days", "Sunday", "یکشنبه", "yakshambe", "Time"),
            w("days", "Monday", "دوشنبه", "doshambe", "Time"),
            w("days", "Tuesday", "سه‌شنبه", "seshambe", "Time"),
            w("days", "Wednesday", "چهارشنبه", "chaarshambe", "Time"),
            w("days", "Thursday", "پنجشنبه", "panjshambe", "Time"),
            w("days", "Friday", "جمعه", "juma", "Time"),
            w("days", "Today", "امروز", "emroz", "Time"),
            w("days", "Tomorrow", "فردا", "fardaa", "Time"),
            w("days", "Yesterday", "دیروز", "deroz", "Time"),
            w("days", "Week", "هفته", "hafta", "Time"),
            w("days", "Month", "ماه", "maah", "Time"),
            w("days", "Year", "سال", "saal", "Time"),
            w("days", "Morning", "صبح", "subh", "Time"),
            w("days", "Noon", "چاشت", "chaasht", "Time"),
            w("days", "Evening", "شام", "shaam", "Time"),
            w("days", "Night", "شب", "shab", "Time"),
            w("days", "Hour", "ساعت", "saa'at", "Time"),
            w("days", "Minute", "دقیقه", "daqeeqa", "Time"),
        ),
    )

    val weather = VocabSet(
        id = "weather",
        emoji = "🌤️",
        name = "Weather",
        summary = "Talk about the weather",
        words = listOf(
            w("weather", "Sun", "آفتاب", "aaftaab", "Weather"),
            w("weather", "Rain", "باران", "baaraan", "Weather"),
            w("weather", "Snow", "برف", "barf", "Weather"),
            w("weather", "Wind", "باد", "baad", "Weather"),
            w("weather", "Cloud", "ابر", "abr", "Weather"),
            w("weather", "Hot", "گرم", "garm", "Weather"),
            w("weather", "Cold", "سرد", "sard", "Weather"),
            w("weather", "Sky", "آسمان", "aasmaan", "Weather"),
            w("weather", "Storm", "طوفان", "toofaan", "Weather"),
            w("weather", "Fog", "مه", "meh", "Weather"),
        ),
    )

    val vocabSets: List<VocabSet> = listOf(
        colours, animals, food, fruits, vegetables, bodyParts, daysMonths, weather,
    )

    // MARK: - Learn path

    val units: List<LearnUnit> = listOf(
        LearnUnit(
            id = "u1", index = 1, title = "Alphabet & Sounds",
            lessons = listOf(
                Lesson(
                    "u1l1", "First Letters", "ا ب پ ت",
                    listOf(
                        w("u1l1", "Alef", "ا", "aa"),
                        w("u1l1", "Be", "ب", "be"),
                        w("u1l1", "Pe", "پ", "pe"),
                        w("u1l1", "Te", "ت", "te"),
                    ),
                ),
                Lesson(
                    "u1l2", "More Letters", "ث ج چ ح",
                    listOf(
                        w("u1l2", "Se", "ث", "se"),
                        w("u1l2", "Jim", "ج", "jim"),
                        w("u1l2", "Che", "چ", "che"),
                        w("u1l2", "He", "ح", "he"),
                    ),
                ),
                Lesson(
                    "u1l3", "Vowel Sounds", "Short and long vowels",
                    listOf(
                        w("u1l3", "Long A", "آ", "aa"),
                        w("u1l3", "Long U", "او", "oo"),
                        w("u1l3", "Long I", "ای", "ee"),
                    ),
                ),
            ),
        ),
        LearnUnit(
            id = "u2", index = 2, title = "Letter Forms",
            lessons = listOf(
                Lesson(
                    "u2l1", "Joining Letters", "How letters connect",
                    listOf(
                        w("u2l1", "Water", "آب", "aab"),
                        w("u2l1", "Bread", "نان", "naan"),
                        w("u2l1", "Name", "نام", "naam"),
                    ),
                ),
                Lesson(
                    "u2l2", "Initial & Final", "Position changes shape",
                    listOf(
                        w("u2l2", "Hand", "دست", "dast"),
                        w("u2l2", "Door", "دروازه", "darwaaza"),
                        w("u2l2", "Book", "کتاب", "kitaab"),
                    ),
                ),
                Lesson(
                    "u2l3", "Reading Practice", "Your first words",
                    listOf(
                        w("u2l3", "House", "خانه", "khaana"),
                        w("u2l3", "School", "مکتب", "maktab"),
                        w("u2l3", "City", "شهر", "shahr"),
                    ),
                ),
            ),
        ),
        LearnUnit(
            id = "u3", index = 3, title = "Basic Words",
            lessons = listOf(
                Lesson(
                    "u3l1", "Family Words", "People closest to you",
                    listOf(
                        w("u3l1", "Mother", "مادر", "maadar"),
                        w("u3l1", "Father", "پدر", "padar"),
                        w("u3l1", "Brother", "برادر", "baraadar"),
                        w("u3l1", "Sister", "خواهر", "khwaahar"),
                    ),
                ),
                Lesson(
                    "u3l2", "Numbers 1–10", "Counting in Dari",
                    listOf(
                        w("u3l2", "One", "یک", "yak"),
                        w("u3l2", "Two", "دو", "du"),
                        w("u3l2", "Three", "سه", "se"),
                        w("u3l2", "Four", "چهار", "chaar"),
                        w("u3l2", "Five", "پنج", "panj"),
                    ),
                ),
                Lesson(
                    "u3l3", "Colours & Shapes", "Describing things",
                    listOf(
                        w("u3l3", "Red", "سرخ", "surkh"),
                        w("u3l3", "Blue", "آبی", "ahbee"),
                        w("u3l3", "Green", "سبز", "sabz"),
                        w("u3l3", "Round", "مدور", "mudawar"),
                    ),
                ),
                Lesson(
                    "u3l4", "Around the House", "Everyday objects",
                    listOf(
                        w("u3l4", "Table", "میز", "mez"),
                        w("u3l4", "Chair", "چوکی", "chawki"),
                        w("u3l4", "Window", "کلکین", "kilkeen"),
                    ),
                ),
            ),
        ),
        LearnUnit(
            id = "u4", index = 4, title = "Everyday Phrases",
            lessons = listOf(
                Lesson(
                    "u4l1", "Greetings & Salaam", "Say hello properly",
                    listOf(
                        w("u4l1", "Hello", "سلام", "salaam"),
                        w("u4l1", "Goodbye", "خدا حافظ", "khudaa haafiz"),
                        w("u4l1", "Welcome", "خوش آمدید", "khush aamadid"),
                    ),
                ),
                Lesson(
                    "u4l2", "Asking How Someone Is", "Small talk",
                    listOf(
                        w("u4l2", "How are you?", "چطور استی؟", "chetor asti?"),
                        w("u4l2", "I am well", "خوب استم", "khub astum"),
                        w("u4l2", "Thank you", "تشکر", "tashakor"),
                    ),
                ),
                Lesson(
                    "u4l3", "Please & Sorry", "Polite words",
                    listOf(
                        w("u4l3", "Please", "لطفاً", "lutfan"),
                        w("u4l3", "Sorry", "معذرت", "ma'zerat"),
                        w("u4l3", "No problem", "مشکل نیست", "mushkil nest"),
                    ),
                ),
            ),
        ),
        LearnUnit(
            id = "u5", index = 5, title = "Simple Conversations",
            lessons = listOf(
                Lesson(
                    "u5l1", "Introducing Yourself", "Names and origins",
                    listOf(
                        w("u5l1", "My name is…", "نام من … است", "naam-e man … ast"),
                        w("u5l1", "Where are you from?", "از کجا استی؟", "az kujaa asti?"),
                        w("u5l1", "I am from Kabul", "من از کابل استم", "man az Kaabul astum"),
                    ),
                ),
                Lesson(
                    "u5l2", "In the Bazaar", "Buying and asking prices",
                    listOf(
                        w("u5l2", "How much is it?", "چند است؟", "chand ast?"),
                        w("u5l2", "Too expensive", "بسیار قیمت است", "bisyaar qeemat ast"),
                        w("u5l2", "I want this", "این را می‌خواهم", "een raa mekhwaaham"),
                    ),
                ),
                Lesson(
                    "u5l3", "Sharing a Meal", "Tea, food and hospitality",
                    listOf(
                        w("u5l3", "Bon appétit", "نوش جان", "nosh-e jaan"),
                        w("u5l3", "It is delicious", "بسیار مزه‌دار است", "bisyaar maza-daar ast"),
                        w("u5l3", "I am full", "سیر استم", "ser astum"),
                    ),
                ),
            ),
        ),
        LearnUnit(
            id = "u6", index = 6, title = "Getting Around",
            lessons = listOf(
                Lesson(
                    "u6l1", "Directions", "Left, right, straight",
                    listOf(
                        w("u6l1", "Left", "چپ", "chap"),
                        w("u6l1", "Right", "راست", "raast"),
                        w("u6l1", "Straight", "مستقیم", "mustaqeem"),
                    ),
                ),
                Lesson(
                    "u6l2", "Travel Words", "Getting from A to B",
                    listOf(
                        w("u6l2", "Car", "موتر", "motar"),
                        w("u6l2", "Road", "سرک", "sarak"),
                        w("u6l2", "Airport", "میدان هوایی", "maidaan-e hawaayi"),
                    ),
                ),
            ),
        ),
        LearnUnit(
            id = "u7", index = 7, title = "Feelings & People",
            lessons = listOf(
                Lesson(
                    "u7l1", "How You Feel", "Happy, tired, hungry",
                    listOf(
                        w("u7l1", "Happy", "خوشحال", "khushhaal"),
                        w("u7l1", "Tired", "مانده", "maanda"),
                        w("u7l1", "Hungry", "گشنه", "gushna"),
                    ),
                ),
                Lesson(
                    "u7l2", "Describing People", "Kind, tall, young",
                    listOf(
                        w("u7l2", "Kind", "مهربان", "mehrabaan"),
                        w("u7l2", "Tall", "بلند قد", "buland qad"),
                        w("u7l2", "Young", "جوان", "jawaan"),
                    ),
                ),
            ),
        ),
        LearnUnit(
            id = "u8", index = 8, title = "Telling Stories",
            lessons = listOf(
                Lesson(
                    "u8l1", "Past & Future", "Talking across time",
                    listOf(
                        w("u8l1", "I went", "رفتم", "raftam"),
                        w("u8l1", "I will go", "می‌روم", "meraawam"),
                        w("u8l1", "I saw", "دیدم", "deedam"),
                    ),
                ),
                Lesson(
                    "u8l2", "Telling a Story", "Linking your sentences",
                    listOf(
                        w("u8l2", "Then", "بعد", "ba'd"),
                        w("u8l2", "Because", "چون", "chun"),
                        w("u8l2", "But", "اما", "ammaa"),
                    ),
                ),
            ),
        ),
    )

    // MARK: - Culture

    val proverbs: List<Proverb> = listOf(
        Proverb(
            id = "p1",
            english = "Do good and throw it into the river",
            dari = "نیکی کن و در دریا انداز",
            phonetic = "Niki kon wa dar darya andaz",
            meaning = "Do good deeds without expecting anything in return.",
            category = "Kindness",
        ),
        Proverb(
            id = "p2",
            english = "A drop by drop becomes a river",
            dari = "قطره قطره دریا می‌شود",
            phonetic = "Qatra qatra darya meshawad",
            meaning = "Small consistent efforts add up to something great.",
            category = "Patience",
        ),
        Proverb(
            id = "p3",
            english = "The guest is a gift from God",
            dari = "مهمان هدیهٔ خداست",
            phonetic = "Mehmaan hadya-ye khudaast",
            meaning = "Hospitality is sacred in Afghan culture.",
            category = "Hospitality",
        ),
        Proverb(
            id = "p4",
            english = "One hand alone makes no sound",
            dari = "یک دست صدا ندارد",
            phonetic = "Yak dast sadaa nadaarad",
            meaning = "Nothing meaningful is achieved alone.",
            category = "Community",
        ),
        Proverb(
            id = "p5",
            english = "The knife does not cut its own handle",
            dari = "کارد دستهٔ خود را نمی‌برد",
            phonetic = "Kaard dasta-ye khud raa nameborad",
            meaning = "People rarely act against their own family or interests.",
            category = "Family",
        ),
        Proverb(
            id = "p6",
            english = "Whoever seeks, finds",
            dari = "جوینده یابنده است",
            phonetic = "Jooyanda yaabanda ast",
            meaning = "Persistence is eventually rewarded.",
            category = "Effort",
        ),
    )

    // MARK: - Explore

    val wordOfTheDay = w("fruits", "Pear", "ناک", "naak", "Fruits")

    val popularWords: List<Word> = listOf(
        w("popular", "Red", "سرخ", "surkh", "Colours"),
        w("popular", "Thank you", "تشکر", "tashakor", "Phrases"),
        w("popular", "Water", "آب", "aab", "Food"),
        w("popular", "How are you?", "چطور استی؟", "chetor asti?", "Phrases"),
        w("popular", "Mother", "مادر", "maadar", "Family"),
        w("popular", "Beautiful", "مقبول", "maqbool", "Adjectives"),
    )

    /** Phrase-level entries so search feels like a translator, not a word list. */
    val phrases: List<Word> = listOf(
        w("phrase", "Good morning", "صبح بخیر", "subh ba khair", "Phrases"),
        w("phrase", "Good night", "شب بخیر", "shab ba khair", "Phrases"),
        w("phrase", "What is your name?", "نام شما چیست؟", "naam-e shumaa cheest?", "Phrases"),
        w("phrase", "I don't understand", "نمی‌فهمم", "namefahmam", "Phrases"),
        w("phrase", "Where is the bathroom?", "تشناب کجاست؟", "tashnaab kujaast?", "Phrases"),
        w("phrase", "I love you", "دوستت دارم", "dostet daaram", "Phrases"),
        w("phrase", "See you tomorrow", "تا فردا", "taa fardaa", "Phrases"),
        w("phrase", "How much is it?", "چند است؟", "chand ast?", "Phrases"),
        w("phrase", "I am learning Dari", "من دری یاد می‌گیرم", "man Dari yaad megeeram", "Phrases"),
        w("phrase", "Please speak slowly", "لطفاً آهسته گپ بزنید", "lutfan aahesta gap bezaned", "Phrases"),
    )

    /** The bundled content as one document, matching what the backend serves. */
    val bundledDocument = ContentDocument(
        vocabSets = vocabSets,
        units = units,
        proverbs = proverbs,
        popularWords = popularWords,
        phrases = phrases,
        wordOfTheDaySchedule = emptyList(),
    )

    /** Last-resort word so the Word of the Day card can never render empty. */
    val fallbackWord = wordOfTheDay
}
