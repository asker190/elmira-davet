import Link from "next/link";
import { ArrowLeft, Home, Calendar, Phone } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 text-center">
      <div className="max-w-lg w-full bg-surface border border-border/80 shadow-2xl rounded-3xl p-8 sm:p-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-6xl sm:text-7xl font-heading text-gold font-bold tracking-tight">
          404
        </div>

        <div>
          <h2 className="text-2xl font-heading text-cream">
            Sayfa Bulunamadı
          </h2>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanım dışı kalmış olabilir.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/60">
          <Link
            href="/"
            className="px-5 py-3 rounded-2xl bg-bg-secondary border border-border hover:border-gold/40 text-xs text-text-secondary hover:text-cream transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-gold" />
            <span>Ana Sayfa</span>
          </Link>

          <Link
            href="/salonlar"
            className="px-5 py-3 rounded-2xl bg-bg-secondary border border-border hover:border-gold/40 text-xs text-text-secondary hover:text-cream transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4 text-gold" />
            <span>Salonlarımız</span>
          </Link>
        </div>

        <div className="pt-2">
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-2 text-xs text-gold hover:text-gold-light underline"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Bize Ulaşın & Randevu Alın</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
