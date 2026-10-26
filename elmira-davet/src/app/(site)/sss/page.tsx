import { mockFaqs } from "@/lib/mock-data";
import { getPageContent } from "@/lib/cms/pages";
import { HelpCircle, CalendarCheck2, Phone } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageContent("sss");
  return {
    title: page.seoTitle || "Sıkça Sorulan Sorular | Elmira Davet Gaziosmanpaşa",
    description:
      page.seoDescription ||
      "Elmira Davet Salonu rezervasyon, menü tadımı, otopark, salon kapasitesi ve fiyatlandırma hakkında merak edilen tüm sorular.",
  };
}

export default async function FaqPage() {
  const page = await getPageContent("sss");

  return (
    <div className="pt-28 pb-20 space-y-20">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium">
          {page.badgeText || "Aklınıza Takılanlar"}
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-cream">
          {page.title}
        </h1>
        <div className="divider-gold" />
        <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto font-sans leading-relaxed">
          {page.subtitle}
        </p>
      </section>

      {/* FAQs List */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        {mockFaqs.map((faq, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-8 rounded-3xl bg-surface border border-border space-y-3 shadow-card hover:border-gold/30 transition-colors"
          >
            <h2 className="text-lg sm:text-xl font-heading text-cream flex items-start gap-3">
              <span className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0 mt-0.5 text-xs font-semibold">
                {idx + 1}
              </span>
              <span>{faq.q}</span>
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary pl-11 leading-relaxed font-sans">
              {faq.a}
            </p>
          </div>
        ))}
      </section>

      {/* Still Have Questions Box */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-bg-secondary border border-border text-center space-y-4">
          <HelpCircle className="w-10 h-10 text-gold mx-auto" />
          <h3 className="text-xl sm:text-2xl font-heading text-cream">
            Farklı Bir Sorunuz Mu Var?
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto font-sans leading-relaxed">
            Bizimle doğrudan iletişime geçebilir, Gaziosmanpaşa merkez salonumuzu dilediğiniz gün
            ziyaret edebilirsiniz.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/iletisim"
              className="px-6 py-3 rounded-full bg-gradient-gold text-bg-primary font-semibold text-xs tracking-wider uppercase shadow-gold hover:opacity-95 transition-opacity"
            >
              İletişime Geçin
            </Link>
            <a
              href="tel:+905551234567"
              className="px-6 py-3 rounded-full bg-surface hover:bg-surface-hover text-cream border border-border text-xs tracking-wider uppercase transition-colors flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-gold" />
              <span>Hemen Arayın</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
