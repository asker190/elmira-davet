import React from "react";

interface SchemaOrgProps {
  siteUrl?: string;
  phone?: string;
  address?: string;
}

export function SchemaOrg({
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://elmiradavet.com",
  phone = "+902125554433",
  address = "Merkez Mah. Bağlar Cad. No:12, Gaziosmanpaşa, İstanbul",
}: SchemaOrgProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["EventVenue", "LocalBusiness"],
        "@id": `${siteUrl}/#venue`,
        name: "Elmira Davet & Balo Salonu",
        alternateName: "Elmira Düğün ve Davet Salonu Gaziosmanpaşa",
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        image: [
          "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
        ],
        description:
          "İstanbul Gaziosmanpaşa'da lüks düğün, nişan, kına ve kurumsal etkinlik salonu. Kristal Salon (600 kişilik) ve Kır Bahçesi (300 kişilik) konseptleri ile unutulmaz anlar.",
        telephone: phone,
        email: "info@elmiradavet.com",
        priceRange: "₺₺ - ₺₺₺",
        currenciesAccepted: "TRY",
        paymentAccepted: "Cash, Credit Card, Bank Transfer",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Merkez Mah. Bağlar Cad. No:12",
          addressLocality: "Gaziosmanpaşa",
          addressRegion: "İstanbul",
          postalCode: "34245",
          addressCountry: "TR",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 41.0667,
          longitude: 28.9167,
        },
        hasMap: "https://maps.google.com/?q=Gaziosmanpasa+Istanbul",
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "09:00",
            closes: "23:30",
          },
        ],
        maximumAttendeeCapacity: 600,
        amenityFeature: [
          {
            "@type": "LocationFeatureSpecification",
            name: "Ücretsiz Otopark ve Vale Hizmeti",
            value: true,
          },
          {
            "@type": "LocationFeatureSpecification",
            name: "Merkezi İklimlendirme ve Havalandırma",
            value: true,
          },
          {
            "@type": "LocationFeatureSpecification",
            name: "Lüks Gelin & Damat Hazırlık Odası",
            value: true,
          },
          {
            "@type": "LocationFeatureSpecification",
            name: "Canlı Orkestra, Ses ve Işık Sistemleri",
            value: true,
          },
          {
            "@type": "LocationFeatureSpecification",
            name: "Jeneratör & Kesintisiz Güç Kaynağı",
            value: true,
          },
        ],
        sameAs: [
          "https://www.instagram.com/elmiradavet",
          "https://www.facebook.com/elmiradavet",
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
