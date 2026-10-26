"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  Building2,
  Phone,
  Share2,
  Shield,
  Palette,
  Search,
  Save,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Info,
  Globe,
} from "lucide-react";
import { saveSiteSettings } from "../actions";

interface SettingsClientProps {
  initialSettings: Record<string, string>;
}

const BRAND_PALETTES = [
  { name: "Elmira Gold (Varsayılan)", hex: "#C9A86A" },
  { name: "Kraliyet Altını", hex: "#D4AF37" },
  { name: "Şampanya Sarısı", hex: "#E5C158" },
  { name: "Bronz & Amber", hex: "#B8860B" },
  { name: "Gül Kurusu Altın", hex: "#B76E79" },
];

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [formData, setFormData] = useState({
    siteName: initialSettings.siteName || "Elmira Davet Salonu",
    logoUrl:
      initialSettings.logoUrl ||
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=120&q=80",
    slogan:
      initialSettings.slogan ||
      "Aşkınızın Gaziosmanpaşa'daki En Görkemli Sahnesi",
    phone: initialSettings.phone || "+90 555 123 45 67",
    email: initialSettings.email || "info@elmiradavet.com",
    address:
      initialSettings.address ||
      "Merkez Mahallesi, Gaziosmanpaşa Caddesi No: 42, Gaziosmanpaşa / İstanbul",
    mapEmbedUrl: initialSettings.mapEmbedUrl || "",
    instagramUrl: initialSettings.instagramUrl || "https://instagram.com/elmiradavet",
    facebookUrl: initialSettings.facebookUrl || "https://facebook.com/elmiradavet",
    youtubeUrl: initialSettings.youtubeUrl || "",
    tiktokUrl: initialSettings.tiktokUrl || "",
    primaryColor: initialSettings.primaryColor || "#C9A86A",
    aboutText:
      initialSettings.aboutText ||
      "Elmira Davet Salonu olarak, hayatınızın en özel anlarını unutulmaz kılmak için İstanbul Gaziosmanpaşa'da hizmetinizdeyiz.",
    seoTitle:
      initialSettings.seoTitle ||
      "Elmira Davet | Gaziosmanpaşa Düğün & Davet Salonu",
    seoDescription:
      initialSettings.seoDescription ||
      "Gaziosmanpaşa'da 600 kişilik Kristal Salon ve 300 kişilik Kır Bahçesi ile rüya gibi düğün, kına ve nişan organizasyonları.",
    seoKeywords:
      initialSettings.seoKeywords ||
      "gaziosmanpaşa düğün salonu, kır bahçesi istanbul, kristal salon, kına gecesi, nişan mekanı",
    kvkkText: initialSettings.kvkkText || "",
  });

  const [activeTab, setActiveTab] = useState<
    "general" | "branding" | "contact" | "social" | "seo" | "kvkk"
  >("general");

  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const body = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
          body.append(k, String(v || ""));
        });

        const res = await saveSiteSettings(body);
        if (res.success) {
          toast.success("Site ayarları başarıyla kaydedildi ve ön yüze yansıtıldı!");
        } else {
          toast.error(res.error || "Ayarlar kaydedilemedi");
        }
      } catch {
        toast.error("Bağlantı hatası oluştu");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Instant Save Button */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "general", label: "Genel & Logo", icon: Building2 },
            { id: "branding", label: "Marka Renkleri", icon: Palette },
            { id: "contact", label: "İletişim & Harita", icon: Phone },
            { id: "social", label: "Sosyal Medya", icon: Share2 },
            { id: "seo", label: "SEO & Meta", icon: Search },
            { id: "kvkk", label: "KVKK & Metinler", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isCurrent
                    ? "bg-gold text-bg-primary font-semibold shadow-xs"
                    : "bg-bg-secondary text-text-muted hover:text-text-primary"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Save Button */}
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="px-5 py-2 rounded-xl bg-gradient-gold text-bg-primary font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer shrink-0"
        >
          <Save className="w-3.5 h-3.5" />
          {isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. GENERAL & LOGO TAB */}
        {activeTab === "general" && (
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 pb-3 border-b border-border text-gold font-heading font-medium text-base">
              <Building2 className="w-5 h-5" />
              <span>Genel Salon Bilgileri & Logo</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Site / Salon İsmi *
                </label>
                <input
                  type="text"
                  required
                  value={formData.siteName}
                  onChange={(e) =>
                    setFormData({ ...formData, siteName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-bg-secondary border border-border rounded-xl text-xs text-cream focus:outline-hidden focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Slogan & Tanıtım Cümlesi
                </label>
                <input
                  type="text"
                  value={formData.slogan}
                  onChange={(e) =>
                    setFormData({ ...formData, slogan: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-bg-secondary border border-border rounded-xl text-xs text-cream focus:outline-hidden focus:border-gold"
                />
              </div>

              {/* Logo Settings */}
              <div className="md:col-span-2 p-4 rounded-xl bg-bg-secondary border border-border space-y-3">
                <label className="block text-xs font-semibold text-gold">
                  Marka Logosu
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0">
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Logo Önizleme"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-xl font-heading text-gold font-bold">
                        E
                      </span>
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-1">
                    <input
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, logoUrl: e.target.value })
                      }
                      placeholder="https://... logo görseli URL adresi"
                      className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-xs text-cream focus:outline-hidden focus:border-gold font-mono"
                    />
                    <p className="text-[11px] text-text-muted">
                      Şeffaf PNG veya SVG formatında yatay logo önerilir (örn: 240x80 px).
                    </p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Hakkımızda Metni (Ana Sayfa & Kurumsal)
                </label>
                <textarea
                  rows={4}
                  value={formData.aboutText}
                  onChange={(e) =>
                    setFormData({ ...formData, aboutText: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-bg-secondary border border-border rounded-xl text-xs text-cream focus:outline-hidden focus:border-gold resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. BRANDING & COLORS TAB */}
        {activeTab === "branding" && (
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 pb-3 border-b border-border text-gold font-heading font-medium text-base">
              <Palette className="w-5 h-5" />
              <span>Marka Renk Paleti</span>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-text-muted">
                Düğün salonu konseptine uygun altın, şampanya ve bronz tonlarını seçerek buton, ikon ve vurgu renklerini değiştirebilirsiniz.
              </p>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">
                  Hazır Önerilen Lüks Renk Paletleri
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {BRAND_PALETTES.map((p) => {
                    const isSelected =
                      formData.primaryColor.toUpperCase() === p.hex.toUpperCase();
                    return (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, primaryColor: p.hex })
                        }
                        className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                          isSelected
                            ? "bg-bg-secondary border-gold shadow-xs"
                            : "bg-bg-secondary/50 border-border hover:border-gold/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-5 h-5 rounded-full border border-border shrink-0 shadow-xs"
                            style={{ backgroundColor: p.hex }}
                          />
                          <div>
                            <span className="block text-xs font-medium text-cream">
                              {p.name}
                            </span>
                            <span className="block text-[10px] text-text-muted font-mono">
                              {p.hex}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Hex Picker */}
              <div className="p-4 rounded-xl bg-bg-secondary border border-border flex items-center gap-4">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryColor: e.target.value })
                  }
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <div className="flex-1">
                  <label className="block text-xs font-medium text-text-secondary mb-0.5">
                    Özel Hex Kodu
                  </label>
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryColor: e.target.value })
                    }
                    className="w-32 px-3 py-1 bg-surface border border-border rounded-lg text-xs font-mono text-cream focus:outline-hidden focus:border-gold uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. CONTACT & MAP TAB */}
        {activeTab === "contact" && (
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 pb-3 border-b border-border text-gold font-heading font-medium text-base">
              <Phone className="w-5 h-5" />
              <span>İletişim & Konum Bilgileri</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Telefon Numarası *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-bg-secondary border border-border rounded-xl text-xs text-cream focus:outline-hidden focus:border-gold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  E-Posta Adresi
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-bg-secondary border border-border rounded-xl text-xs text-cream focus:outline-hidden focus:border-gold font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Fiziksel Açık Adres
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-bg-secondary border border-border rounded-xl text-xs text-cream focus:outline-hidden focus:border-gold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Google Maps Embed iframe URL
                </label>
                <input
                  type="url"
                  value={formData.mapEmbedUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, mapEmbedUrl: e.target.value })
                  }
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="w-full px-3.5 py-2.5 bg-bg-secondary border border-border rounded-xl text-xs text-cream focus:outline-hidden focus:border-gold font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. SOCIAL MEDIA TAB */}
        {activeTab === "social" && (
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 pb-3 border-b border-border text-gold font-heading font-medium text-base">
              <Share2 className="w-5 h-5" />
              <span>Sosyal Medya Hesapları</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Instagram Profili
                </label>
                <input
                  type="url"
                  value={formData.instagramUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, instagramUrl: e.target.value })
                  }
                  placeholder="https://instagram.com/..."
                  className="w-full px-3.5 py-2.5 bg-bg-secondary border border-border rounded-xl text-xs text-cream focus:outline-hidden focus:border-gold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Facebook Sayfası
                </label>
                <input
                  type="url"
                  value={formData.facebookUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, facebookUrl: e.target.value })
                  }
                  placeholder="https://facebook.com/..."
                  className="w-full px-3.5 py-2.5 bg-bg-secondary border border-border rounded-xl text-xs text-cream focus:outline-hidden focus:border-gold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  YouTube Kanalı
                </label>
                <input
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, youtubeUrl: e.target.value })
                  }
                  placeholder="https://youtube.com/@..."
                  className="w-full px-3.5 py-2.5 bg-bg-secondary border border-border rounded-xl text-xs text-cream focus:outline-hidden focus:border-gold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  TikTok Profili
                </label>
                <input
                  type="url"
                  value={formData.tiktokUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, tiktokUrl: e.target.value })
                  }
                  placeholder="https://tiktok.com/@..."
                  className="w-full px-3.5 py-2.5 bg-bg-secondary border border-border rounded-xl text-xs text-cream focus:outline-hidden focus:border-gold font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. SEO & META TAB */}
        {activeTab === "seo" && (
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 pb-3 border-b border-border text-gold font-heading font-medium text-base">
              <Search className="w-5 h-5" />
              <span>Arama Motoru Optimizasyonu (SEO)</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Varsayılan Meta Başlık (SEO Title)
                </label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, seoTitle: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-bg-secondary border border-border rounded-xl text-xs text-cream focus:outline-hidden focus:border-gold"
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Google arama sonuçlarında görünen ana başlık (50-60 karakter önerilir).
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Meta Açıklama (SEO Description)
                </label>
                <textarea
                  rows={3}
                  value={formData.seoDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, seoDescription: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-bg-secondary border border-border rounded-xl text-xs text-cream focus:outline-hidden focus:border-gold resize-none"
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Arama motoru snippet açıklaması (140-160 karakter önerilir).
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  SEO Anahtar Kelimeler (Virgülle ayırın)
                </label>
                <input
                  type="text"
                  value={formData.seoKeywords}
                  onChange={(e) =>
                    setFormData({ ...formData, seoKeywords: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-bg-secondary border border-border rounded-xl text-xs text-cream focus:outline-hidden focus:border-gold"
                />
              </div>

              {/* Google Search Live Preview snippet */}
              <div className="p-4 rounded-xl bg-bg-secondary border border-border space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-muted block">
                  Google Arama Sonucu Önizlemesi
                </span>
                <p className="text-sm text-blue-400 hover:underline font-medium cursor-pointer">
                  {formData.seoTitle || "Elmira Davet | Düğün Salonu"}
                </p>
                <p className="text-[11px] text-emerald-400 font-mono">
                  https://elmiradavet.com
                </p>
                <p className="text-xs text-text-secondary line-clamp-2">
                  {formData.seoDescription ||
                    "Gaziosmanpaşa'da lüks düğün ve davet salonu."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 6. KVKK TAB */}
        {activeTab === "kvkk" && (
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 pb-3 border-b border-border text-gold font-heading font-medium text-base">
              <Shield className="w-5 h-5" />
              <span>KVKK Aydınlatma & Gizlilik Metni</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                KVKK Aydınlatma Metni (Teklif formlarında ve footer'da bağlantılanır)
              </label>
              <textarea
                rows={12}
                value={formData.kvkkText}
                onChange={(e) =>
                  setFormData({ ...formData, kvkkText: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-bg-secondary border border-border rounded-xl text-xs text-cream focus:outline-hidden focus:border-gold font-mono leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-text-muted">
            Değişiklikleri kaydettiğinizde tüm ön yüz önbelleği anında yenilenecektir.
          </span>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl bg-gradient-gold text-bg-primary font-semibold text-xs flex items-center gap-2 shadow-xs hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Kaydediliyor..." : "Tüm Ayarları Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
