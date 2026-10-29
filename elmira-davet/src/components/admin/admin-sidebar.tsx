"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck2,
  CalendarDays,
  FolderKanban,
  Images,
  Layers,
  FileText,
  Settings,
  Users2,
  Share2,
  ExternalLink,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    href: "/admin",
    label: "Gösterge Paneli",
    badge: null,
    icon: LayoutDashboard,
    description: "Özet ve İstatistikler",
  },
  {
    href: "/admin/meta-leads",
    label: "Meta Reklam Talepleri",
    badge: "Meta",
    icon: Share2,
    description: "Lead Ads & Webhook",
  },
  {
    href: "/admin/talepler",
    label: "Tüm Talepler & CRM",
    badge: null,
    icon: CalendarCheck2,
    description: "Website & Lead Havuzu",
  },
  {
    href: "/admin/takvim",
    label: "Müsaitlik Takvimi",
    badge: null,
    icon: CalendarDays,
    description: "Salon Doluluk Takibi",
  },
  {
    href: "/admin/icerik",
    label: "İçerik Yönetimi",
    badge: null,
    icon: FolderKanban,
    description: "Salon, Paket, Menü, SSS",
  },
  {
    href: "/admin/bolumler",
    label: "Sayfa Bölümleri",
    badge: null,
    icon: Layers,
    description: "Ana Sayfa Blok Hiyerarşisi & Sıralama",
  },
  {
    href: "/admin/galeri",
    label: "Galeri & Medya",
    badge: null,
    icon: Images,
    description: "Çoklu Yükleme & Kırpma",
  },
  {
    href: "/admin/sayfalar",
    label: "Sayfalar",
    badge: "CMS",
    icon: FileText,
    description: "Tüm Sayfa İçerikleri & SEO",
  },
  {
    href: "/admin/ayarlar",
    label: "Site Ayarları",
    badge: null,
    icon: Settings,
    description: "Logo, İletişim, SEO, KVKK",
  },
  {
    href: "/admin/kullanicilar",
    label: "Kullanıcılar & Loglar",
    badge: null,
    icon: Users2,
    description: "Roller ve İşlem Geçmişi",
  },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-bg-secondary border-r border-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-border">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center text-bg-primary font-heading font-bold text-base shadow-sm">
              E
            </div>
            <div>
              <span className="text-base font-heading text-cream block leading-tight">
                Elmira Davet
              </span>
              <span className="text-[10px] text-gold tracking-widest uppercase font-medium">
                Yönetim Paneli
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            aria-label="Menüyü Kapat"
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-gold/15 text-gold border border-gold/30 shadow-xs"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-gold" : "text-text-muted group-hover:text-gold"
                    }`}
                  />
                  <div className="min-w-0">
                    <span className="block truncate font-medium text-xs">
                      {item.label}
                    </span>
                    <span className="block truncate text-[10px] text-text-muted font-normal">
                      {item.description}
                    </span>
                  </div>
                </div>

                {item.badge ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30 font-semibold shrink-0">
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-text-muted transition-transform group-hover:translate-x-0.5 shrink-0 ${
                      isActive ? "text-gold opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-border space-y-1 bg-surface/30">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
              <span>Ön Yüzü Görüntüle</span>
            </span>
            <span className="text-[10px] text-gold font-sans">↗</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/giris" })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-error hover:bg-error/10 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Güvenli Çıkış</span>
          </button>
        </div>
      </aside>
    </>
  );
}
