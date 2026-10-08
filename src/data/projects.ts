// Public project links and real screenshots, verified 8 October 2026.
// Add a project here and its screenshot in public/images/projects/.
export type Project = {
  slug: string;
  name: string;
  category: string;
  description: string;
  url: string;
  color: string;
  format: string;
};
export const projects: Project[] = [
  {
    slug: "discover-discomfort",
    name: "Discover Discomfort",
    category: "Travel & culture",
    description:
      "Language, travel, and the joy of getting outside your comfort zone.",
    url: "https://discoverdiscomfort.com",
    color: "#e9d5b9",
    format: "Website",
  },
  {
    slug: "detour",
    name: "Detour",
    category: "Travel & maps",
    description:
      "Make a map in a conversation. Take it with you on your iPhone.",
    url: "https://detour.discomedia.co",
    color: "#dfe5d8",
    format: "Web & iOS",
  },
  {
    slug: "motofomo",
    name: "Motofomo",
    category: "Motorcycles",
    description:
      "Motorcycle reviews, buying guides, and stories for the ride ahead.",
    url: "https://motofomo.com",
    color: "#e8e6df",
    format: "Website",
  },
  {
    slug: "learn-just-enough",
    name: "Learn Just Enough",
    category: "Language learning",
    description:
      "Practical language lessons for the conversations you actually need.",
    url: "https://learnjustenough.com",
    color: "#ebdfca",
    format: "Website & app",
  },
  {
    slug: "interesting-languages",
    name: "Interesting Languages",
    category: "Language reference",
    description: "A curious person’s guide to the world’s languages.",
    url: "https://interestinglanguages.com",
    color: "#dbe4e4",
    format: "Website",
  },
  {
    slug: "absolute-timer",
    name: "Absolute Timer",
    category: "Fitness",
    description:
      "A focused boxing and interval timer for iPhone and Apple Watch.",
    url: "https://apps.apple.com/app/absolute-timer/id6755406554",
    color: "#d6e8dc",
    format: "iOS & watchOS",
  },
  {
    slug: "papertiger",
    name: "PaperTiger",
    category: "Prediction markets",
    description: "Explore prediction markets and test ideas with paper trades.",
    url: "https://papertigerapp.com",
    color: "#ddd9e9",
    format: "Web app",
  },
  {
    slug: "banana-stand",
    name: "Banana Stand",
    category: "Trading research",
    description:
      "Quantitative research, algorithmic trading, and portfolio management.",
    url: "https://bananastandapp.com",
    color: "#eee4bf",
    format: "Web app",
  },
  {
    slug: "finepredict",
    name: "FinePredict",
    category: "Prediction markets",
    description:
      "Compare prediction market contracts and understand the rules behind the trade.",
    url: "https://finepredict.netlify.app",
    color: "#dae3df",
    format: "Web app",
  },
  {
    slug: "disco-mail",
    name: "Disco Mail",
    category: "Tools for builders",
    description:
      "Email infrastructure for the products we build, and the people who build with us.",
    url: "https://mail.discomedia.co",
    color: "#d9e3e1",
    format: "Web app",
  },
  {
    slug: "fluent-cafe",
    name: "Fluent Café",
    category: "Language learning",
    description:
      "Language practice for the words, phrases, and conversations that stick.",
    url: "https://fluentcafe.com",
    color: "#e4ddcf",
    format: "Web app",
  },
  {
    slug: "swahili-grammar",
    name: "Swahili Grammar",
    category: "Language reference",
    description:
      "An accessible guide to Swahili grammar, with practical explanations and examples.",
    url: "https://swahiligrammar.com",
    color: "#dce0d0",
    format: "Website",
  },
  {
    slug: "disco-store",
    name: "Disco Media Store",
    category: "Music & equipment",
    description:
      "Guitars, amps, pedals, and music equipment for Australian musicians.",
    url: "https://discomedia.com.au",
    color: "#dfd9d1",
    format: "Online store",
  },
];
