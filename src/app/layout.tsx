import type { Metadata } from "next";
import { Geist_Mono, Atkinson_Hyperlegible, Fredoka } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const atkinsonHyperlegible = Atkinson_Hyperlegible({
  variable: "--font-atkinson-hyperlegible",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Jae Birdsall - Developer",
    template: "%s | Jae Birdsall"
  },
  description: "Jae Birdsall is a Machine Learning Engineer and Full Stack Developer specializing in AI/ML systems, computer vision, and modern web applications. Currently pursuing ML Research at Penn State.",
  keywords: [
    "JaeMin Birdsall",
    "Jae Birdsall",
    "Machine Learning Engineer",
    "Full Stack Developer",
    "AI Developer",
    "Computer Vision",
    "React Developer",
    "Python Developer",
    "TensorFlow",
    "PyTorch",
    "Next.js",
    "TypeScript",
    "Penn State",
    "ML Research",
    "Web Development",
    "Software Engineer"
  ],
  authors: [
    {
      name: "Jae Birdsall",
      url: "https://jaebirdsall.com"
    }
  ],
  creator: "Jae Birdsall",
  publisher: "Jae Birdsall",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://jaebirdsall.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jaebirdsall.com",
    title: "Jae Birdsall - Developer",
    description: "Jae Birdsall is a Machine Learning Engineer and Full Stack Developer specializing in AI/ML systems, computer vision, and modern web applications.",
    siteName: "Jae Birdsall Portfolio",
    // Share image comes from src/app/opengraph-image.tsx (file convention),
    // which wires up both og:image and twitter:image with correct dimensions.
  },
  twitter: {
    card: "summary_large_image",
    title: "Jae Birdsall - Developer",
    description: "Machine Learning Engineer and Full Stack Developer specializing in AI/ML systems, computer vision, and modern web applications.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} ${atkinsonHyperlegible.variable} ${fredoka.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
