import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "../components/app-shell";

export const metadata: Metadata = {
  title: "Campus Event Management Platform | Events, Registration & Analytics",
  description: "A full-stack college event management system for event scheduling, student registrations, capacity waitlists, attendance tracking, analytics, and MongoDB-backed operations.",
  keywords: [
    "campus event management",
    "college event registration",
    "student event platform",
    "event waitlist management",
    "attendance tracking",
    "MongoDB sharding",
    "MongoDB replication",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full bg-slate-50 font-sans text-slate-800 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
