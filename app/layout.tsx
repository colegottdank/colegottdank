import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Cole Gottdank | Brain Rot Portfolio 🧠",
  description: "Founder of Helicone. 800+ commits. AI Gateway infrastructure. YC W23. This portfolio is unhinged on purpose.",
  keywords: ["founder", "helicone", "ai gateway", "startup", "typescript", "open source"],
  authors: [{ name: "Cole Gottdank" }],
  openGraph: {
    title: "Cole Gottdank | Brain Rot Portfolio",
    description: "Founder of Helicone. This portfolio is unhinged on purpose.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
