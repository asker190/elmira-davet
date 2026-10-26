import { prisma } from "@/lib/prisma";
import { getPageBySlug, extractStaticFields } from "@/lib/cms/page-service";
import { Star, MessageSquareQuote, CalendarCheck2 } from "lucide-react";
import Link from "next/link";

import { mockTestimonials } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("referanslar");
  const fields = page ? extractStaticFields(page) : null;
  return {
    title: fields?.seoTitle || "Müşteri Yorumları & Referanslar | Elmira Davet",
    description:
      fields?.seoDescription ||
      "Elmira Davet Salonu'nda dünyaevine giren mutlu çiftlerimizin ve misafirlerimizin samimi değerlendirmeleri.",
  };
}

export default async function TestimonialsPage() {
  const [dbTestimonials, cmsPage] = await Promise.all([
    prisma.testimonial
      .findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      })
      .catch(() => []),
    getPageBySlug("referanslar"),
  ]);
  const page = cmsPage ? extractStaticFields(cmsPage) : { title: "Mutlu Çiftlerimiz & Yorumlar", subtitle: "Misafirlerimizin samimi deneyimleri", badgeText: "Gerçek Deneyimler", heroImageUrl: "", bodyHtml: "", seoTitle: "", seoDescription: "" };

  const testimonials =
    dbTestimonials.length > 0 ? dbTestimonials : mockTestimonials;

  return (
    <div className="pt-28 pb-20 space-y-16">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium">
          {page.badgeText || "Gerçek Deneyimler"}
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-text-primary">
          {cmsPage?.title || page.title}
        </h1>
        <div className="divider-gold" />
        <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto">
          {page.subtitle}
        </p>
      </section>

      {/* Testimonials Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-8 rounded-3xl bg-bg-secondary border border-border flex flex-col justify-between space-y-6 hover:border-gold/40 transition-colors shadow-card"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < t.rating ? "text-gold fill-current" : "text-border"
                        }`}
                      />
                    ))}
                  </div>
                  {t.eventType && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-surface text-gold border border-border font-medium">
                      {t.eventType}
                    </span>
                  )}
                </div>

                <p className="text-sm text-text-secondary italic leading-relaxed">
                  &ldquo;{t.content}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-text-primary text-base font-semibold">
                    {t.name}
                  </h3>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Doğrulanmış Misafir
                  </p>
                </div>

                <MessageSquareQuote className="w-6 h-6 text-gold/30" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 p-10 rounded-3xl bg-bg-secondary border border-gold/40 text-center space-y-4 shadow-elevated max-w-3xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-heading text-gradient-gold">
            Sizin Masalınız Burada Başlasın
          </h3>
          <p className="text-sm text-text-secondary max-w-lg mx-auto">
            Gelin, bu güzel yorumların arasına sizin mutluluk hikayenizi de birlikte ekleyelim.
          </p>
          <div className="pt-2">
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-gold text-bg-primary font-semibold text-xs tracking-wider uppercase shadow-gold hover:opacity-95 transition-opacity"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Hemen Randevu Alın</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
