import Foundation

/// The copy of the content bundled with the app.
///
/// Used for a brand-new install before the first download from the backend,
/// and as a permanent safety net if the network is never reachable. Once
/// content has been fetched, `ContentService` serves the live document instead.
nonisolated enum MockData {
    // MARK: - Vocab

    static let colours = VocabSet(
        id: "colours",
        emoji: "🎨",
        name: "Colours",
        summary: "Learn basic colour names",
        words: [
            Word(english: "Red", dari: "سرخ", phonetic: "surkh", category: "Colours"),
            Word(english: "Blue", dari: "آبی", phonetic: "ahbee", category: "Colours"),
            Word(english: "Green", dari: "سبز", phonetic: "sabz", category: "Colours"),
            Word(english: "Black", dari: "سیاه", phonetic: "siyaah", category: "Colours"),
            Word(english: "White", dari: "سفید", phonetic: "safed", category: "Colours"),
            Word(english: "Yellow", dari: "زرد", phonetic: "zard", category: "Colours"),
            Word(english: "Orange", dari: "نارنجی", phonetic: "naarenji", category: "Colours"),
            Word(english: "Purple", dari: "بنفش", phonetic: "banafsh", category: "Colours"),
            Word(english: "Brown", dari: "نصواری", phonetic: "naswaari", category: "Colours"),
            Word(english: "Grey", dari: "خاکستری", phonetic: "khaakestari", category: "Colours"),
            Word(english: "Pink", dari: "گلابی", phonetic: "gulaabi", category: "Colours"),
            Word(english: "Gold", dari: "طلایی", phonetic: "talaayi", category: "Colours"),
        ]
    )

    static let animals = VocabSet(
        id: "animals",
        emoji: "🐾",
        name: "Animals",
        summary: "Learn animal names",
        words: [
            Word(english: "Cat", dari: "پشک", phonetic: "pishak", category: "Animals"),
            Word(english: "Dog", dari: "سگ", phonetic: "sag", category: "Animals"),
            Word(english: "Horse", dari: "اسپ", phonetic: "asp", category: "Animals"),
            Word(english: "Bird", dari: "پرنده", phonetic: "parinda", category: "Animals"),
            Word(english: "Sheep", dari: "گوسفند", phonetic: "gosfand", category: "Animals"),
            Word(english: "Cow", dari: "گاو", phonetic: "gaaw", category: "Animals"),
            Word(english: "Camel", dari: "اشتر", phonetic: "ushtur", category: "Animals"),
            Word(english: "Donkey", dari: "خر", phonetic: "khar", category: "Animals"),
            Word(english: "Fish", dari: "ماهی", phonetic: "maahi", category: "Animals"),
            Word(english: "Lion", dari: "شیر", phonetic: "sher", category: "Animals"),
            Word(english: "Wolf", dari: "گرگ", phonetic: "gurg", category: "Animals"),
            Word(english: "Fox", dari: "روباه", phonetic: "roobaah", category: "Animals"),
            Word(english: "Chicken", dari: "مرغ", phonetic: "murgh", category: "Animals"),
            Word(english: "Goat", dari: "بز", phonetic: "buz", category: "Animals"),
        ]
    )

    static let food = VocabSet(
        id: "food",
        emoji: "🍽️",
        name: "Food",
        summary: "Common food items",
        words: [
            Word(english: "Bread", dari: "نان", phonetic: "naan", category: "Food"),
            Word(english: "Water", dari: "آب", phonetic: "aab", category: "Food"),
            Word(english: "Rice", dari: "برنج", phonetic: "birinj", category: "Food"),
            Word(english: "Meat", dari: "گوشت", phonetic: "gosht", category: "Food"),
            Word(english: "Tea", dari: "چای", phonetic: "chaay", category: "Food"),
            Word(english: "Milk", dari: "شیر", phonetic: "sheer", category: "Food"),
            Word(english: "Salt", dari: "نمک", phonetic: "namak", category: "Food"),
            Word(english: "Sugar", dari: "بوره", phonetic: "bora", category: "Food"),
        ]
    )

    static let fruits = VocabSet(
        id: "fruits",
        emoji: "🍎",
        name: "Fruits",
        summary: "Learn fruit names",
        words: [
            Word(english: "Apple", dari: "سیب", phonetic: "seb", category: "Fruits"),
            Word(english: "Pear", dari: "ناک", phonetic: "naak", category: "Fruits"),
            Word(english: "Grape", dari: "انگور", phonetic: "angoor", category: "Fruits"),
            Word(english: "Pomegranate", dari: "انار", phonetic: "anaar", category: "Fruits"),
            Word(english: "Melon", dari: "خربوزه", phonetic: "kharbooza", category: "Fruits"),
            Word(english: "Watermelon", dari: "تربوز", phonetic: "tarbooz", category: "Fruits"),
            Word(english: "Peach", dari: "شفتالو", phonetic: "shaftaaloo", category: "Fruits"),
            Word(english: "Apricot", dari: "زردالو", phonetic: "zardaaloo", category: "Fruits"),
            Word(english: "Fig", dari: "انجیر", phonetic: "anjeer", category: "Fruits"),
            Word(english: "Cherry", dari: "آلوبالو", phonetic: "aaloobaaloo", category: "Fruits"),
            Word(english: "Orange", dari: "مالته", phonetic: "maalta", category: "Fruits"),
            Word(english: "Banana", dari: "کیله", phonetic: "kela", category: "Fruits"),
            Word(english: "Lemon", dari: "لیمو", phonetic: "leemoo", category: "Fruits"),
            Word(english: "Mulberry", dari: "توت", phonetic: "toot", category: "Fruits"),
            Word(english: "Raisin", dari: "کشمش", phonetic: "kishmish", category: "Fruits"),
        ]
    )

    static let vegetables = VocabSet(
        id: "vegetables",
        emoji: "🥕",
        name: "Vegetables",
        summary: "Learn vegetable names",
        words: [
            Word(english: "Carrot", dari: "زردک", phonetic: "zardak", category: "Vegetables"),
            Word(english: "Potato", dari: "کچالو", phonetic: "kachaaloo", category: "Vegetables"),
            Word(english: "Onion", dari: "پیاز", phonetic: "piyaaz", category: "Vegetables"),
            Word(english: "Tomato", dari: "بادنجان رومی", phonetic: "baadenjaan-e roomi", category: "Vegetables"),
            Word(english: "Cucumber", dari: "بادرنگ", phonetic: "baadrang", category: "Vegetables"),
            Word(english: "Spinach", dari: "پالک", phonetic: "paalak", category: "Vegetables"),
            Word(english: "Garlic", dari: "سیر", phonetic: "seer", category: "Vegetables"),
            Word(english: "Pumpkin", dari: "کدو", phonetic: "kadoo", category: "Vegetables"),
            Word(english: "Cabbage", dari: "کرم", phonetic: "karam", category: "Vegetables"),
            Word(english: "Pepper", dari: "مرچ", phonetic: "murch", category: "Vegetables"),
            Word(english: "Eggplant", dari: "بادنجان سیاه", phonetic: "baadenjaan-e siyaah", category: "Vegetables"),
        ]
    )

    static let bodyParts = VocabSet(
        id: "body",
        emoji: "🦴",
        name: "Body Parts",
        summary: "Learn body part names",
        words: [
            Word(english: "Head", dari: "سر", phonetic: "sar", category: "Body"),
            Word(english: "Hand", dari: "دست", phonetic: "dast", category: "Body"),
            Word(english: "Foot", dari: "پا", phonetic: "paa", category: "Body"),
            Word(english: "Eye", dari: "چشم", phonetic: "chashm", category: "Body"),
            Word(english: "Ear", dari: "گوش", phonetic: "gosh", category: "Body"),
            Word(english: "Nose", dari: "بینی", phonetic: "beeni", category: "Body"),
            Word(english: "Mouth", dari: "دهن", phonetic: "dahan", category: "Body"),
            Word(english: "Tooth", dari: "دندان", phonetic: "dandaan", category: "Body"),
            Word(english: "Hair", dari: "موی", phonetic: "moy", category: "Body"),
            Word(english: "Heart", dari: "دل", phonetic: "dil", category: "Body"),
            Word(english: "Face", dari: "روی", phonetic: "roy", category: "Body"),
            Word(english: "Finger", dari: "انگشت", phonetic: "angusht", category: "Body"),
        ]
    )

    static let daysMonths = VocabSet(
        id: "days",
        emoji: "📅",
        name: "Days & Months",
        summary: "Days of the week and months",
        words: [
            Word(english: "Saturday", dari: "شنبه", phonetic: "shambe", category: "Time"),
            Word(english: "Sunday", dari: "یکشنبه", phonetic: "yakshambe", category: "Time"),
            Word(english: "Monday", dari: "دوشنبه", phonetic: "doshambe", category: "Time"),
            Word(english: "Tuesday", dari: "سه‌شنبه", phonetic: "seshambe", category: "Time"),
            Word(english: "Wednesday", dari: "چهارشنبه", phonetic: "chaarshambe", category: "Time"),
            Word(english: "Thursday", dari: "پنجشنبه", phonetic: "panjshambe", category: "Time"),
            Word(english: "Friday", dari: "جمعه", phonetic: "juma", category: "Time"),
            Word(english: "Today", dari: "امروز", phonetic: "emroz", category: "Time"),
            Word(english: "Tomorrow", dari: "فردا", phonetic: "fardaa", category: "Time"),
            Word(english: "Yesterday", dari: "دیروز", phonetic: "deroz", category: "Time"),
            Word(english: "Week", dari: "هفته", phonetic: "hafta", category: "Time"),
            Word(english: "Month", dari: "ماه", phonetic: "maah", category: "Time"),
            Word(english: "Year", dari: "سال", phonetic: "saal", category: "Time"),
            Word(english: "Morning", dari: "صبح", phonetic: "subh", category: "Time"),
            Word(english: "Noon", dari: "چاشت", phonetic: "chaasht", category: "Time"),
            Word(english: "Evening", dari: "شام", phonetic: "shaam", category: "Time"),
            Word(english: "Night", dari: "شب", phonetic: "shab", category: "Time"),
            Word(english: "Hour", dari: "ساعت", phonetic: "saa'at", category: "Time"),
            Word(english: "Minute", dari: "دقیقه", phonetic: "daqeeqa", category: "Time"),
        ]
    )

    static let weather = VocabSet(
        id: "weather",
        emoji: "🌤️",
        name: "Weather",
        summary: "Talk about the weather",
        words: [
            Word(english: "Sun", dari: "آفتاب", phonetic: "aaftaab", category: "Weather"),
            Word(english: "Rain", dari: "باران", phonetic: "baaraan", category: "Weather"),
            Word(english: "Snow", dari: "برف", phonetic: "barf", category: "Weather"),
            Word(english: "Wind", dari: "باد", phonetic: "baad", category: "Weather"),
            Word(english: "Cloud", dari: "ابر", phonetic: "abr", category: "Weather"),
            Word(english: "Hot", dari: "گرم", phonetic: "garm", category: "Weather"),
            Word(english: "Cold", dari: "سرد", phonetic: "sard", category: "Weather"),
            Word(english: "Sky", dari: "آسمان", phonetic: "aasmaan", category: "Weather"),
            Word(english: "Storm", dari: "طوفان", phonetic: "toofaan", category: "Weather"),
            Word(english: "Fog", dari: "مه", phonetic: "meh", category: "Weather"),
        ]
    )

    static let vocabSets: [VocabSet] = [
        colours, animals, food, fruits, vegetables, bodyParts, daysMonths, weather,
    ]

    // MARK: - Learn path

    static let units: [LearnUnit] = [
        LearnUnit(id: "u1", index: 1, title: "Alphabet & Sounds", lessons: [
            Lesson(id: "u1l1", title: "First Letters", subtitle: "ا ب پ ت", words: [
                Word(english: "Alef", dari: "ا", phonetic: "aa"),
                Word(english: "Be", dari: "ب", phonetic: "be"),
                Word(english: "Pe", dari: "پ", phonetic: "pe"),
                Word(english: "Te", dari: "ت", phonetic: "te"),
            ]),
            Lesson(id: "u1l2", title: "More Letters", subtitle: "ث ج چ ح", words: [
                Word(english: "Se", dari: "ث", phonetic: "se"),
                Word(english: "Jim", dari: "ج", phonetic: "jim"),
                Word(english: "Che", dari: "چ", phonetic: "che"),
                Word(english: "He", dari: "ح", phonetic: "he"),
            ]),
            Lesson(id: "u1l3", title: "Vowel Sounds", subtitle: "Short and long vowels", words: [
                Word(english: "Long A", dari: "آ", phonetic: "aa"),
                Word(english: "Long U", dari: "او", phonetic: "oo"),
                Word(english: "Long I", dari: "ای", phonetic: "ee"),
            ]),
        ]),
        LearnUnit(id: "u2", index: 2, title: "Letter Forms", lessons: [
            Lesson(id: "u2l1", title: "Joining Letters", subtitle: "How letters connect", words: [
                Word(english: "Water", dari: "آب", phonetic: "aab"),
                Word(english: "Bread", dari: "نان", phonetic: "naan"),
                Word(english: "Name", dari: "نام", phonetic: "naam"),
            ]),
            Lesson(id: "u2l2", title: "Initial & Final", subtitle: "Position changes shape", words: [
                Word(english: "Hand", dari: "دست", phonetic: "dast"),
                Word(english: "Door", dari: "دروازه", phonetic: "darwaaza"),
                Word(english: "Book", dari: "کتاب", phonetic: "kitaab"),
            ]),
            Lesson(id: "u2l3", title: "Reading Practice", subtitle: "Your first words", words: [
                Word(english: "House", dari: "خانه", phonetic: "khaana"),
                Word(english: "School", dari: "مکتب", phonetic: "maktab"),
                Word(english: "City", dari: "شهر", phonetic: "shahr"),
            ]),
        ]),
        LearnUnit(id: "u3", index: 3, title: "Basic Words", lessons: [
            Lesson(id: "u3l1", title: "Family Words", subtitle: "People closest to you", words: [
                Word(english: "Mother", dari: "مادر", phonetic: "maadar"),
                Word(english: "Father", dari: "پدر", phonetic: "padar"),
                Word(english: "Brother", dari: "برادر", phonetic: "baraadar"),
                Word(english: "Sister", dari: "خواهر", phonetic: "khwaahar"),
            ]),
            Lesson(id: "u3l2", title: "Numbers 1–10", subtitle: "Counting in Dari", words: [
                Word(english: "One", dari: "یک", phonetic: "yak"),
                Word(english: "Two", dari: "دو", phonetic: "du"),
                Word(english: "Three", dari: "سه", phonetic: "se"),
                Word(english: "Four", dari: "چهار", phonetic: "chaar"),
                Word(english: "Five", dari: "پنج", phonetic: "panj"),
            ]),
            Lesson(id: "u3l3", title: "Colours & Shapes", subtitle: "Describing things", words: [
                Word(english: "Red", dari: "سرخ", phonetic: "surkh"),
                Word(english: "Blue", dari: "آبی", phonetic: "ahbee"),
                Word(english: "Green", dari: "سبز", phonetic: "sabz"),
                Word(english: "Round", dari: "مدور", phonetic: "mudawar"),
            ]),
            Lesson(id: "u3l4", title: "Around the House", subtitle: "Everyday objects", words: [
                Word(english: "Table", dari: "میز", phonetic: "mez"),
                Word(english: "Chair", dari: "چوکی", phonetic: "chawki"),
                Word(english: "Window", dari: "کلکین", phonetic: "kilkeen"),
            ]),
        ]),
        LearnUnit(id: "u4", index: 4, title: "Everyday Phrases", lessons: [
            Lesson(id: "u4l1", title: "Greetings & Salaam", subtitle: "Say hello properly", words: [
                Word(english: "Hello", dari: "سلام", phonetic: "salaam"),
                Word(english: "Goodbye", dari: "خدا حافظ", phonetic: "khudaa haafiz"),
                Word(english: "Welcome", dari: "خوش آمدید", phonetic: "khush aamadid"),
            ]),
            Lesson(id: "u4l2", title: "Asking How Someone Is", subtitle: "Small talk", words: [
                Word(english: "How are you?", dari: "چطور استی؟", phonetic: "chetor asti?"),
                Word(english: "I am well", dari: "خوب استم", phonetic: "khub astum"),
                Word(english: "Thank you", dari: "تشکر", phonetic: "tashakor"),
            ]),
            Lesson(id: "u4l3", title: "Please & Sorry", subtitle: "Polite words", words: [
                Word(english: "Please", dari: "لطفاً", phonetic: "lutfan"),
                Word(english: "Sorry", dari: "معذرت", phonetic: "ma'zerat"),
                Word(english: "No problem", dari: "مشکل نیست", phonetic: "mushkil nest"),
            ]),
        ]),
        LearnUnit(id: "u5", index: 5, title: "Simple Conversations", lessons: [
            Lesson(id: "u5l1", title: "Introducing Yourself", subtitle: "Names and origins", words: [
                Word(english: "My name is…", dari: "نام من … است", phonetic: "naam-e man … ast"),
                Word(english: "Where are you from?", dari: "از کجا استی؟", phonetic: "az kujaa asti?"),
                Word(english: "I am from Kabul", dari: "من از کابل استم", phonetic: "man az Kaabul astum"),
            ]),
            Lesson(id: "u5l2", title: "In the Bazaar", subtitle: "Buying and asking prices", words: [
                Word(english: "How much is it?", dari: "چند است؟", phonetic: "chand ast?"),
                Word(english: "Too expensive", dari: "بسیار قیمت است", phonetic: "bisyaar qeemat ast"),
                Word(english: "I want this", dari: "این را می‌خواهم", phonetic: "een raa mekhwaaham"),
            ]),
            Lesson(id: "u5l3", title: "Sharing a Meal", subtitle: "Tea, food and hospitality", words: [
                Word(english: "Bon appétit", dari: "نوش جان", phonetic: "nosh-e jaan"),
                Word(english: "It is delicious", dari: "بسیار مزه‌دار است", phonetic: "bisyaar maza-daar ast"),
                Word(english: "I am full", dari: "سیر استم", phonetic: "ser astum"),
            ]),
        ]),
        LearnUnit(id: "u6", index: 6, title: "Getting Around", lessons: [
            Lesson(id: "u6l1", title: "Directions", subtitle: "Left, right, straight", words: [
                Word(english: "Left", dari: "چپ", phonetic: "chap"),
                Word(english: "Right", dari: "راست", phonetic: "raast"),
                Word(english: "Straight", dari: "مستقیم", phonetic: "mustaqeem"),
            ]),
            Lesson(id: "u6l2", title: "Travel Words", subtitle: "Getting from A to B", words: [
                Word(english: "Car", dari: "موتر", phonetic: "motar"),
                Word(english: "Road", dari: "سرک", phonetic: "sarak"),
                Word(english: "Airport", dari: "میدان هوایی", phonetic: "maidaan-e hawaayi"),
            ]),
        ]),
        LearnUnit(id: "u7", index: 7, title: "Feelings & People", lessons: [
            Lesson(id: "u7l1", title: "How You Feel", subtitle: "Happy, tired, hungry", words: [
                Word(english: "Happy", dari: "خوشحال", phonetic: "khushhaal"),
                Word(english: "Tired", dari: "مانده", phonetic: "maanda"),
                Word(english: "Hungry", dari: "گشنه", phonetic: "gushna"),
            ]),
            Lesson(id: "u7l2", title: "Describing People", subtitle: "Kind, tall, young", words: [
                Word(english: "Kind", dari: "مهربان", phonetic: "mehrabaan"),
                Word(english: "Tall", dari: "بلند قد", phonetic: "buland qad"),
                Word(english: "Young", dari: "جوان", phonetic: "jawaan"),
            ]),
        ]),
        LearnUnit(id: "u8", index: 8, title: "Telling Stories", lessons: [
            Lesson(id: "u8l1", title: "Past & Future", subtitle: "Talking across time", words: [
                Word(english: "I went", dari: "رفتم", phonetic: "raftam"),
                Word(english: "I will go", dari: "می‌روم", phonetic: "meraawam"),
                Word(english: "I saw", dari: "دیدم", phonetic: "deedam"),
            ]),
            Lesson(id: "u8l2", title: "Telling a Story", subtitle: "Linking your sentences", words: [
                Word(english: "Then", dari: "بعد", phonetic: "ba'd"),
                Word(english: "Because", dari: "چون", phonetic: "chun"),
                Word(english: "But", dari: "اما", phonetic: "ammaa"),
            ]),
        ]),
    ]

    static let totalUnitCount = 12

    // MARK: - Culture

    static let proverbs: [Proverb] = [
        Proverb(
            id: "p1",
            english: "Do good and throw it into the river",
            dari: "نیکی کن و در دریا انداز",
            phonetic: "Niki kon wa dar darya andaz",
            meaning: "Do good deeds without expecting anything in return.",
            category: "Kindness"
        ),
        Proverb(
            id: "p2",
            english: "A drop by drop becomes a river",
            dari: "قطره قطره دریا می‌شود",
            phonetic: "Qatra qatra darya meshawad",
            meaning: "Small consistent efforts add up to something great.",
            category: "Patience"
        ),
        Proverb(
            id: "p3",
            english: "The guest is a gift from God",
            dari: "مهمان هدیهٔ خداست",
            phonetic: "Mehmaan hadya-ye khudaast",
            meaning: "Hospitality is sacred in Afghan culture.",
            category: "Hospitality"
        ),
        Proverb(
            id: "p4",
            english: "One hand alone makes no sound",
            dari: "یک دست صدا ندارد",
            phonetic: "Yak dast sadaa nadaarad",
            meaning: "Nothing meaningful is achieved alone.",
            category: "Community"
        ),
        Proverb(
            id: "p5",
            english: "The knife does not cut its own handle",
            dari: "کارد دستهٔ خود را نمی‌برد",
            phonetic: "Kaard dasta-ye khud raa nameborad",
            meaning: "People rarely act against their own family or interests.",
            category: "Family"
        ),
        Proverb(
            id: "p6",
            english: "Whoever seeks, finds",
            dari: "جوینده یابنده است",
            phonetic: "Jooyanda yaabanda ast",
            meaning: "Persistence is eventually rewarded.",
            category: "Effort"
        ),
    ]

    static let cultureEntries: [CultureEntry] = [
        CultureEntry(
            id: "c1",
            emoji: "🍚",
            title: "Kabuli Palaw",
            summary: "The national dish of Afghanistan",
            body: "Kabuli palaw is steamed rice layered with lamb, sweet carrots and raisins, often topped with pistachios or almonds. It is the centrepiece of weddings and celebrations, served on a large communal platter so everyone eats together."
        ),
        CultureEntry(
            id: "c2",
            emoji: "🌱",
            title: "Nawroz",
            summary: "The Afghan new year",
            body: "Nawroz marks the first day of spring and the Afghan new year. Families visit Mazar-i-Sharif for the raising of the Janda, prepare haft mewa — a compote of seven dried fruits and nuts — and clean their homes to welcome the new season."
        ),
        CultureEntry(
            id: "c3",
            emoji: "🫖",
            title: "Chai Culture",
            summary: "Green and black tea, always shared",
            body: "Tea is offered to every guest within moments of arrival. Chai sabz (green) and chai siyah (black) are served in small cups with sugared almonds or nuqul. Refusing the first cup is polite, accepting the second is expected."
        ),
        CultureEntry(
            id: "c4",
            emoji: "🪁",
            title: "Gudiparan Bazi",
            summary: "Kite flying in Afghan skies",
            body: "Kite fighting is a beloved Afghan pastime. Handmade paper kites with glass-coated string duel above rooftops on Friday afternoons, with a chasing tradition — kite running — for kites cut loose."
        ),
        CultureEntry(
            id: "c5",
            emoji: "🧵",
            title: "Afghan Carpets",
            summary: "Woven history in wool",
            body: "Afghan carpets, particularly Turkmen and Baluchi designs, are hand-knotted in deep reds and blues. Patterns are passed through families, and a single large carpet can take months to complete."
        ),
    ]

    // MARK: - Explore

    static let wordOfTheDay = Word(english: "Pear", dari: "ناک", phonetic: "naak", category: "Fruits")

    static let popularWords: [Word] = [
        Word(english: "Red", dari: "سرخ", phonetic: "surkh", category: "Colours"),
        Word(english: "Thank you", dari: "تشکر", phonetic: "tashakor", category: "Phrases"),
        Word(english: "Water", dari: "آب", phonetic: "aab", category: "Food"),
        Word(english: "How are you?", dari: "چطور استی؟", phonetic: "chetor asti?", category: "Phrases"),
        Word(english: "Mother", dari: "مادر", phonetic: "maadar", category: "Family"),
        Word(english: "Beautiful", dari: "مقبول", phonetic: "maqbool", category: "Adjectives"),
    ]

    /// Phrase-level entries so search feels like a translator, not a word list.
    static let phrases: [Word] = [
        Word(english: "Good morning", dari: "صبح بخیر", phonetic: "subh ba khair", category: "Phrases"),
        Word(english: "Good night", dari: "شب بخیر", phonetic: "shab ba khair", category: "Phrases"),
        Word(english: "What is your name?", dari: "نام شما چیست؟", phonetic: "naam-e shumaa cheest?", category: "Phrases"),
        Word(english: "I don't understand", dari: "نمی‌فهمم", phonetic: "namefahmam", category: "Phrases"),
        Word(english: "Where is the bathroom?", dari: "تشناب کجاست؟", phonetic: "tashnaab kujaast?", category: "Phrases"),
        Word(english: "I love you", dari: "دوستت دارم", phonetic: "dostet daaram", category: "Phrases"),
        Word(english: "See you tomorrow", dari: "تا فردا", phonetic: "taa fardaa", category: "Phrases"),
        Word(english: "How much is it?", dari: "چند است؟", phonetic: "chand ast?", category: "Phrases"),
        Word(english: "I am learning Dari", dari: "من دری یاد می‌گیرم", phonetic: "man Dari yaad megeeram", category: "Phrases"),
        Word(english: "Please speak slowly", dari: "لطفاً آهسته گپ بزنید", phonetic: "lutfan aahesta gap bezaned", category: "Phrases"),
    ]

    /// Everything searchable on the Explore tab.
    static let searchCorpus: [Word] = {
        var all: [Word] = phrases
        all.append(contentsOf: vocabSets.flatMap(\.words))
        all.append(contentsOf: popularWords)
        var seen = Set<String>()
        return all.filter { seen.insert($0.english.lowercased()).inserted }
    }()

    /// The bundled content as one document, matching what the backend serves.
    static let bundledDocument = ContentDocument(
        vocabSets: vocabSets,
        units: units,
        proverbs: proverbs,
        popularWords: popularWords,
        phrases: phrases,
        wordOfTheDaySchedule: []
    )

    /// Last-resort word so the Word of the Day card can never render empty.
    static let fallbackWord = wordOfTheDay
}
