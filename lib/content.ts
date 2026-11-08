export type Company = { slug: string; name: string; field: string; intro: string; video: string; poster: string };
export const companies: Company[] = [
  { slug: "de-food-kampney", name: "De Food Kampney", field: "Food & restaurant industry", intro: "A platform and ecosystem for the food and restaurant industry.", video: "/media/de-food-kampney.mp4", poster: "/media/de-food-kampney-poster.webp" },
  { slug: "buzzly-health", name: "Buzzly Health", field: "Health", intro: "A company Buzzly is building in the health space.", video: "/media/buzzly-health.mp4", poster: "/media/buzzly-health-poster.webp" },
  { slug: "buzzly-properties", name: "Buzzly Properties", field: "Property", intro: "A company Buzzly is building in the property space.", video: "/media/buzzly-properties.mp4", poster: "/media/buzzly-properties-poster.webp" },
];
export const services = [
  { number: "01", title: "Strategy", copy: "Find the idea, audience, message, and formats that give a brand a distinct direction." },
  { number: "02", title: "Content", copy: "Make that direction tangible through films, reels, images, words, and stories." },
  { number: "03", title: "Social media", copy: "Publish and manage the channels where people encounter and discuss the brand." },
  { number: "04", title: "Distribution", copy: "Help strong content reach the people it is meant for, through organic work and planned campaigns." },
];
