"use client";

import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";

interface FloatingWhatsAppProps {
  phone?: string;
  defaultMessage?: string;
}

export function FloatingWhatsApp({
  phone = "905551234567",
  defaultMessage = "Merhaba, Elmira Davet Salonu (Gaziosmanpaşa) için düğün ve organizasyon hakkında bilgi almak istiyorum.",
}: FloatingWhatsAppProps) {
  const url = getWhatsAppUrl(phone, defaultMessage);

  return (
    <aside aria-label="WhatsApp İletişim Hattı" className="fixed bottom-6 right-6 z-40">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp İletişim Hattı"
        className="group relative flex items-center gap-3 px-4 py-3 rounded-full bg-[#25D366] text-white shadow-elevated hover:scale-105 transition-all duration-300"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>

        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs font-semibold tracking-wide hidden sm:inline">
          WhatsApp Bilgi Hattı
        </span>
      </a>
    </aside>
  );
}
