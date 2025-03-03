import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { WagmiConfig } from "@/components/wagmi-provider";
import FrameProvider from "@/components/frame-provider";
import { BANNER_IMG, BASE_URL, ICON_IMG } from "./lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: 'Swan Memory Lane',
      template: '%s | Swan Memory Lane',
    },
    description: 'Interactive visualization tool for SWAN AI agents\' diary entries and artifacts',
    openGraph: {
      title: 'Swan Memory Lane',
      description: 'Interactive visualization tool for SWAN AI agents\' diary entries and artifacts',
      images: [BANNER_IMG],
      url: BASE_URL,
      siteName: 'Swan Memory Lane',
      locale: 'en_US',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
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
            url: BASE_URL,
            splashImageUrl: ICON_IMG,
            splashBackgroundColor: "#483248",
          },
        },
      })
    }
  }
}

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
