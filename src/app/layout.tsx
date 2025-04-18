import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Main from "@/components/main";
import LiveCursors from "@/components/liveblocks/cursors";
import { Room } from "@/components/liveblocks/room";
import { showCursorsFlag } from "@/lib/flags";
import { SoundProvider } from "@/contexts/sound-context";
import { ReactFlowProvider } from "@xyflow/react";

import "./globals.css";

const oracle = localFont({
  src: "../assets/fonts/ABCOracleVariable-Trial.woff2",
  variable: "--font-oracle",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://btn0s.dev"),
  title: "bt norris, design engineer",
  description:
    "I'm a designer and programmer interested in games, tools, artifical intelligence, and driven by the joy of discovery.",
  openGraph: {
    images: "/og.png",
  },
  twitter: {
    card: "summary_large_image",
    images: "/og.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if cursors should be shown
  const showCursors = await showCursorsFlag();

  return (
    <html lang="en">
      <body
        className={`${oracle.variable} ${geistMono.variable} antialiased font-[family-name:var(--font-oracle)] dark min-h-screen flex flex-col transition`}
      >
        <SoundProvider>
          <ReactFlowProvider>
            <Room>
              <Header />
              <Main>{children}</Main>
              <Footer />
              <Analytics />
              {showCursors && <LiveCursors />}
            </Room>
          </ReactFlowProvider>
        </SoundProvider>
      </body>
    </html>
  );
}
