import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LiveTicker } from "@/components/layout/LiveTicker";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Yellove — Live Cricket Scores",
    template: "%s | Yellove",
  },
  description:
    "Live cricket scores, scorecards, ball-by-ball commentary and match schedules. Your home for cricket — yellove.co.in",
  metadataBase: new URL("https://yellove.co.in"),
  openGraph: {
    siteName: "Yellove",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} h-full dark`}>
      <body className="flex min-h-full flex-col bg-background antialiased">
        <QueryProvider>
          <Navbar />
          <LiveTicker />
          <main className="flex-1">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
