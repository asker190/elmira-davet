import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { getPageBySlug, extractStaticFields } from "@/lib/cms/page-service";
import { ReservationForm } from "@/components/site/reservation-form";
import { Phone, Mail, MapPin, Clock, MessageCircle, Sparkles } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("iletisim");
  const fields = page ? extractStaticFields(page) : null;
  return {
    title: fields?.seoTitle || "İletişim & Rezervasyon | Elmira Davet Gaziosmanpaşa",
    description:
      fields?.seoDescription ||
      "Elmira Davet Salonu Gaziosmanpaşa iletişim bilgileri, adres, Google Haritalar konumu ve online randevu formu.",
  };
}

export default async function ContactPage() {
  const [settings, blockedDates, cmsPage] = await Promise.all([
    getSiteSettings(),
    prisma.blockedDate.findMany().catch(() => []),
    getPageBySlug("iletisim"),
  ]);
  const page = cmsPage ? extractStaticFields(cmsPage) : { title: "İletişim & Randevu", subtitle: "Hayalinizdeki daveti birlikte planlayalım", badgeText: "İstanbul - Gaziosmanpaşa", heroImageUrl: "", bodyHtml: "", seoTitle: "", seoDescription: "" };

  const blockedDateStrings = blockedDates.map(
    (b) => b.date.toISOString().split("T")[0]
  );

  const phone = settings.phone || "+90 555 123 45 67";
  const email = settings.email || "info@elmiradavet.com";
  const address =
    settings.address ||
    "Merkez Mahallesi, Gaziosmanpaşa Caddesi No: 42, Gaziosmanpaşa / İstanbul";
  const waNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905551234567";

  const waUrl = getWhatsAppUrl(
    waNumber,
    "Merhaba, Elmira Davet Salonu (Gaziosmanpaşa) için Kristal Salon ve Kır Bahçesi hakkında bilgi ve randevu almak istiyorum."
  );

  return (
    <div className="pt-28 pb-20 space-y-20">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-gold/30 text-gold text-xs">
          <MapPin className="w-3.5 h-3.5" />
          <span>{page.badgeText || "İstanbul - Gaziosmanpaşa"}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-cream">
          {cmsPage?.title || page.title}
        </h1>
        <div className="divider-gold" />
        <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto font-sans leading-relaxed">
          {page.subtitle}
        </p>
      </section>

      {/* Main Grid: Contact Info + Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Info Side Cards */}
          <div className="space-y-6">
            <div className="p-8 rounded-3xl bg-surface border border-border space-y-6 shadow-card">
              <h2 className="text-xl font-heading text-cream">
                İletişim Bilgileri
              </h2>

              <ul className="space-y-4 text-xs sm:text-sm">
                <li className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-gold/10 text-gold shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px] uppercase tracking-wider mb-0.5">
                      Adres
                    </span>
                    <span className="text-cream leading-relaxed">
                      {address}
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-gold/10 text-gold shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px] uppercase tracking-wider mb-0.5">
                      Telefon
                    </span>
                    <a
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className="text-cream hover:text-gold transition-colors font-medium"
                    >
                      {phone}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-gold/10 text-gold shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px] uppercase tracking-wider mb-0.5">
                      E-posta
                    </span>
                    <a
                      href={`mailto:${email}`}
                      className="text-cream hover:text-gold transition-colors"
                    >
                      {email}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-gold/10 text-gold shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px] uppercase tracking-wider mb-0.5">
                      Ziyaret Saatleri
                    </span>
                    <span className="text-cream">
                      Haftanın her günü 09:00 – 22:00
                    </span>
                  </div>
                </li>
              </ul>

              {/* Fast WhatsApp Connect Card */}
              <div className="pt-4 border-t border-border">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>WhatsApp ile Hızlı Mesaj</span>
                </a>
              </div>
            </div>

            {/* Google Map Box */}
            <div className="rounded-3xl overflow-hidden border border-border h-72 bg-surface relative shadow-card">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48145.43851502476!2d28.8789508!3d41.0664684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab009c9168475%3A0x67399a9a3b723f6e!2zR2F6aW9zbWFucGHFn2EvxLBzdGFuYnVs!5e0!3m2!1str!2str!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Elmira Davet Salonu Gaziosmanpaşa Google Harita"
              />
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-2">
            <ReservationForm
              blockedDateStrings={blockedDateStrings}
              whatsAppNumber={waNumber}
              kvkkText={settings.kvkkText}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
