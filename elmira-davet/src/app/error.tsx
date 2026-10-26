"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home, MessageCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for telemetry / Sentry
    console.error("[Elmira Davet Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-surface border border-border/80 shadow-2xl rounded-3xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-semibold text-gold uppercase tracking-widest">
            Sistem Bildirimi
          </span>
          <h2 className="text-2xl font-heading text-cream mt-1">
            Beklenmeyen Bir Durum Oluştu
          </h2>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            Sayfa yüklenirken geçici bir sorun meydana geldi. Teknik ekibimiz bilgilendirildi. Lütfen sayfayı yenilemeyi deneyin.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-text-muted mt-2">
              Hata Referansı: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 border-t border-border/60">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-gold text-bg-primary text-xs font-semibold shadow-gold hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Yeniden Dene</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-bg-secondary border border-border text-xs text-text-secondary hover:text-cream transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Ana Sayfa</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
