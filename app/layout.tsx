import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

// Render every request fresh so deploys show up immediately
// (the prerendered homepage was getting edge-cached with a 1-year TTL)
export const dynamic = "force-dynamic";

// Cover the notch/safe areas so the mobile TikTok feed can go truly full-viewport.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Cole Gottdank",
  description: "GTM/growth engineering at Mintlify. Previously helped take Helicone from zero to $1M ARR. This site has a TikTok in it on purpose.",
  authors: [{ name: "Cole Gottdank" }],
  openGraph: {
    title: "Cole Gottdank",
    description: "GTM/growth engineering at Mintlify. This site has a TikTok in it on purpose.",
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
      <body className={`${inter.variable} antialiased bg-white`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
