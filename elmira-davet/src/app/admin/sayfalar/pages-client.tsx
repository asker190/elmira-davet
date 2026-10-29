"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FileText,
  Search,
  ExternalLink,
  Edit3,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Globe,
  Image as ImageIcon,
  Plus,
  Trash2,
  X,
  Eye,
  Sliders,
  Check,
  Calendar,
} from "lucide-react";
import { DynamicPageContent, PageFeatureItem } from "@/lib/cms/pages";
import { savePageAction, resetPageAction } from "./actions";
import { ImageCropUpload } from "@/components/admin/ui/image-crop-upload";

interface PagesClientProps {
  initialPages: DynamicPageContent[];
}

export function PagesClient({ initialPages }: PagesClientProps) {
  const [pages, setPages] = useState<DynamicPageContent[]>(initialPages);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [isPending, startTransition] = useTransition();

  // Active Editing Page Modal State
  const [editingPage, setEditingPage] = useState<DynamicPageContent | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "media" | "features" | "seo">("content");

  // Filtered pages
  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "PUBLISHED"
        ? page.isPublished
        : !page.isPublished;

    return matchesSearch && matchesStatus;
  });

  const totalCount = pages.length;
  const publishedCount = pages.filter((p) => p.isPublished).length;
  const draftCount = totalCount - publishedCount;

  // Save handler
  const handleSave = () => {
    if (!editingPage) return;

    if (!editingPage.title.trim()) {
      toast.error("Sayfa başlığı boş bırakılamaz.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await savePageAction(editingPage);
        if (res.success) {
          toast.success(`"${editingPage.title}" sayfası başarıyla kaydedildi!`);
          setPages((prev) =>
            prev.map((p) => (p.slug === editingPage.slug ? { ...editingPage, updatedAt: new Date().toISOString() } : p))
          );
          setEditingPage(null);
        } else {
          toast.error(res.error || "Kayıt işlemi başarısız oldu.");
        }
      } catch {
        toast.error("Bağlantı hatası oluştu.");
      }
    });
  };

  // Reset handler
  const handleReset = (slug: string, title: string) => {
    if (
      !confirm(
        `"${title}" sayfasının içeriğini orijinal fabrika ayarlarına sıfırlamak istediğinize emin misiniz? Yapılan tüm özel düzenlemeler geri alınacaktır.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await resetPageAction(slug);
        if (res.success) {
          toast.success(`"${title}" sayfası varsayılan şablona sıfırlandı.`);
          // Reload page state
          window.location.reload();
        } else {
          toast.error(res.error || "Sıfırlama başarısız oldu.");
        }
      } catch {
        toast.error("Hata oluştu.");
      }
    });
  };

  // Helper to add feature
  const handleAddFeature = () => {
    if (!editingPage) return;
    const newFeatures: PageFeatureItem[] = [
      ...editingPage.features,
      {
        title: "Yeni Ayrıcalık / Özellik",
        description: "Bu ayrıcalığın detaylarını ve misafirlerinize sunduğu avantajları buraya yazın.",
      },
    ];
    setEditingPage({ ...editingPage, features: newFeatures });
  };

  // Helper to remove feature
  const handleRemoveFeature = (index: number) => {
    if (!editingPage) return;
    const newFeatures = editingPage.features.filter((_, i) => i !== index);
    setEditingPage({ ...editingPage, features: newFeatures });
  };

  // Helper to update feature
  const handleUpdateFeature = (index: number, field: "title" | "description", value: string) => {
    if (!editingPage) return;
    const newFeatures = [...editingPage.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setEditingPage({ ...editingPage, features: newFeatures });
  };

  const getPagePublicUrl = (slug: string) => {
    return slug === "anasayfa" ? "/" : `/${slug}`;
  };

  return (
    <div className="space-y-6">
      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">Toplam Sayfa</p>
            <p className="text-2xl font-heading text-cream mt-0.5">{totalCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-gold/10 text-gold">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">Yayında Olanlar</p>
            <p className="text-2xl font-heading text-emerald-400 mt-0.5">{publishedCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">Taslak Sayfalar</p>
            <p className="text-2xl font-heading text-amber-400 mt-0.5">{draftCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sayfa adı, başlık veya kalıcı bağlantı (slug) ara..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-surface border border-border rounded-xl text-cream placeholder:text-text-muted focus:outline-hidden focus:border-gold"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-gold text-bg-primary font-semibold shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Tümü ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter("PUBLISHED")}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all cursor-pointer ${
              statusFilter === "PUBLISHED"
                ? "bg-emerald-500 text-white font-semibold shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Yayında ({publishedCount})
          </button>
          <button
            onClick={() => setStatusFilter("DRAFT")}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all cursor-pointer ${
              statusFilter === "DRAFT"
                ? "bg-amber-500 text-bg-primary font-semibold shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Taslak ({draftCount})
          </button>
        </div>
      </div>

      {/* Pages Table */}
      <div className="rounded-2xl bg-surface border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-bg-secondary/70 border-b border-border text-text-muted font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Sayfa & Kapak</th>
                <th className="py-3 px-4">Kalıcı Bağlantı (URL)</th>
                <th className="py-3 px-4">Başlık & Rozet</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4">Son Güncelleme</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPages.map((page) => {
                const publicUrl = getPagePublicUrl(page.slug);
                return (
                  <tr key={page.slug} className="hover:bg-bg-secondary/40 transition-colors group">
                    {/* Kapak & Sayfa Adı */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-border bg-black/40 shrink-0">
                          {page.heroImageUrl ? (
                            <Image
                              src={page.heroImageUrl}
                              alt={page.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-muted">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-cream text-sm group-hover:text-gold transition-colors">
                            {page.title}
                          </div>
                          <div className="text-text-muted text-[11px] truncate max-w-xs mt-0.5">
                            {page.subtitle}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <code className="px-2 py-1 rounded bg-bg-secondary border border-border text-gold font-mono text-[11px]">
                        {publicUrl}
                      </code>
                    </td>

                    {/* Rozet */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-surface border border-border text-text-secondary">
                        🏷️ {page.badgeText || "Standart"}
                      </span>
                    </td>

                    {/* Durum */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {page.isPublished ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Yayında
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          Taslak
                        </span>
                      )}
                    </td>

                    {/* Tarih */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-text-muted text-[11px]">
                      {new Date(page.updatedAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={publicUrl}
                          target="_blank"
                          title="Sitede Canlı Gör"
                          className="p-1.5 rounded-lg bg-bg-secondary text-text-muted hover:text-gold hover:bg-gold/10 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => {
                            setEditingPage({ ...page });
                            setActiveTab("content");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-gold/15 text-gold hover:bg-gold/25 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Düzenle</span>
                        </button>

                        <button
                          onClick={() => handleReset(page.slug, page.title)}
                          disabled={isPending}
                          title="Varsayılan İçeriğe Sıfırla"
                          className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredPages.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted text-xs">
                    Aranan kriterlere uygun sayfa bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WordPress Style Full-Featured Page Editor Modal */}
      {editingPage && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-bg-secondary border border-border rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Top Bar */}
            <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-surface/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gold/10 text-gold border border-gold/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-heading text-cream flex items-center gap-2">
                    <span>{editingPage.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-bg-secondary text-gold font-mono">
                      {getPagePublicUrl(editingPage.slug)}
                    </span>
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    WordPress Tarzı Dinamik Sayfa Düzenleyici (CMS)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={getPagePublicUrl(editingPage.slug)}
                  target="_blank"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-secondary border border-border text-text-secondary hover:text-gold text-xs transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Sitede İncele</span>
                </Link>
                <button
                  onClick={() => setEditingPage(null)}
                  className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Editor Tabs Navigation */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-border bg-surface/40 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("content")}
                className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "content"
                    ? "border-gold text-gold"
                    : "border-transparent text-text-secondary hover:text-cream"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1. Temel İçerik & Hikaye</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("media")}
                className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "media"
                    ? "border-gold text-gold"
                    : "border-transparent text-text-secondary hover:text-cream"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>2. Kapak Görseli (Hero)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("features")}
                className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "features"
                    ? "border-gold text-gold"
                    : "border-transparent text-text-secondary hover:text-cream"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>3. Öne Çıkan Özellikler ({editingPage.features.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("seo")}
                className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "seo"
                    ? "border-gold text-gold"
                    : "border-transparent text-text-secondary hover:text-cream"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>4. SEO & Meta Etiketleri</span>
              </button>
            </div>

            {/* Modal Body Scroll Area */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* TAB 1: CONTENT */}
              {activeTab === "content" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">
                        Sayfa Ana Başlığı (H1) *
                      </label>
                      <input
                        type="text"
                        value={editingPage.title}
                        onChange={(e) =>
                          setEditingPage({ ...editingPage, title: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-xs bg-surface border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                      />
                    </div>

                    {/* Badge */}
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">
                        Üst Rozet / Vurgu Metni (Eyebrow Badge)
                      </label>
                      <input
                        type="text"
                        value={editingPage.badgeText}
                        onChange={(e) =>
                          setEditingPage({ ...editingPage, badgeText: e.target.value })
                        }
                        placeholder="Örn: İstanbul - Gaziosmanpaşa"
                        className="w-full px-3.5 py-2.5 text-xs bg-surface border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                      />
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Alt Başlık & Özet Açıklama
                    </label>
                    <input
                      type="text"
                      value={editingPage.subtitle}
                      onChange={(e) =>
                        setEditingPage({ ...editingPage, subtitle: e.target.value })
                      }
                      placeholder="Sayfanın en üstünde ziyaretçiyi karşılayan tanıtım cümlesi"
                      className="w-full px-3.5 py-2.5 text-xs bg-surface border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                    />
                  </div>

                  {/* Body HTML / Rich text */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-text-secondary">
                        Sayfa Detaylı İçerik Metni (Paragraflar & Hikaye)
                      </label>
                      <span className="text-[11px] text-text-muted">
                        Satır araları sitede otomatik olarak paragraflara dönüştürülür.
                      </span>
                    </div>
                    <textarea
                      rows={9}
                      value={editingPage.bodyHtml}
                      onChange={(e) =>
                        setEditingPage({ ...editingPage, bodyHtml: e.target.value })
                      }
                      placeholder="Sayfanın hikayesini, detaylarını ve misafirlerinize aktarmak istediğiniz kurumsal mesajı buraya yazın..."
                      className="w-full p-3.5 text-xs bg-surface border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold leading-relaxed font-sans"
                    />
                  </div>

                  {/* Status Switcher */}
                  <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-cream">Yayınlanma Durumu</p>
                      <p className="text-text-muted text-[11px] mt-0.5">
                        Taslak olarak işaretlendiğinde arama motorlarında indeksleme kısıtlanır.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingPage({
                          ...editingPage,
                          isPublished: !editingPage.isPublished,
                        })
                      }
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        editingPage.isPublished
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-surface border border-border text-text-muted"
                      }`}
                    >
                      {editingPage.isPublished ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Yayında</span>
                        </>
                      ) : (
                        <span>Taslak</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: MEDIA */}
              {activeTab === "media" && (
                <div className="space-y-6">
                  <div>
                    <ImageCropUpload
                      label="Hero / Kapak Banner Görseli"
                      description="Bilgisayarınızdan yüksek kaliteli bir görsel seçin veya mevcut galeriden belirleyin. Görsel otomatik olarak 16:9 formatına göre kırpılacaktır."
                      value={editingPage.heroImageUrl}
                      onChange={(url) =>
                        setEditingPage({ ...editingPage, heroImageUrl: url })
                      }
                      aspectRatio="16/9"
                      category="Sayfalar"
                    />
                  </div>

                  {/* Banner Title Preview */}
                  <div className="p-4 rounded-xl bg-black/40 border border-gold/15">
                    <span className="text-[10px] text-gold uppercase tracking-wider font-semibold">
                      {editingPage.badgeText}
                    </span>
                    <h4 className="text-base font-heading text-cream mt-0.5">
                      {editingPage.title}
                    </h4>
                    <p className="text-xs text-text-muted mt-1">
                      Bu başlık ve rozet, ziyaretçilerin sayfa tepesinde göreceği banner alanıdır.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: FEATURES / HIGHLIGHTS */}
              {activeTab === "features" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div>
                      <p className="font-semibold text-cream">Öne Çıkan Özellik Kartları</p>
                      <p className="text-text-muted text-[11px] mt-0.5">
                        Bu sayfada ızgara şeklinde listelenecek avantaj maddelerini düzenleyin.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-3 py-1.5 rounded-xl bg-gold/15 text-gold hover:bg-gold/25 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Yeni Madde Ekle</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingPage.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-surface border border-border space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-gold">
                            #{idx + 1} Özellik / Ayrıcalık
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(idx)}
                            className="p-1 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-1">
                            <label className="block text-[11px] text-text-secondary mb-1">
                              Başlık *
                            </label>
                            <input
                              type="text"
                              value={feature.title}
                              onChange={(e) =>
                                handleUpdateFeature(idx, "title", e.target.value)
                              }
                              className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] text-text-secondary mb-1">
                              Açıklama *
                            </label>
                            <input
                              type="text"
                              value={feature.description}
                              onChange={(e) =>
                                handleUpdateFeature(idx, "description", e.target.value)
                              }
                              className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {editingPage.features.length === 0 && (
                      <div className="py-8 text-center text-text-muted">
                        Henüz bir öne çıkan özellik eklenmedi. Yukarıdaki butonla ekleyebilirsiniz.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: SEO & SERP PREVIEW */}
              {activeTab === "seo" && (
                <div className="space-y-6">
                  {/* Google SERP Card Preview */}
                  <div>
                    <p className="text-xs font-medium text-text-secondary mb-2">
                      Google Arama Motoru Önizlemesi (SERP)
                    </p>
                    <div className="p-4 rounded-2xl bg-white text-zinc-900 border border-zinc-200 shadow-sm space-y-1 font-sans">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <span className="w-4 h-4 rounded-full bg-gold/20 flex items-center justify-center text-[10px] text-gold font-bold">
                          E
                        </span>
                        <span>elmiradavet.com</span>
                        <span>›</span>
                        <span>{editingPage.slug === "anasayfa" ? "" : editingPage.slug}</span>
                      </div>
                      <h4 className="text-blue-700 text-sm sm:text-base font-medium hover:underline cursor-pointer leading-snug">
                        {editingPage.seoTitle || editingPage.title}
                      </h4>
                      <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">
                        {editingPage.seoDescription || editingPage.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* SEO Title Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-text-secondary">
                        SEO Meta Başlığı (Title) *
                      </label>
                      <span
                        className={`text-[11px] ${
                          editingPage.seoTitle.length > 60
                            ? "text-amber-400 font-semibold"
                            : "text-text-muted"
                        }`}
                      >
                        {editingPage.seoTitle.length} / 60 karakter
                      </span>
                    </div>
                    <input
                      type="text"
                      value={editingPage.seoTitle}
                      onChange={(e) =>
                        setEditingPage({ ...editingPage, seoTitle: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-xs bg-surface border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                    />
                  </div>

                  {/* SEO Description Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-text-secondary">
                        SEO Meta Açıklaması (Description) *
                      </label>
                      <span
                        className={`text-[11px] ${
                          editingPage.seoDescription.length > 160
                            ? "text-amber-400 font-semibold"
                            : "text-text-muted"
                        }`}
                      >
                        {editingPage.seoDescription.length} / 160 karakter
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={editingPage.seoDescription}
                      onChange={(e) =>
                        setEditingPage({
                          ...editingPage,
                          seoDescription: e.target.value,
                        })
                      }
                      className="w-full p-3.5 text-xs bg-surface border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Bar */}
            <div className="p-4 sm:p-5 border-t border-border flex items-center justify-between bg-surface/80">
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-cream cursor-pointer"
              >
                Vazgeç
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold shadow-gold hover:opacity-95 disabled:opacity-50 transition-opacity flex items-center gap-2 cursor-pointer"
                >
                  {isPending ? (
                    <span>Kaydediliyor...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Değişiklikleri Kaydet & Yayınla</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
