import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Multi-User Engineering Blog",
    short_name: "EngineerBlog",
    description:
      "A multi-user platform for engineers to publish, read and discover technical blog posts.",
    start_url: "/",
    id: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#030712", // gray-950 — matches your loading screen
    theme_color: "#6366f1",      // indigo-500 — matches your brand accent
    categories: ["education", "productivity", "news"],
    lang: "en",
    dir: "ltr",
    prefer_related_applications: false,
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/screen-wide.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Engineering Blog Feed",
      },
      {
        src: "/screenshots/screen-narrow.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "Engineering Blog Mobile",
      },
    ],
  };
}
