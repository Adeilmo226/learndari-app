/**
 * Initial content, mirroring what shipped inside the app.
 * Written into the content store the first time it is opened; after that the
 * Studio owns the document and this file is never consulted again.
 */
import type {
  ContentDocument,
  ContentProverb,
  ContentUnit,
  ContentVocabSet,
  ContentWord,
} from "./content-types";

function w(id: string, english: string, dari: string, phonetic: string, category?: string): ContentWord {
  return category ? { id, english, dari, phonetic, category } : { id, english, dari, phonetic };
}

const vocabSets: ContentVocabSet[] = [
  {
    id: "colours",
    emoji: "🎨",
    name: "Colours",
    summary: "Learn basic colour names",
    words: [
      w("colours-red", "Red", "سرخ", "surkh", "Colours"),
      w("colours-blue", "Blue", "آبی", "ahbee", "Colours"),
      w("colours-green", "Green", "سبز", "sabz", "Colours"),
      w("colours-black", "Black", "سیاه", "siyaah", "Colours"),
      w("colours-white", "White", "سفید", "safed", "Colours"),
      w("colours-yellow", "Yellow", "زرد", "zard", "Colours"),
      w("colours-orange", "Orange", "نارنجی", "naarenji", "Colours"),
      w("colours-purple", "Purple", "بنفش", "banafsh", "Colours"),
      w("colours-brown", "Brown", "نصواری", "naswaari", "Colours"),
      w("colours-grey", "Grey", "خاکستری", "khaakestari", "Colours"),
      w("colours-pink", "Pink", "گلابی", "gulaabi", "Colours"),
      w("colours-gold", "Gold", "طلایی", "talaayi", "Colours"),
    ],
  },
  {
    id: "animals",
    emoji: "🐾",
    name: "Animals",
    summary: "Learn animal names",
    words: [
      w("animals-cat", "Cat", "پشک", "pishak", "Animals"),
      w("animals-dog", "Dog", "سگ", "sag", "Animals"),
      w("animals-horse", "Horse", "اسپ", "asp", "Animals"),
      w("animals-bird", "Bird", "پرنده", "parinda", "Animals"),
      w("animals-sheep", "Sheep", "گوسفند", "gosfand", "Animals"),
      w("animals-cow", "Cow", "گاو", "gaaw", "Animals"),
      w("animals-camel", "Camel", "اشتر", "ushtur", "Animals"),
      w("animals-donkey", "Donkey", "خر", "khar", "Animals"),
      w("animals-fish", "Fish", "ماهی", "maahi", "Animals"),
      w("animals-lion", "Lion", "شیر", "sher", "Animals"),
      w("animals-wolf", "Wolf", "گرگ", "gurg", "Animals"),
      w("animals-fox", "Fox", "روباه", "roobaah", "Animals"),
      w("animals-chicken", "Chicken", "مرغ", "murgh", "Animals"),
      w("animals-goat", "Goat", "بز", "buz", "Animals"),
    ],
  },
  {
    id: "food",
    emoji: "🍽️",
    name: "Food",
    summary: "Common food items",
    words: [
      w("food-bread", "Bread", "نان", "naan", "Food"),
      w("food-water", "Water", "آب", "aab", "Food"),
      w("food-rice", "Rice", "برنج", "birinj", "Food"),
      w("food-meat", "Meat", "گوشت", "gosht", "Food"),
      w("food-tea", "Tea", "چای", "chaay", "Food"),
      w("food-milk", "Milk", "شیر", "sheer", "Food"),
      w("food-salt", "Salt", "نمک", "namak", "Food"),
      w("food-sugar", "Sugar", "بوره", "bora", "Food"),
    ],
  },
  {
    id: "fruits",
    emoji: "🍎",
    name: "Fruits",
    summary: "Learn fruit names",
    words: [
      w("fruits-apple", "Apple", "سیب", "seb", "Fruits"),
      w("fruits-pear", "Pear", "ناک", "naak", "Fruits"),
      w("fruits-grape", "Grape", "انگور", "angoor", "Fruits"),
      w("fruits-pomegranate", "Pomegranate", "انار", "anaar", "Fruits"),
      w("fruits-melon", "Melon", "خربوزه", "kharbooza", "Fruits"),
      w("fruits-watermelon", "Watermelon", "تربوز", "tarbooz", "Fruits"),
      w("fruits-peach", "Peach", "شفتالو", "shaftaaloo", "Fruits"),
      w("fruits-apricot", "Apricot", "زردالو", "zardaaloo", "Fruits"),
      w("fruits-fig", "Fig", "انجیر", "anjeer", "Fruits"),
      w("fruits-cherry", "Cherry", "آلوبالو", "aaloobaaloo", "Fruits"),
      w("fruits-orange", "Orange", "مالته", "maalta", "Fruits"),
      w("fruits-banana", "Banana", "کیله", "kela", "Fruits"),
      w("fruits-lemon", "Lemon", "لیمو", "leemoo", "Fruits"),
      w("fruits-mulberry", "Mulberry", "توت", "toot", "Fruits"),
      w("fruits-raisin", "Raisin", "کشمش", "kishmish", "Fruits"),
    ],
  },
  {
    id: "vegetables",
    emoji: "🥕",
    name: "Vegetables",
    summary: "Learn vegetable names",
    words: [
      w("veg-carrot", "Carrot", "زردک", "zardak", "Vegetables"),
      w("veg-potato", "Potato", "کچالو", "kachaaloo", "Vegetables"),
      w("veg-onion", "Onion", "پیاز", "piyaaz", "Vegetables"),
      w("veg-tomato", "Tomato", "بادنجان رومی", "baadenjaan-e roomi", "Vegetables"),
      w("veg-cucumber", "Cucumber", "بادرنگ", "baadrang", "Vegetables"),
      w("veg-spinach", "Spinach", "پالک", "paalak", "Vegetables"),
      w("veg-garlic", "Garlic", "سیر", "seer", "Vegetables"),
      w("veg-pumpkin", "Pumpkin", "کدو", "kadoo", "Vegetables"),
      w("veg-cabbage", "Cabbage", "کرم", "karam", "Vegetables"),
      w("veg-pepper", "Pepper", "مرچ", "murch", "Vegetables"),
      w("veg-eggplant", "Eggplant", "بادنجان سیاه", "baadenjaan-e siyaah", "Vegetables"),
    ],
  },
  {
    id: "body",
    emoji: "🦴",
    name: "Body Parts",
    summary: "Learn body part names",
    words: [
      w("body-head", "Head", "سر", "sar", "Body"),
      w("body-hand", "Hand", "دست", "dast", "Body"),
      w("body-foot", "Foot", "پا", "paa", "Body"),
      w("body-eye", "Eye", "چشم", "chashm", "Body"),
      w("body-ear", "Ear", "گوش", "gosh", "Body"),
      w("body-nose", "Nose", "بینی", "beeni", "Body"),
      w("body-mouth", "Mouth", "دهن", "dahan", "Body"),
      w("body-tooth", "Tooth", "دندان", "dandaan", "Body"),
      w("body-hair", "Hair", "موی", "moy", "Body"),
      w("body-heart", "Heart", "دل", "dil", "Body"),
      w("body-face", "Face", "روی", "roy", "Body"),
      w("body-finger", "Finger", "انگشت", "angusht", "Body"),
    ],
  },
  {
    id: "days",
    emoji: "📅",
    name: "Days & Months",
    summary: "Days of the week and months",
    words: [
      w("time-saturday", "Saturday", "شنبه", "shambe", "Time"),
      w("time-sunday", "Sunday", "یکشنبه", "yakshambe", "Time"),
      w("time-monday", "Monday", "دوشنبه", "doshambe", "Time"),
      w("time-tuesday", "Tuesday", "سه‌شنبه", "seshambe", "Time"),
      w("time-wednesday", "Wednesday", "چهارشنبه", "chaarshambe", "Time"),
      w("time-thursday", "Thursday", "پنجشنبه", "panjshambe", "Time"),
      w("time-friday", "Friday", "جمعه", "juma", "Time"),
      w("time-today", "Today", "امروز", "emroz", "Time"),
      w("time-tomorrow", "Tomorrow", "فردا", "fardaa", "Time"),
      w("time-yesterday", "Yesterday", "دیروز", "deroz", "Time"),
      w("time-week", "Week", "هفته", "hafta", "Time"),
      w("time-month", "Month", "ماه", "maah", "Time"),
      w("time-year", "Year", "سال", "saal", "Time"),
      w("time-morning", "Morning", "صبح", "subh", "Time"),
      w("time-noon", "Noon", "چاشت", "chaasht", "Time"),
      w("time-evening", "Evening", "شام", "shaam", "Time"),
      w("time-night", "Night", "شب", "shab", "Time"),
      w("time-hour", "Hour", "ساعت", "saa'at", "Time"),
      w("time-minute", "Minute", "دقیقه", "daqeeqa", "Time"),
    ],
  },
  {
    id: "weather",
    emoji: "🌤️",
    name: "Weather",
    summary: "Talk about the weather",
    words: [
      w("weather-sun", "Sun", "آفتاب", "aaftaab", "Weather"),
      w("weather-rain", "Rain", "باران", "baaraan", "Weather"),
      w("weather-snow", "Snow", "برف", "barf", "Weather"),
      w("weather-wind", "Wind", "باد", "baad", "Weather"),
      w("weather-cloud", "Cloud", "ابر", "abr", "Weather"),
      w("weather-hot", "Hot", "گرم", "garm", "Weather"),
      w("weather-cold", "Cold", "سرد", "sard", "Weather"),
      w("weather-sky", "Sky", "آسمان", "aasmaan", "Weather"),
      w("weather-storm", "Storm", "طوفان", "toofaan", "Weather"),
      w("weather-fog", "Fog", "مه", "meh", "Weather"),
    ],
  },
];

const units: ContentUnit[] = [
  {
    id: "u1",
    index: 1,
    title: "Alphabet & Sounds",
    lessons: [
      {
        id: "u1l1",
        title: "First Letters",
        subtitle: "ا ب پ ت",
        words: [
          w("u1l1-alef", "Alef", "ا", "aa"),
          w("u1l1-be", "Be", "ب", "be"),
          w("u1l1-pe", "Pe", "پ", "pe"),
          w("u1l1-te", "Te", "ت", "te"),
        ],
      },
      {
        id: "u1l2",
        title: "More Letters",
        subtitle: "ث ج چ ح",
        words: [
          w("u1l2-se", "Se", "ث", "se"),
          w("u1l2-jim", "Jim", "ج", "jim"),
          w("u1l2-che", "Che", "چ", "che"),
          w("u1l2-he", "He", "ح", "he"),
        ],
      },
      {
        id: "u1l3",
        title: "Vowel Sounds",
        subtitle: "Short and long vowels",
        words: [
          w("u1l3-longa", "Long A", "آ", "aa"),
          w("u1l3-longu", "Long U", "او", "oo"),
          w("u1l3-longi", "Long I", "ای", "ee"),
        ],
      },
    ],
  },
  {
    id: "u2",
    index: 2,
    title: "Letter Forms",
    lessons: [
      {
        id: "u2l1",
        title: "Joining Letters",
        subtitle: "How letters connect",
        words: [
          w("u2l1-water", "Water", "آب", "aab"),
          w("u2l1-bread", "Bread", "نان", "naan"),
          w("u2l1-name", "Name", "نام", "naam"),
        ],
      },
      {
        id: "u2l2",
        title: "Initial & Final",
        subtitle: "Position changes shape",
        words: [
          w("u2l2-hand", "Hand", "دست", "dast"),
          w("u2l2-door", "Door", "دروازه", "darwaaza"),
          w("u2l2-book", "Book", "کتاب", "kitaab"),
        ],
      },
      {
        id: "u2l3",
        title: "Reading Practice",
        subtitle: "Your first words",
        words: [
          w("u2l3-house", "House", "خانه", "khaana"),
          w("u2l3-school", "School", "مکتب", "maktab"),
          w("u2l3-city", "City", "شهر", "shahr"),
        ],
      },
    ],
  },
  {
    id: "u3",
    index: 3,
    title: "Basic Words",
    lessons: [
      {
        id: "u3l1",
        title: "Family Words",
        subtitle: "People closest to you",
        words: [
          w("u3l1-mother", "Mother", "مادر", "maadar"),
          w("u3l1-father", "Father", "پدر", "padar"),
          w("u3l1-brother", "Brother", "برادر", "baraadar"),
          w("u3l1-sister", "Sister", "خواهر", "khwaahar"),
        ],
      },
      {
        id: "u3l2",
        title: "Numbers 1–10",
        subtitle: "Counting in Dari",
        words: [
          w("u3l2-one", "One", "یک", "yak"),
          w("u3l2-two", "Two", "دو", "du"),
          w("u3l2-three", "Three", "سه", "se"),
          w("u3l2-four", "Four", "چهار", "chaar"),
          w("u3l2-five", "Five", "پنج", "panj"),
        ],
      },
      {
        id: "u3l3",
        title: "Colours & Shapes",
        subtitle: "Describing things",
        words: [
          w("u3l3-red", "Red", "سرخ", "surkh"),
          w("u3l3-blue", "Blue", "آبی", "ahbee"),
          w("u3l3-green", "Green", "سبز", "sabz"),
          w("u3l3-round", "Round", "مدور", "mudawar"),
        ],
      },
      {
        id: "u3l4",
        title: "Around the House",
        subtitle: "Everyday objects",
        words: [
          w("u3l4-table", "Table", "میز", "mez"),
          w("u3l4-chair", "Chair", "چوکی", "chawki"),
          w("u3l4-window", "Window", "کلکین", "kilkeen"),
        ],
      },
    ],
  },
  {
    id: "u4",
    index: 4,
    title: "Everyday Phrases",
    lessons: [
      {
        id: "u4l1",
        title: "Greetings & Salaam",
        subtitle: "Say hello properly",
        words: [
          w("u4l1-hello", "Hello", "سلام", "salaam"),
          w("u4l1-goodbye", "Goodbye", "خدا حافظ", "khudaa haafiz"),
          w("u4l1-welcome", "Welcome", "خوش آمدید", "khush aamadid"),
        ],
      },
      {
        id: "u4l2",
        title: "Asking How Someone Is",
        subtitle: "Small talk",
        words: [
          w("u4l2-howareyou", "How are you?", "چطور استی؟", "chetor asti?"),
          w("u4l2-iamwell", "I am well", "خوب استم", "khub astum"),
          w("u4l2-thankyou", "Thank you", "تشکر", "tashakor"),
        ],
      },
      {
        id: "u4l3",
        title: "Please & Sorry",
        subtitle: "Polite words",
        words: [
          w("u4l3-please", "Please", "لطفاً", "lutfan"),
          w("u4l3-sorry", "Sorry", "معذرت", "ma'zerat"),
          w("u4l3-noproblem", "No problem", "مشکل نیست", "mushkil nest"),
        ],
      },
    ],
  },
  {
    id: "u5",
    index: 5,
    title: "Simple Conversations",
    lessons: [
      {
        id: "u5l1",
        title: "Introducing Yourself",
        subtitle: "Names and origins",
        words: [
          w("u5l1-myname", "My name is…", "نام من … است", "naam-e man … ast"),
          w("u5l1-wherefrom", "Where are you from?", "از کجا استی؟", "az kujaa asti?"),
          w("u5l1-fromkabul", "I am from Kabul", "من از کابل استم", "man az Kaabul astum"),
        ],
      },
      {
        id: "u5l2",
        title: "In the Bazaar",
        subtitle: "Buying and asking prices",
        words: [
          w("u5l2-howmuch", "How much is it?", "چند است؟", "chand ast?"),
          w("u5l2-expensive", "Too expensive", "بسیار قیمت است", "bisyaar qeemat ast"),
          w("u5l2-iwantthis", "I want this", "این را می‌خواهم", "een raa mekhwaaham"),
        ],
      },
      {
        id: "u5l3",
        title: "Sharing a Meal",
        subtitle: "Tea, food and hospitality",
        words: [
          w("u5l3-bonappetit", "Bon appétit", "نوش جان", "nosh-e jaan"),
          w("u5l3-delicious", "It is delicious", "بسیار مزه‌دار است", "bisyaar maza-daar ast"),
          w("u5l3-full", "I am full", "سیر استم", "ser astum"),
        ],
      },
    ],
  },
  {
    id: "u6",
    index: 6,
    title: "Getting Around",
    lessons: [
      {
        id: "u6l1",
        title: "Directions",
        subtitle: "Left, right, straight",
        words: [
          w("u6l1-left", "Left", "چپ", "chap"),
          w("u6l1-right", "Right", "راست", "raast"),
          w("u6l1-straight", "Straight", "مستقیم", "mustaqeem"),
        ],
      },
      {
        id: "u6l2",
        title: "Travel Words",
        subtitle: "Getting from A to B",
        words: [
          w("u6l2-car", "Car", "موتر", "motar"),
          w("u6l2-road", "Road", "سرک", "sarak"),
          w("u6l2-airport", "Airport", "میدان هوایی", "maidaan-e hawaayi"),
        ],
      },
    ],
  },
  {
    id: "u7",
    index: 7,
    title: "Feelings & People",
    lessons: [
      {
        id: "u7l1",
        title: "How You Feel",
        subtitle: "Happy, tired, hungry",
        words: [
          w("u7l1-happy", "Happy", "خوشحال", "khushhaal"),
          w("u7l1-tired", "Tired", "مانده", "maanda"),
          w("u7l1-hungry", "Hungry", "گشنه", "gushna"),
        ],
      },
      {
        id: "u7l2",
        title: "Describing People",
        subtitle: "Kind, tall, young",
        words: [
          w("u7l2-kind", "Kind", "مهربان", "mehrabaan"),
          w("u7l2-tall", "Tall", "بلند قد", "buland qad"),
          w("u7l2-young", "Young", "جوان", "jawaan"),
        ],
      },
    ],
  },
  {
    id: "u8",
    index: 8,
    title: "Telling Stories",
    lessons: [
      {
        id: "u8l1",
        title: "Past & Future",
        subtitle: "Talking across time",
        words: [
          w("u8l1-iwent", "I went", "رفتم", "raftam"),
          w("u8l1-iwillgo", "I will go", "می‌روم", "meraawam"),
          w("u8l1-isaw", "I saw", "دیدم", "deedam"),
        ],
      },
      {
        id: "u8l2",
        title: "Telling a Story",
        subtitle: "Linking your sentences",
        words: [
          w("u8l2-then", "Then", "بعد", "ba'd"),
          w("u8l2-because", "Because", "چون", "chun"),
          w("u8l2-but", "But", "اما", "ammaa"),
        ],
      },
    ],
  },
];

const proverbs: ContentProverb[] = [
  {
    id: "p1",
    english: "Do good and throw it into the river",
    dari: "نیکی کن و در دریا انداز",
    phonetic: "Niki kon wa dar darya andaz",
    meaning: "Do good deeds without expecting anything in return.",
    category: "Kindness",
  },
  {
    id: "p2",
    english: "A drop by drop becomes a river",
    dari: "قطره قطره دریا می‌شود",
    phonetic: "Qatra qatra darya meshawad",
    meaning: "Small consistent efforts add up to something great.",
    category: "Patience",
  },
  {
    id: "p3",
    english: "The guest is a gift from God",
    dari: "مهمان هدیهٔ خداست",
    phonetic: "Mehmaan hadya-ye khudaast",
    meaning: "Hospitality is sacred in Afghan culture.",
    category: "Hospitality",
  },
  {
    id: "p4",
    english: "One hand alone makes no sound",
    dari: "یک دست صدا ندارد",
    phonetic: "Yak dast sadaa nadaarad",
    meaning: "Nothing meaningful is achieved alone.",
    category: "Community",
  },
  {
    id: "p5",
    english: "The knife does not cut its own handle",
    dari: "کارد دستهٔ خود را نمی‌برد",
    phonetic: "Kaard dasta-ye khud raa nameborad",
    meaning: "People rarely act against their own family or interests.",
    category: "Family",
  },
  {
    id: "p6",
    english: "Whoever seeks, finds",
    dari: "جوینده یابنده است",
    phonetic: "Jooyanda yaabanda ast",
    meaning: "Persistence is eventually rewarded.",
    category: "Effort",
  },
];

const popularWords: ContentWord[] = [
  w("pop-red", "Red", "سرخ", "surkh", "Colours"),
  w("pop-thankyou", "Thank you", "تشکر", "tashakor", "Phrases"),
  w("pop-water", "Water", "آب", "aab", "Food"),
  w("pop-howareyou", "How are you?", "چطور استی؟", "chetor asti?", "Phrases"),
  w("pop-mother", "Mother", "مادر", "maadar", "Family"),
  w("pop-beautiful", "Beautiful", "مقبول", "maqbool", "Adjectives"),
];

const phrases: ContentWord[] = [
  w("ph-goodmorning", "Good morning", "صبح بخیر", "subh ba khair", "Phrases"),
  w("ph-goodnight", "Good night", "شب بخیر", "shab ba khair", "Phrases"),
  w("ph-yourname", "What is your name?", "نام شما چیست؟", "naam-e shumaa cheest?", "Phrases"),
  w("ph-dontunderstand", "I don't understand", "نمی‌فهمم", "namefahmam", "Phrases"),
  w("ph-bathroom", "Where is the bathroom?", "تشناب کجاست؟", "tashnaab kujaast?", "Phrases"),
  w("ph-loveyou", "I love you", "دوستت دارم", "dostet daaram", "Phrases"),
  w("ph-seeyoutomorrow", "See you tomorrow", "تا فردا", "taa fardaa", "Phrases"),
  w("ph-howmuch", "How much is it?", "چند است؟", "chand ast?", "Phrases"),
  w("ph-learningdari", "I am learning Dari", "من دری یاد می‌گیرم", "man Dari yaad megeeram", "Phrases"),
  w("ph-speakslowly", "Please speak slowly", "لطفاً آهسته گپ بزنید", "lutfan aahesta gap bezaned", "Phrases"),
];

export const SEED_CONTENT: ContentDocument = {
  vocabSets,
  units,
  proverbs,
  popularWords,
  phrases,
  wordOfTheDaySchedule: [],
};
