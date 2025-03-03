import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { WagmiConfig } from "@/components/wagmi-provider";
import FrameProvider from "@/components/frame-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Base URL for the application
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Image URLs
const BANNER_IMG = `${BASE_URL}/images/swan-banner.svg`;
const ICON_IMG = `${BASE_URL}/images/swan-icon.svg`;

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Swan Memory Lane - Diary Visualizer",
  description: "Visualize diary entries from SWAN agents and explore their memory, artifacts, and sentiment history.",
  icons: {
    icon: ICON_IMG
  },
  openGraph: {
    title: "Swan Memory Lane",
    description: "Visualize diary entries from SWAN agents and explore their memory, artifacts, and sentiment history.",
    images: [BANNER_IMG],
    url: BASE_URL,
    siteName: "Swan Memory Lane",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swan Memory Lane",
    description: "Visualize diary entries from SWAN agents and explore their memory, artifacts, and sentiment history.",
    images: [BANNER_IMG],
  },
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: BANNER_IMG,
      button: {
        title: "View Swan Memory Lane",
        action: {
          type: "launch_frame",
          name: "Swan Memory Lane",
          url: `${BASE_URL}`,
          splashImageUrl: ICON_IMG,
          splashBackgroundColor: "#000000",
        },
      },
    })
  }
} as Metadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FrameProvider>
          <WagmiConfig>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
          >
            {children}
            </ThemeProvider>
          </WagmiConfig>
        </FrameProvider>
      </body>
    </html>
  );
}
