import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

interface FooterProps {
  siteName?: string;
  slogan?: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  eventTypes?: Array<{ id: string; title: string; slug?: string }>;
}

export function Footer({
  siteName = "Elmira Davet",
  slogan = "Hayalinizdeki Düğün Burada Başlıyor",
  logoUrl,
  phone = "+90 555 123 45 67",
  email = "info@elmira.com",
  address = "Atatürk Mahallesi, Cumhuriyet Caddesi No: 123, Merkez/İstanbul",
  instagramUrl,
  facebookUrl,
  youtubeUrl,
  eventTypes,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-secondary border-t border-border pt-16 pb-8 text-text-secondary relative overflow-hidden">
      {/* Decorative subtle ambient gold glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gold/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-border">
          {/* Brand & Slogan */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={siteName || "Elmira Davet"}
                  className="h-12 sm:h-14 w-auto max-w-[200px] object-contain hover:opacity-90 transition-opacity"
                />
              ) : (
                <span className="text-2xl font-heading text-gradient-gold">
                  {siteName || "Elmira Davet"}
                </span>
              )}
            </Link>
            <p className="text-xs text-text-muted leading-relaxed font-accent text-sm">
              {slogan}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-gold hover:border-gold/40 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-gold hover:border-gold/40 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-gold hover:border-gold/40 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-text-primary font-semibold">
              Hızlı Bağlantılar
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/hakkimizda"
                  className="hover:text-gold transition-colors"
                >
                  Hakkımızda & Salonumuz
                </Link>
              </li>
              <li>
                <Link
                  href="/paketler"
                  className="hover:text-gold transition-colors"
                >
                  Düğün & Etkinlik Paketleri
                </Link>
              </li>
              <li>
                <Link
                  href="/galeri"
                  className="hover:text-gold transition-colors"
                >
                  Fotoğraf Galerisi
                </Link>
              </li>
              <li>
                <Link
                  href="/referanslar"
                  className="hover:text-gold transition-colors"
                >
                  Mutlu Çiftlerimizin Yorumları
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-gold transition-colors"
                >
                  Düğün Rehberi & Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-text-primary font-semibold">
              Etkinlik Türleri
            </h4>
            <ul className="space-y-2 text-xs text-text-muted">
              {eventTypes && eventTypes.length > 0 ? (
                eventTypes.slice(0, 6).map((ev, i) => (
                  <li key={ev.id || i}>{ev.title}</li>
                ))
              ) : (
                <>
                  <li>Düğün & Nikah Töreni</li>
                  <li>Nişan & Söz Merasimi</li>
                  <li>Kına Gecesi & Bekarlığa Veda</li>
                  <li>Sünnet Düğünü</li>
                  <li>Kurumsal Davet & Gala Yemekleri</li>
                  <li>Mezuniyet & Özel Kutlamalar</li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-text-primary font-semibold">
              İletişim & Konum
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="hover:text-gold transition-colors"
                >
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-gold transition-colors"
                >
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar & KVKK */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {currentYear} {siteName}. Tüm hakları saklıdır.</p>

          <div className="flex items-center gap-6">
            <Link href="/kvkk" className="hover:text-gold transition-colors">
              KVKK Aydınlatma Metni
            </Link>
            <Link href="/admin/giris" className="hover:text-text-primary transition-colors">
              Personel Girişi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Instagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function Facebook(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function Youtube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}
