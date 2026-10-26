"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

interface MetaPixelProps {
  pixelId?: string;
}

/**
 * Checks if the user has accepted marketing cookies in accordance with KVKK / GDPR
 */
export function hasMarketingCookieConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("elmira_cookie_consent");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed.marketing);
  } catch {
    return false;
  }
}

/**
 * Client-side helper to track Meta events with deduplication eventId
 */
export function trackClientMetaLead(options: {
  eventId: string;
  contentName?: string;
  value?: number;
  currency?: string;
}) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (!hasMarketingCookieConsent()) {
    console.log("[Meta Pixel] Event suppressed due to lack of cookie consent.");
    return;
  }

  window.fbq(
    "track",
    "Lead",
    {
      content_name: options.contentName || "Düğün & Davet Teklif Talebi",
      content_category: "Rezervasyon",
      currency: options.currency || "TRY",
      value: options.value || 100000,
    },
    { eventID: options.eventId }
  );
}

export function MetaPixel({ pixelId }: MetaPixelProps) {
  const activePixelId =
    pixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const [canLoadPixel, setCanLoadPixel] = useState(false);

  useEffect(() => {
    // Initial consent check
    if (hasMarketingCookieConsent()) {
      setCanLoadPixel(true);
    }

    // Listen for real-time cookie consent updates
    const handleConsentChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ marketing?: boolean }>;
      if (customEvent.detail?.marketing) {
        setCanLoadPixel(true);
      }
    };

    window.addEventListener("cookie_consent_updated", handleConsentChange);
    return () => {
      window.removeEventListener("cookie_consent_updated", handleConsentChange);
    };
  }, []);

  if (!activePixelId || !canLoadPixel) {
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${activePixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${activePixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
