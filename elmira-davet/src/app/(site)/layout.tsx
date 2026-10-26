import type { Metadata } from "next";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { getSiteSettings } from "@/lib/settings";
import { PageTransition } from "@/components/animations/page-transition";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { FloatingWhatsApp } from "@/components/ui/floating-whatsapp";
import { SchemaOrg } from "@/components/seo/schema-org";
import { MetaPixel } from "@/components/seo/meta-pixel";
import { CookieBanner } from "@/components/ui/cookie-banner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Elmira Davet | Düğün & Davet Salonu Gaziosmanpaşa",
    template: "%s | Elmira Davet",
  },
};

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <MotionProvider>
      <SmoothScrollProvider>
        {/* SEO Structured Data */}
        <SchemaOrg
          siteUrl={process.env.NEXT_PUBLIC_SITE_URL}
          phone={settings.phone}
          address={settings.address}
        />

        {/* Consent-aware Meta Pixel */}
        <MetaPixel />

        <ToastProvider />
        <CustomCursor />
        <Navbar
          siteName={settings.siteName}
          phone={settings.phone}
        />
        <main className="flex-1 overflow-x-hidden">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer
          siteName={settings.siteName}
          slogan={settings.slogan}
          phone={settings.phone}
          email={settings.email}
          address={settings.address}
          instagramUrl={settings.instagramUrl}
          facebookUrl={settings.facebookUrl}
          youtubeUrl={settings.youtubeUrl}
        />
        <FloatingWhatsApp phone={settings.phone || "905551234567"} />

        {/* KVKK Cookie Consent Banner */}
        <CookieBanner />
      </SmoothScrollProvider>
    </MotionProvider>
  );
}
