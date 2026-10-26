"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FileText,
  ArrowLeft,
  Sparkles,
  Check,
  AlertTriangle,
  Layout,
  Layers,
  Building2,
  PhoneCall,
  AlignLeft,
  ChevronRight,
} from "lucide-react";
import { slugifyTurkish } from "@/lib/cms/validation";
import { checkSlugAvailabilityAction, createPageAction } from "../actions";
import type { BlockNode } from "@/lib/cms/types";

// ─── Template Presets (PG-N-02) ───────────────────────────

const TEMPLATES = [
  {
    id: "default",
    name: "Boş Sayfa",
    icon: Layout,
    description: "Sıfırdan blok ekleyerek kendi tasarımınızı oluşturun.",
    blocks: (): BlockNode[] => [],
  },
  {
    id: "home",
    name: "Ana Sayfa Düzeni",
    icon: Layers,
    description: "Hero sahnesi, salon kartları, sayaçlar, paketler, galeri ve rezervasyon formu.",
    blocks: (): BlockNode[] => [
      {
        id: `blk_hero_${Date.now()}`,
        type: "hero",
        schemaVersion: 1,
        attrs: {
          title: "Aşkınızın En Görkemli Sahnesi",
          subtitle: "Gaziosmanpaşa'da Lüks & Zarafet | 600 ve 300 Kişilik İki Farklı Konsept",
          posterUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80",
          button1Text: "Salonlarımızı Keşfedin",
          button1Link: "/salonlar",
          button2Text: "Fiyat Teklifi Al",
          button2Link: "#randevu",
          overlayDarkness: 45,
          parallaxEnabled: true,
        },
      },
      {
        id: `blk_halls_${Date.now() + 1}`,
        type: "hall_cards",
        schemaVersion: 1,
        attrs: { mode: "all", layout: "grid", showFeatures: true },
      },
      {
        id: `blk_counters_${Date.now() + 2}`,
        type: "counters",
        schemaVersion: 1,
        attrs: {
          items: [
            { label: "Mutlu Çift", value: 2500, suffix: "+" },
            { label: "Maksimum Kapasite", value: 900, suffix: " Kişi" },
            { label: "Yıllık Deneyim", value: 15, suffix: " Yıl" },
            { label: "Müşteri Memnuniyeti", value: 100, prefix: "%" },
          ],
        },
      },
      {
        id: `blk_pkgs_${Date.now() + 3}`,
        type: "packages",
        schemaVersion: 1,
        attrs: { mode: "all", showPricing: true, featuredFirst: true },
      },
      {
        id: `blk_form_${Date.now() + 4}`,
        type: "reservation_form",
        schemaVersion: 1,
        attrs: {
          title: "Hemen Teklif ve Randevu Alın",
          subtitle: "Özel gününüzü birlikte planlayalım",
          defaultSlot: "NIGHT",
        },
      },
    ],
  },
  {
    id: "hall_detail",
    name: "Salon Detay Düzeni",
    icon: Building2,
    description: "Kapak görseli, salon detayları, fotoğraf galerisi ve rezervasyon formu.",
    blocks: (): BlockNode[] => [
      {
        id: `blk_hero_${Date.now()}`,
        type: "hero",
        schemaVersion: 1,
        attrs: {
          title: "Kristal Salon (600 Kişilik)",
          subtitle: "Yüksek tavan, kolonsuz ferah saray mimarisi ve görkemli kristal avizeler.",
          posterUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&q=80",
          button1Text: "Hemen Randevu Al",
          button1Link: "#randevu",
          overlayDarkness: 40,
        },
      },
      {
        id: `blk_txt_${Date.now() + 1}`,
        type: "text",
        schemaVersion: 1,
        attrs: {
          html: "<p>Kristal Salonumuz; Gaziosmanpaşa merkezde geniş dans pisti, gelişmiş robotik aydınlatma ve akustik ses düzeniyle 600 kişiye kadar konuklarınızı ağırlamaktadır.</p>",
          leadText: true,
        },
      },
      {
        id: `blk_gal_${Date.now() + 2}`,
        type: "gallery",
        schemaVersion: 1,
        attrs: { categorySlug: "all", layout: "masonry", enableLightbox: true },
      },
      {
        id: `blk_res_${Date.now() + 3}`,
        type: "reservation_form",
        schemaVersion: 1,
        attrs: { title: "Bu Salon İçin Tarih Sorgulayın", defaultSlot: "NIGHT" },
      },
    ],
  },
  {
    id: "content",
    name: "İçerik & Hikaye Sayfası",
    icon: AlignLeft,
    description: "Hakkımızda veya kurumsal tanıtımlar için başlık, zengin metin ve SSS.",
    blocks: (): BlockNode[] => [
      {
        id: `blk_head_${Date.now()}`,
        type: "heading",
        schemaVersion: 1,
        attrs: { text: "Zarafetin Gaziosmanpaşa'daki Adresi", level: 1, badge: "KURUMSAL" },
      },
      {
        id: `blk_txt_${Date.now() + 1}`,
        type: "text",
        schemaVersion: 1,
        attrs: {
          html: "<p>Elmira Davet Salonu olarak, hayatınızın en mutlu gününü zarafet, konfor ve profesyonellikle buluşturuyoruz. 15 yılı aşkın tecrübemiz ve uzman ekibimizle her detayı sizin için kusursuz kılıyoruz.</p>",
          leadText: true,
        },
      },
      {
        id: `blk_faq_${Date.now() + 2}`,
        type: "faq",
        schemaVersion: 1,
        attrs: { mode: "all", generateSchema: true },
      },
    ],
  },
  {
    id: "contact",
    name: "İletişim & Randevu",
    icon: PhoneCall,
    description: "Rezervasyon formu, ulaşım haritası ve iletişim bilgileri.",
    blocks: (): BlockNode[] => [
      {
        id: `blk_head_${Date.now()}`,
        type: "heading",
        schemaVersion: 1,
        attrs: { text: "Bizimle İletişime Geçin", level: 1, subtitle: "Hayalinizdeki organizasyon için bir kahveye bekleriz." },
      },
      {
        id: `blk_res_${Date.now() + 1}`,
        type: "reservation_form",
        schemaVersion: 1,
        attrs: { title: "Randevu ve Bilgi Formu", defaultSlot: "NIGHT" },
      },
      {
        id: `blk_map_${Date.now() + 2}`,
        type: "map",
        schemaVersion: 1,
        attrs: { title: "Mekanımıza Kolay Ulaşım", zoomLevel: 15 },
      },
    ],
  },
];

export default function NewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("default");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugStatus, setSlugStatus] = useState<{
    available?: boolean;
    message?: string;
    isInTrash?: boolean;
    isReserved?: boolean;
  }>({});
  const [isPending, startTransition] = useTransition();

  // Auto-generate slug from title unless user edited it manually (PG-N-01)
  useEffect(() => {
    if (!isSlugManual && title) {
      setSlug(slugifyTurkish(title));
    }
  }, [title, isSlugManual]);

  // Debounced slug check (PG-N-01, PG-N-05)
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      const res = await checkSlugAvailabilityAction(slug);
      setSlugStatus(res);
      setIsCheckingSlug(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [slug]);

  // Create Page & Redirect to Editor (PG-N-04)
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Lütfen sayfa başlığı giriniz.");
      return;
    }

    if (slugStatus.available === false) {
      toast.error(slugStatus.message || "Lütfen geçerli ve benzersiz bir kalıcı bağlantı belirleyin.");
      return;
    }

    startTransition(async () => {
      const templateObj = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];
      const initialBlocks = templateObj.blocks();

      const res = await createPageAction({
        title: title.trim(),
        slug: slug.trim(),
        template: selectedTemplate,
        content: initialBlocks,
        status: "DRAFT",
      });

      if (res.success && res.page) {
        toast.success("Taslak sayfa oluşturuldu! Editöre yönlendiriliyorsunuz...");
        router.push(`/admin/sayfalar/${res.page.id}`);
      } else {
        toast.error(res.error || "Sayfa oluşturulamadı.");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* ── Top Bar & Back ── */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <Link
          href="/admin/sayfalar"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted hover:text-gold transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tüm Sayfalara Dön</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-heading text-cream">
          Yeni Sayfa Oluştur
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Sayfanızın başlığını girin, hazır şablonlardan birini seçin ve editörde blokları düzenlemeye başlayın.
        </p>
      </div>

      <form onSubmit={handleCreate} className="space-y-8">
        {/* ── 1. Page Title & Slug Input ── */}
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-5 shadow-card">
          <div>
            <label className="text-xs font-semibold text-cream uppercase tracking-wider block mb-2">
              Sayfa Başlığı <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Kına Gecesi & Bekarlığa Veda Paketleri"
              className="w-full px-4 py-3 rounded-xl bg-bg-secondary border border-border text-sm text-cream focus:border-gold focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Kalıcı Bağlantı (Slug)
              </label>
              {isSlugManual && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSlugManual(false);
                    setSlug(slugifyTurkish(title));
                  }}
                  className="text-[11px] text-gold hover:underline cursor-pointer"
                >
                  Otomatik Üret
                </button>
              )}
            </div>

            <div className="flex items-center rounded-xl bg-bg-secondary border border-border overflow-hidden px-3 focus-within:border-gold transition-colors">
              <span className="text-xs text-text-muted select-none">elmiradavet.com/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setIsSlugManual(true);
                  setSlug(e.target.value);
                }}
                placeholder="ornek-sayfa-baglantisi (kök için boş bırakabilirsiniz)"
                className="w-full py-2.5 px-1 bg-transparent text-xs text-cream focus:outline-none"
              />
            </div>

            {/* Slug Feedback (PG-N-01, PG-N-05) */}
            <div className="mt-2 text-[11px] min-h-[18px]">
              {isCheckingSlug ? (
                <span className="text-text-muted">Bağlantı kontrol ediliyor...</span>
              ) : slugStatus.available === true ? (
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Bu kalıcı bağlantı kullanılabilir.</span>
                </span>
              ) : slugStatus.message ? (
                <span className="text-amber-400 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{slugStatus.message}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── 2. Template Selection (PG-N-02) ── */}
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-cream uppercase tracking-wider">
              Başlangıç Şablonu Seçin
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Seçtiğiniz şablon editöre hazır blokları yerleştirir. Daha sonra dilediğiniz gibi ekleme ve çıkarma yapabilirsiniz.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map((tmpl) => {
              const Icon = tmpl.icon;
              const isSelected = selectedTemplate === tmpl.id;

              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? "bg-gold/10 border-gold shadow-gold/20 shadow-md"
                      : "bg-surface border-border hover:border-border-hover hover:bg-surface/80"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isSelected
                          ? "bg-gold text-bg-primary"
                          : "bg-bg-secondary text-gold"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? "border-gold bg-gold text-bg-primary"
                          : "border-border"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-heading text-cream font-semibold">
                      {tmpl.name}
                    </h3>
                    <p className="text-[11px] text-text-secondary leading-relaxed mt-1">
                      {tmpl.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3. Submit Action ── */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link
            href="/admin/sayfalar"
            className="px-5 py-2.5 rounded-xl border border-border text-xs text-text-secondary hover:text-cream transition-colors"
          >
            Vazgeç
          </Link>

          <button
            type="submit"
            disabled={isPending || !title.trim() || slugStatus.available === false}
            className="px-6 py-3 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider shadow-gold hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isPending ? (
              <span>Oluşturuluyor...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Sayfayı Oluştur ve Düzenle</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
