import type { MetadataRoute } from "next";
import { siteDescription, siteName } from "@/lib/site";

/** Web app manifest: lets Android/Chrome use the golden Buzzly emblem for home-screen installs. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Buzzly Media",
    short_name: siteName,
    description: siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#151313",
    theme_color: "#151313",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
