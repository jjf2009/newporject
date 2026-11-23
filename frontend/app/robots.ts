import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://campus-events.example.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Google-Extended",
          "PerplexityBot",
          "ClaudeBot",
          "anthropic-ai",
          "cohere-ai",
        ],
        allow: ["/", "/events", "/students", "/registrations", "/analytics", "/llms.txt"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
