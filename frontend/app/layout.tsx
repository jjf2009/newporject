import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "../components/app-shell";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://campus-events.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Campus Event Management Platform | College Events, Registration & Analytics",
    template: "%s | Campus Event Management Platform",
  },
  description:
    "Production-ready campus event management platform. Streamlines college event scheduling, student registration, capacity limits, waitlists, attendance tracking, and participation analytics powered by a resilient sharded MongoDB cluster.",
  keywords: [
    "campus event management platform",
    "college event registration system",
    "student activity management",
    "university event scheduling software",
    "campus venue and hall booking",
    "event waitlist and capacity management",
    "student attendance tracking",
    "college hackathon registration",
    "campus cultural fest management",
    "mongodb sharded event platform",
    "geo-tagged campus events",
    "higher education event operations",
  ],
  authors: [{ name: "Campus Event Operations Team", url: siteUrl }],
  creator: "Campus Event Management Platform",
  publisher: "Campus Event Management Platform",
  applicationName: "Campus Event Management Platform",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Campus Event Management Platform | Events, Registration & Analytics",
    description:
      "Enterprise college event platform featuring real-time registrations, waitlist automation, attendance check-ins, venue capacity insights, and MongoDB cluster analytics.",
    url: siteUrl,
    siteName: "Campus Event Management Platform",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Event Management Platform | College Events & Registration",
    description:
      "Full-stack collegiate event management platform with student directory, waitlist automation, attendance tracking, and MongoDB sharding.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "IN-GA",
    "geo.placename": "Campus Main Quad & Conference Halls",
    "geo.position": "15.4226;73.9803",
    "ICBM": "15.4226, 73.9803",
    "DC.title": "Campus Event Management Platform",
    "geo.country": "IN",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      "name": "Campus Event Management Platform",
      "applicationCategory": "BusinessApplication, EducationalApplication",
      "operatingSystem": "Web, Cloud, Node.js",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "description":
        "Production-grade collegiate event management system for campus scheduling, student registrations, capacity waitlists, and participation analytics.",
    },
    {
      "@type": "CollegeOrUniversity",
      "@id": `${siteUrl}/#campus`,
      "name": "Campus Event Operations Center",
      "location": {
        "@type": "Place",
        "name": "Main University Campus",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Central Quadrangle, University Campus",
          "addressLocality": "Farmagudi, Ponda",
          "addressRegion": "Goa",
          "postalCode": "403401",
          "addressCountry": "IN",
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 15.4226,
          "longitude": 73.9803,
        },
      },
    },
    {
      "@type": "EventSeries",
      "@id": `${siteUrl}/#events`,
      "name": "Collegiate Academic, Technical & Cultural Events",
      "description":
        "Official campus events including hackathons, technical workshops, robotics expos, cultural fests, and guest lectures.",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": "Campus Multi-Venue Facilities",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Farmagudi, Ponda",
          "addressRegion": "Goa",
          "addressCountry": "IN",
        },
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="h-full bg-slate-50 font-sans text-slate-800 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
