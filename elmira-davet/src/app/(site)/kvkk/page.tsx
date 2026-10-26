import { getSiteSettings } from "@/lib/settings";
import { getPageContent } from "@/lib/cms/pages";
import { ShieldCheck, Mail, Phone } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageContent("kvkk");
  return {
    title: page.seoTitle || "KVKK Aydınlatma Metni | Elmira Davet",
    description:
      page.seoDescription ||
      "Elmira Davet Salonu 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamındaki aydınlatma metni.",
  };
}

export default async function KvkkPage() {
  const [settings, page] = await Promise.all([
    getSiteSettings(),
    getPageContent("kvkk"),
  ]);

  const defaultKvkk = `KVKK AYDINLATMA METNİ

Elmira Davet Salonu ("Şirket") olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında kişisel verilerinizin güvenliğine büyük önem vermekteyiz.

1. Veri Sorumlusu
Elmira Davet Salonu, kişisel verilerinizin işlenmesinde veri sorumlusu sıfatıyla hareket etmektedir.

2. İşlenen Kişisel Veriler
- Kimlik bilgileri (ad, soyad)
- İletişim bilgileri (telefon numarası, e-posta adresi)
- Etkinlik talebine dair bilgiler (tarih, organizasyon türü, tahmini misafir sayısı, özel notlar)

3. Kişisel Verilerin İşlenme Amacı
- Rezervasyon ve randevu taleplerinizin karşılanması
- Teklif sunulması ve organizasyon süreçlerinin planlanması
- Müşteri memnuniyetinin artırılması ve iletişim faaliyetlerinin yürütülmesi

4. Kişisel Verilerin Aktarılması
Kişisel verileriniz yasal zorunluluklar ve yetkili kamu kurum ve kuruluşlarının talepleri haricinde hiçbir surette üçüncü şahıs ya da kurumlarla paylaşılmamaktadır.

5. Veri Saklama ve İmha Süresi
Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca saklanır. Rezervasyon kayıtları etkinlik tarihinden itibaren azami 2 yıl süreyle muhafaza edilir ve süre sonunda güvenli şekilde imha edilir.

6. İlgili Kişi Olarak Haklarınız
KVKK'nın 11. maddesi uyarınca veri sahipleri;
- Kişisel verilerinin işlenip işlenmediğini öğrenme,
- Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,
- Amacına uygun kullanılıp kullanılmadığını öğrenme,
- Eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme,
- Verilerin silinmesini veya yok edilmesini talep etme haklarına sahiptir.

Başvuru ve Bilgi Talebi:
Haklarınıza ilişkin başvurularınızı ${settings.email || "info@elmira.com"} e-posta adresimize iletebilirsiniz.`;

  const displayText =
    page.bodyHtml && page.bodyHtml !== "Bu sayfanın içeriği henüz eklenmedi."
      ? page.bodyHtml
      : settings.kvkkText || defaultKvkk;

  return (
    <div className="pt-28 pb-20 space-y-12">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 text-gold mb-2">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading text-text-primary">
          {page.title || "KVKK Aydınlatma Metni"}
        </h1>
        <div className="divider-gold" />
        <p className="text-text-secondary text-xs sm:text-sm max-w-xl mx-auto">
          {page.subtitle || "6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Bilgilendirme"}
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-bg-secondary border border-border space-y-6 shadow-card">
          <div className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-wrap font-sans">
            {displayText}
          </div>

          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <Mail className="w-3.5 h-3.5 text-gold" />
                {settings.email || "info@elmira.com"}
              </span>
              <span className="flex items-center gap-1.5 text-text-secondary">
                <Phone className="w-3.5 h-3.5 text-gold" />
                {settings.phone || "+90 555 123 45 67"}
              </span>
            </div>

            <Link
              href="/iletisim"
              className="text-gold hover:underline font-medium"
            >
              İletişim Sayfasına Git →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
