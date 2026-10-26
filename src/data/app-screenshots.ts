// Three distinct repository captures per native app. Sources: docs/app-screenshots.md.
export type Screenshot = { src: string; alt: string; width: number; height: number };
export const appScreenshots = {
  'detour': [
    { src: '/images/projects/detour/01.webp', alt: "Detour travel map with saved places", width: 600, height: 1301 },
    { src: '/images/projects/detour/02.webp', alt: "Saved travel maps in Detour", width: 600, height: 1301 },
    { src: '/images/projects/detour/03.webp', alt: "Place details in Detour", width: 600, height: 1301 },
  ],
  'learn-just-enough': [
    { src: '/images/projects/learn-just-enough/01.webp', alt: "Learn Just Enough lesson library", width: 600, height: 1298 },
    { src: '/images/projects/learn-just-enough/02.webp', alt: "Language lesson topics in Learn Just Enough", width: 600, height: 1298 },
    { src: '/images/projects/learn-just-enough/03.webp', alt: "Audio lesson player in Learn Just Enough", width: 600, height: 1298 },
  ],
  'absolute-timer': [
    { src: '/images/projects/absolute-timer/01.webp', alt: "Absolute Timer workout setup", width: 600, height: 1300 },
    { src: '/images/projects/absolute-timer/02.webp', alt: "Active boxing round in Absolute Timer", width: 600, height: 1300 },
    { src: '/images/projects/absolute-timer/03.webp', alt: "Workout profile editor in Absolute Timer", width: 600, height: 1300 },
  ],
  'grandmaster-flash': [
    { src: '/images/projects/grandmaster-flash/01.webp', alt: "Grandmaster Flash deck library", width: 600, height: 1301 },
    { src: '/images/projects/grandmaster-flash/02.webp', alt: "Study options in Grandmaster Flash", width: 600, height: 1304 },
    { src: '/images/projects/grandmaster-flash/03.webp', alt: "Audio flashcard player in Grandmaster Flash", width: 600, height: 1304 },
  ],
  'skyfighter': [
    { src: '/images/projects/skyfighter/01.webp', alt: "Skyfighter aerial dogfight", width: 600, height: 1304 },
    { src: '/images/projects/skyfighter/02.webp', alt: "Skyfighter boss fight", width: 600, height: 1304 },
    { src: '/images/projects/skyfighter/03.webp', alt: "Aircraft selection in Skyfighter", width: 600, height: 1304 },
  ],
  'roy': [
    { src: '/images/projects/roy/01.webp', alt: "Roy inside an apartment", width: 600, height: 1304 },
    { src: '/images/projects/roy/02.webp', alt: "Roy visiting the neighbourhood cafe", width: 600, height: 1304 },
    { src: '/images/projects/roy/03.webp', alt: "Roy exploring the park", width: 600, height: 1304 },
  ],
  'salsamatic': [
    { src: '/images/projects/salsamatic/01.webp', alt: "Dance session history in Salsamatic", width: 600, height: 1304 },
    { src: '/images/projects/salsamatic/02.webp', alt: "Dance session report in Salsamatic", width: 600, height: 1304 },
    { src: '/images/projects/salsamatic/03.webp', alt: "Dance timeline and songs in Salsamatic", width: 600, height: 1304 },
  ],
  'salsa-machine': [
    { src: '/images/projects/salsa-machine/01.webp', alt: "Salsa Machine instrument mixer", width: 600, height: 1304 },
    { src: '/images/projects/salsa-machine/02.webp', alt: "Rhythm patterns in Salsa Machine", width: 600, height: 1304 },
    { src: '/images/projects/salsa-machine/03.webp', alt: "Song settings in Salsa Machine", width: 600, height: 1304 },
  ],
} satisfies Record<string, [Screenshot, Screenshot, Screenshot]>;
