import { prisma } from "@/lib/prisma";
import { getPageContent } from "@/lib/cms/pages";
import Link from "next/link";
import { Check, Star, ArrowRight, HelpCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

import { mockPackages } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageContent("paketler");
  return {
    title: page.seoTitle || "Düğün & Etkinlik Paketleri | Elmira Davet",
    description:
      page.seoDescription ||
      "Gümüş, Altın ve Elmas düğün paketlerimiz ile hayalinizdeki daveti en avantajlı şartlarla planlayın.",
  };
}

export default async function PackagesPage() {
  const [dbPackages, page] = await Promise.all([
    prisma.package
      .findMany({
        where: { isActive: true },
        include: {
          features: {
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
      })
      .catch(() => []),
    getPageContent("paketler"),
  ]);

  const packages = dbPackages.length > 0 ? dbPackages : mockPackages;

  const faqs = [
    {
      q: "Paket içeriğinde değişiklik veya ekleme yapabilir miyiz?",
      a: "Evet, tüm paketlerimiz çiftlerimizin isteklerine göre esnetilebilir. Menü çeşitlerinden orkestra seçimine, süsleme renklerinden pasta türüne kadar her detayı dilediğiniz gibi özelleştirebiliriz.",
    },
    {
      q: "Ödeme koşulları ve taksit imkanı nasıl?",
      a: "Sözleşme aşamasında belirli bir kapora alınmakta, kalan bakiye ise etkinlik tarihine kadar uygun taksitlendirme seçenekleriyle ödenebilmektedir.",
    },
    {
      q: "Düğün öncesi menü tadımı yapabiliyor muyuz?",
      a: "Elbette. Altın ve Elmas paketlerimizde ailelerinizle birlikte şefimizin özel sunumu eşliğinde menü tadımı organizasyonu gerçekleştirilmektedir.",
    },
    {
      q: "Fotoğraf ve video çekimi paketlere dahil mi?",
      a: "Tüm paketlerimizde profesyonel kamera ve HD video çekimi hizmeti yer almakta olup, Elmas paketimizde drone ve Jimmy Jib çekimi de hediye edilmektedir.",
    },
  ];

  return (
    <div className="pt-28 pb-20 space-y-20">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium">
          {page.badgeText || "Kişiye Özel Konseptler"}
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-text-primary">
          {page.title}
        </h1>
        <div className="divider-gold" />
        <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto">
          {page.subtitle}
        </p>
      </section>

      {/* Packages Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-8 rounded-3xl bg-bg-secondary border flex flex-col justify-between transition-all duration-300 relative group hover:-translate-y-1.5 ${
                pkg.isFeatured
                  ? "border-gold shadow-gold ring-1 ring-gold/40"
                  : "border-border hover:border-gold/30"
              }`}
            >
              {pkg.isFeatured && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold bg-gradient-gold text-bg-primary uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Öne Çıkan Paket
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-heading text-text-primary">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                <div className="pb-6 border-b border-border">
                  <span className="text-3xl sm:text-4xl font-heading text-gradient-gold font-bold">
                    {pkg.priceLabel ||
                      formatPrice(pkg.price ? Number(pkg.price) : null)}
                  </span>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-text-secondary font-medium mb-3">
                    Paket Detayları:
                  </p>
                  <ul className="space-y-3">
                    {pkg.features.map((feat) => (
                      <li
                        key={feat.id}
                        className="flex items-start gap-3 text-xs sm:text-sm text-text-secondary"
                      >
                        <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                        <span>{feat.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-border">
                <Link
                  href="/iletisim"
                  className={`w-full py-4 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    pkg.isFeatured
                      ? "bg-gradient-gold text-bg-primary hover:opacity-95 shadow-gold"
                      : "bg-surface hover:bg-surface-hover text-text-primary border border-border"
                  }`}
                >
                  <span>Teklif Al & Randevu Oluştur</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium">
            Merak Edilenler
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading text-text-primary">
            Sıkça Sorulan Sorular
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-bg-secondary border border-border space-y-2"
            >
              <h4 className="text-base font-heading text-text-primary flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-gold shrink-0" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs sm:text-sm text-text-secondary pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
