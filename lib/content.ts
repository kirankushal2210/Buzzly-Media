export type Company = { slug: string; name: string; field: string; intro: string; video: string; poster: string; kind: "food" | "health" | "property"; accent: string; word: string };
export const companies: Company[] = [
  { slug: "de-food-kampney", name: "De Food Kampney", field: "Food & restaurant platform", intro: "A dedicated sub-company founded, owned, and built by Buzzly Media, creating a platform and ecosystem for the food and restaurant industry.", video: "/media/de-food-kampney.mp4", poster: "/media/de-food-kampney-poster.webp", kind: "food", accent: "#d69454", word: "Food is culture." },
  { slug: "buzzly-health", name: "Buzzly Health", field: "Health & wellness venture", intro: "A dedicated sub-company founded, owned, and built by Buzzly Media in the health and wellness space.", video: "/media/buzzly-health.mp4", poster: "/media/buzzly-health-poster.webp", kind: "health", accent: "#b5c9b1", word: "Care in focus." },
  { slug: "buzzly-properties", name: "Buzzly Properties", field: "Real estate & property venture", intro: "A dedicated sub-company founded, owned, and built by Buzzly Media in the real estate and property space.", video: "/media/buzzly-properties.mp4", poster: "/media/buzzly-properties-poster.webp", kind: "property", accent: "#b7c8c8", word: "Space to grow." },
];
export const services = [
  { number: "01", title: "Strategy", copy: "Find the idea, audience, message, and formats that give a brand a distinct direction." },
  { number: "02", title: "Content", copy: "Make that direction tangible through films, reels, images, words, and stories." },
  { number: "03", title: "Social media", copy: "Publish and manage the channels where people encounter and discuss the brand." },
  { number: "04", title: "Distribution", copy: "Help strong content reach the people it is meant for, through organic work and planned campaigns." },
];
