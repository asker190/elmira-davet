"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, CalendarCheck2 } from "lucide-react";

interface NavbarProps {
  siteName?: string;
  phone?: string;
  logoUrl?: string;
}

const navLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/salonlar", label: "Salonlarımız" },
  { href: "/paketler", label: "Paketler & Menüler" },
  { href: "/etkinlikler", label: "Etkinlikler" },
  { href: "/galeri", label: "Galeri" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/referanslar", label: "Yorumlar" },
  { href: "/sss", label: "SSS" },
  { href: "/iletisim", label: "İletişim" },
];

export function Navbar({
  siteName = "Elmira Davet",
  phone = "+90 555 123 45 67",
  logoUrl,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-bg-primary/95 backdrop-blur-md border-b border-border py-3 shadow-card"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName || "Elmira Davet"}
                className="h-10 sm:h-12 w-auto max-w-[180px] sm:max-w-[240px] object-contain group-hover:opacity-90 transition-opacity"
              />
            ) : (
              <span className="text-xl sm:text-2xl font-heading tracking-wide text-gradient-gold group-hover:opacity-90 transition-opacity">
                {siteName || "Elmira Davet"}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-3 2xl:gap-5">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[11px] 2xl:text-xs font-medium tracking-wide transition-colors relative py-1 whitespace-nowrap ${
                    isActive
                      ? "text-gold font-semibold"
                      : "text-text-secondary hover:text-cream"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-gold rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-gold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-gold" />
              <span className="hidden 2xl:inline">{phone}</span>
            </a>

            <Link
              href="/iletisim"
              className="px-4 py-2 rounded-full bg-gradient-gold text-bg-primary font-semibold text-xs tracking-wider uppercase hover:opacity-95 transition-opacity shadow-gold flex items-center gap-1.5"
            >
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>Teklif Al</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menü"
            className="p-2 rounded-xl text-text-secondary hover:text-cream hover:bg-surface xl:hidden transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gold" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-40 xl:hidden flex flex-col justify-center px-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm mx-auto bg-bg-secondary border border-border rounded-3xl p-6 space-y-4 shadow-elevated"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xl font-heading text-gradient-gold">
                {siteName}
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gold/10 text-gold border border-gold/20"
                        : "text-text-secondary hover:text-cream hover:bg-surface"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-border space-y-2">
              <Link
                href="/iletisim"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-full bg-gradient-gold text-bg-primary font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2"
              >
                <CalendarCheck2 className="w-4 h-4" />
                <span>Teklif & Randevu Al</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
