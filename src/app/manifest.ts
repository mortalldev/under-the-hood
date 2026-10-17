import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: "Interaktiv, animatsiyali darslar: JavaScript, TypeScript, React, Next.js, Node.js, algoritmlar va system design.",
    start_url: "/uz",
    display: "standalone",
    background_color: "#161a20",
    theme_color: site.color,
    lang: "uz",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
