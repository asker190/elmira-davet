import { mockEvents } from "@/lib/mock-data";
import { getSafeSetting } from "@/lib/local-store";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck2, Sparkles, Heart, Gem, Crown, Building, PartyPopper } from "lucide-react";
import { getPageBySlug, extractStaticFields } from "@/lib/cms/page-service";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("etkinlikler");
  const fields = page ? extractStaticFields(page) : null;
  return {
    title: fields?.seoTitle || "Etkinlik Türleri & Hizmetlerimiz | Elmira Davet",
    description:
      fields?.seoDescription ||
      "Düğün, nişan, kına gecesi, söz merasimi, sünnet düğünü ve kurumsal davetleriniz için Elmira Davet Salonu ayrıcalıkları.",
  };
}

const iconMap: Record<string, React.ElementType> = {
  Heart,
  Gem,
  Sparkles,
  Crown,
  Building,
  PartyPopper,
};

export default async function EventsPage() {
  const [cmsPage, customRaw] = await Promise.all([
    getPageBySlug("etkinlikler"),
    getSafeSetting("admin_custom_events"),
  ]);
  const fields = cmsPage ? extractStaticFields(cmsPage) : null;

  let events = mockEvents;
  if (customRaw) {
    try {
      const parsed = JSON.parse(customRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        events = parsed.filter((e: any) => e.isActive !== false);
      }
    } catch {}
  }

  return (
    <div className="pt-28 pb-20 space-y-20">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium">
          {fields?.badgeText || "Hizmet Yelpazemiz"}
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-cream">
          {cmsPage?.title || "Her Özel Güne Kusursuz Dokunuş"}
        </h1>
        <div className="divider-gold" />
        <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto font-sans leading-relaxed">
          {fields?.subtitle || "Evlilik merasimlerinden geleneksel kına gecelerine, sünnet törenlerinden kurumsal galalara kadar her organizasyon türü için uzman kadromuzla yanınızdayız."}
        </p>
      </section>

      {/* Events Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => {
            const Icon = iconMap[event.iconName] || Sparkles;

            return (
              <div
                key={event.id}
                className="group rounded-3xl overflow-hidden bg-surface border border-border hover:border-gold/50 transition-all duration-300 flex flex-col justify-between shadow-card"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-60 w-full overflow-hidden">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/30" />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-gold text-xs border border-gold/30">
                      {event.capacity}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mb-2">
                      <Icon className="w-5 h-5" />
                    </div>

                    <h3 className="text-xl font-heading text-cream group-hover:text-gold transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
                      {event.desc}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href="/iletisim"
                    className="w-full py-3 rounded-full bg-surface-hover hover:bg-gold/10 hover:text-gold text-cream border border-border hover:border-gold/30 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Teklif Al & Planla</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-bg-secondary border border-gold/40 text-center space-y-4 shadow-elevated">
          <h3 className="text-2xl sm:text-3xl font-heading text-gradient-gold">
            Özel Bir Konsept Mi Düşünüyorsunuz?
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto font-sans leading-relaxed">
            Hayalinizdeki konsepti, renk paletini ve müzik akışını organizasyon sorumlumuzla
            birlikte tasarlayabilirsiniz.
          </p>
          <div className="pt-2">
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-gold text-bg-primary font-semibold text-xs tracking-wider uppercase shadow-gold hover:opacity-95 transition-opacity"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Görüşme Randevusu Oluşturun</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
