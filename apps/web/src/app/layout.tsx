import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans-var",
  display: "swap",
});

const display = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display-var",
  display: "swap",
  weight: ["600", "700", "800"],
});

const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "tricityinvestment - Homes in Mohali, Chandigarh, Zirakpur & Kharar",
    template: "%s - tricityinvestment",
  },
  description:
    "Verified flats, villas, plots and commercial property across the Chandigarh corridor. Real prices, real photos, personalised matching.",
  openGraph: {
    type: "website",
    siteName: "tricityinvestment",
    title: "tricityinvestment - Homes in the Chandigarh corridor",
    description: "Verified property across Mohali, Chandigarh, Zirakpur and Kharar.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full bg-page font-sans text-ink">{children}</body>
    </html>
  );
}
