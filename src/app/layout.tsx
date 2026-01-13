import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import DemoSessionProvider from "@/components/DemoSessionProvider";
import MusicProvider from "@/components/MusicContext";
import RadioWidget from "@/components/RadioWidget";

export const metadata: Metadata = {
  title: "Wolf Whale LMS - Saskatchewan K-12 Learning",
  description: "Wolf Whale Learning Management System - A beautiful, gamified LMS designed for Saskatchewan K-12 curriculum. Glass/Ice UI design.",
  keywords: ["LMS", "Learning Management", "Education", "Saskatchewan", "K-12", "Curriculum"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          <DemoSessionProvider>
            <MusicProvider>
              {children}
              <RadioWidget />
            </MusicProvider>
          </DemoSessionProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
