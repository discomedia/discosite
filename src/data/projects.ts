// Project metadata and screenshot sources are maintained in README.md.
// Add a project here and its screenshot in public/images/projects/.
export type Project = {
  slug: string;
  name: string;
  category: string;
  description: string;
  url: string;
  format: string;
  type: "apps" | "sites" | "other";
  visual?: "phone" | "panel" | "code" | "artwork";
  imageAlt?: string;
  overview?: string;
  imageWidth?: number;
  imageHeight?: number;
};
export const projects: Project[] = [
  {
    slug: "melbourne-social-club",
    imageWidth: 1200,
    imageHeight: 833,
    type: "sites",
    name: "Melbourne Social Club",
    category: "Dance & community",
    description:
      "Salsa and bachata events in Melbourne / Naarm, Australia, with bookings for community-run dance socials.",
    url: "https://melbournesocialclub.org",
    format: "Website",
  },
  {
    slug: "discover-discomfort",
    imageWidth: 1200,
    imageHeight: 833,
    type: "sites",
    name: "Discover Discomfort",
    category: "Travel & culture",
    description:
      "Travel and language-learning guides, with advice on living abroad and learning about local cultures.",
    url: "https://discoverdiscomfort.com",
    format: "Website",
  },
  {
    slug: "detour",
    imageWidth: 646,
    imageHeight: 1400,
    type: "apps",
    visual: "phone",
    name: "Detour",
    category: "Travel & maps",
    description:
      "Create travel maps in a conversation and view your saved places on iPhone.",
    url: "https://detour.discomedia.co",
    format: "Web & iOS",
  },
  {
    slug: "motofomo",
    imageWidth: 1200,
    imageHeight: 833,
    type: "sites",
    name: "Motofomo",
    category: "Motorcycles",
    description:
      "Motorcycle reviews and buying guides covering specifications, ownership and riding.",
    url: "https://motofomo.com",
    format: "Website",
  },
  {
    slug: "learn-just-enough",
    imageWidth: 647,
    imageHeight: 1400,
    type: "apps",
    visual: "phone",
    name: "Learn Just Enough",
    category: "Language learning",
    description:
      "Audio lessons for everyday conversations, including ordering food and asking for directions.",
    url: "/projects/learn-just-enough/",
    overview:
      "Short lessons pair dialogues with phrases you can listen to and practise. The app is in development for iPhone; a public download is not available yet.",
    format: "iOS · In development",
  },
  {
    slug: "interesting-languages",
    imageWidth: 1200,
    imageHeight: 833,
    type: "sites",
    name: "Interesting Languages",
    category: "Language reference",
    description:
      "Guides to the world’s languages, with explanations of grammar, writing systems and pronunciation.",
    url: "https://interestinglanguages.com",
    format: "Website",
  },
  {
    slug: "absolute-timer",
    imageWidth: 461,
    imageHeight: 1000,
    type: "apps",
    visual: "phone",
    name: "Absolute Timer",
    category: "Fitness",
    description:
      "Time boxing rounds, rest periods and interval workouts on iPhone and Apple Watch.",
    url: "https://apps.apple.com/app/absolute-timer/id6755406554",
    format: "iOS & watchOS",
  },
  {
    slug: "papertiger",
    imageWidth: 1400,
    imageHeight: 884,
    type: "apps",
    name: "PaperTiger",
    category: "Prediction markets",
    description: "Test prediction-market strategies with paper trades.",
    url: "https://papertigerapp.com",
    format: "Web app",
  },
  {
    slug: "banana-stand",
    imageWidth: 1024,
    imageHeight: 836,
    type: "apps",
    name: "Banana Stand",
    category: "Trading research",
    description:
      "Research trading strategies and manage portfolios in a web dashboard.",
    url: "https://bananastandapp.com",
    format: "Web app",
  },
  {
    slug: "finepredict",
    imageWidth: 1200,
    imageHeight: 833,
    type: "apps",
    name: "FinePredict",
    category: "Prediction markets",
    description:
      "Compare prediction-market contracts and read the rules that determine their outcomes.",
    url: "https://finepredict.netlify.app",
    format: "Web app",
  },
  {
    slug: "disco-mail",
    imageWidth: 1400,
    imageHeight: 825,
    type: "apps",
    name: "Disco Mail",
    category: "Tools for builders",
    description: "Send email from your apps and review delivery logs.",
    url: "https://mail.discomedia.co",
    format: "Web app",
  },
  {
    slug: "fluent-cafe",
    visual: "panel",
    imageWidth: 850,
    imageHeight: 1290,
    type: "apps",
    name: "Fluent Café",
    category: "Language learning",
    description: "Practise vocabulary, phrases and conversations in a web app.",
    url: "https://fluentcafe.com",
    format: "Web app",
  },
  {
    slug: "swahili-grammar",
    imageWidth: 1200,
    imageHeight: 833,
    type: "sites",
    name: "Swahili Grammar",
    category: "Language reference",
    description: "Swahili grammar explained with examples for learners.",
    url: "https://swahiligrammar.com",
    format: "Website",
  },
  {
    slug: "disco-store",
    imageWidth: 1200,
    imageHeight: 833,
    type: "sites",
    name: "Disco Media Store",
    category: "Music & equipment",
    description:
      "Shop for guitars, amps, pedals and other music equipment in Australia.",
    url: "https://discomedia.com.au",
    format: "Online store",
  },
  {
    slug: "grandmaster-flash",
    imageWidth: 646,
    imageHeight: 1400,
    name: "Grandmaster Flash",
    category: "Language learning",
    description:
      "Build flashcard decks with AI and review them with audio and spaced repetition.",
    url: "https://grandmasterflash.discomedia.co",
    format: "iOS · In development",
    type: "apps",
    visual: "phone",
  },
  {
    slug: "mailer-choice",
    imageWidth: 1200,
    imageHeight: 833,
    name: "Mailer Choice",
    category: "Email & publishing",
    description:
      "Compare email platforms by subscriber count, sending volume and supported functions.",
    url: "https://mailerchoice.com",
    format: "Web app",
    type: "apps",
  },
  {
    slug: "skyfighter",
    imageWidth: 644,
    imageHeight: 1400,
    name: "Skyfighter",
    category: "Games",
    description:
      "An arcade flying game for iPhone, with one-bit graphics, enemy aircraft and boss fights.",
    url: "/projects/skyfighter/",
    format: "iOS · In development",
    type: "apps",
    visual: "phone",
    overview:
      "The graphics are inspired by classic Macintosh games. Unlock new aircraft as you progress through dogfights and boss fights. Skyfighter is in development for iPhone; a public download is not available yet.",
  },
  {
    slug: "disco-hq",
    imageWidth: 1285,
    imageHeight: 1260,
    name: "Disco HQ",
    category: "Behind the scenes",
    description:
      "Our internal tool for publishing WordPress posts and reviewing blog analytics.",
    url: "https://hooshmand.net/how-i-use-discohq-run-blogs-business/",
    format: "Internal tool",
    type: "other",
  },
  {
    slug: "roy",
    imageWidth: 644,
    imageHeight: 1400,
    name: "Roy",
    category: "Games",
    description:
      "A life simulation for iPhone. Explore a neighbourhood, meet residents and furnish your home.",
    url: "/projects/roy/",
    format: "iOS · In development",
    type: "apps",
    visual: "phone",
    overview:
      "Play offline, find work and follow the neighbourhood’s daily routines and changing weather. Roy is in private testing for iPhone; a public download is not available yet.",
  },
  {
    slug: "cover-artist",
    imageWidth: 1418,
    imageHeight: 1230,
    name: "Cover Artist",
    category: "Tools for publishers",
    description:
      "Generate cover art and article images in WordPress using your chosen AI services.",
    url: "https://wordpress.org/plugins/cover-artist/",
    format: "WordPress plugin",
    type: "other",
  },
  {
    slug: "salsamatic",
    imageWidth: 1440,
    imageHeight: 960,
    type: "apps",
    visual: "artwork",
    imageAlt:
      "Salsamatic on Apple Watch and iPhone, showing a dance session and liked songs",
    name: "Salsamatic",
    category: "Music & dance",
    description:
      "Track dance time, songs and spins on Apple Watch, then find your favourite songs on iPhone.",
    url: "https://salsamatic.discomedia.co",
    format: "iOS & watchOS",
  },
  {
    slug: "salsa-machine",
    imageWidth: 644,
    imageHeight: 1400,
    name: "Salsa Machine",
    category: "Music & dance",
    description:
      "Practise salsa with adjustable rhythms, clave, tempo and instrument tracks on iPhone.",
    url: "https://salsamachine.discomedia.co",
    format: "iOS · In development",
    type: "apps",
    visual: "phone",
  },
  {
    slug: "disco-tts",
    imageWidth: 1024,
    imageHeight: 993,
    name: "Disco TTS",
    category: "Tools for publishers",
    description:
      "Add text-to-speech audio to WordPress posts and language lessons.",
    url: "https://hooshmand.net/wordpress-plugin-chatgpt/",
    format: "WordPress plugin",
    type: "other",
  },
  {
    slug: "discomedia-utils",
    name: "Disco Media Utils",
    category: "Tools for builders",
    description:
      "Our shared TypeScript package for working with AI services, email and market data.",
    url: "https://www.npmjs.com/package/@discomedia/utils",
    format: "npm package",
    type: "other",
    visual: "code",
  },
];
