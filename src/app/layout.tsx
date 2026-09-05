import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sora, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-deva",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RRB NTPC (UG) CBT-1 — Grand Mock Test & Shift Analysis",
  description:
    "100 fresh, non-repeated questions built from analysis of 45+ RRB NTPC UG shifts. Real exam interface, bilingual questions, instant result analysis.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${sora.variable} ${devanagari.variable} bg-slate-100 text-slate-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
