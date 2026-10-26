import type { Metadata } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-accent",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://elmiradavet.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Elmira Davet & Balo Salonu | İstanbul Gaziosmanpaşa",
    template: "%s | Elmira Davet",
  },
  description:
    "İstanbul Gaziosmanpaşa'da lüks düğün, nişan, kına ve kurumsal etkinlik salonu. 600 kişilik Kristal Salon ve 300 kişilik Kır Bahçesi konseptleri ile unutulmaz anlar.",
  keywords: [
    "elmira davet",
    "düğün salonu",
    "gaziosmanpaşa düğün salonu",
    "istanbul davet salonu",
    "kır düğünü",
    "kına salonu",
    "nişan mekanı",
    "balo salonu istanbul",
  ],
  authors: [{ name: "Elmira Davet" }],
  creator: "Elmira Davet",
  publisher: "Elmira Davet",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl,
    siteName: "Elmira Davet",
    title: "Elmira Davet & Balo Salonu | Hayalinizdeki Düğün ve Davet",
    description:
      "İstanbul Gaziosmanpaşa'da Kristal Salon ve Kır Bahçesi konseptleri ile hayalinizdeki düğün, nişan ve özel davetler için hemen teklif alın.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Elmira Davet Düğün Salonu İstanbul",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elmira Davet & Balo Salonu",
    description:
      "İstanbul Gaziosmanpaşa'da lüks düğün, nişan ve kurumsal etkinlik salonu.",
    images: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop",
    ],
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${playfairDisplay.variable} ${inter.variable} ${cormorantGaramond.variable} h-full antialiased overflow-x-hidden`}
    >
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary font-body selection:bg-gold/30 selection:text-cream overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
