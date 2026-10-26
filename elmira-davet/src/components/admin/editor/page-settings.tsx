"use client";

import React, { useState } from "react";
import type { PageData, PageSeoConfig, PageStatus } from "@/lib/cms/types";
import { MediaPickerModal } from "./media-picker-modal";
import {
  Globe,
  Image as ImageIcon,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Search,
} from "lucide-react";

interface PageSettingsProps {
  page: PageData;
  onUpdatePage: (partial: Partial<PageData>) => void;
  allPages: PageData[];
  isAdmin?: boolean;
}

export function PageSettings({ page, onUpdatePage, allPages, isAdmin = true }: PageSettingsProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const seo: PageSeoConfig = page.seo || {};

  const updateSeo = (partial: Partial<PageSeoConfig>) => {
    onUpdatePage({
      seo: {
        ...seo,
        ...partial,
      },
    });
  };

  const seoTitle = seo.title || page.title || "";
  const seoDesc =
    seo.description ||
    "Elmira Davet & Balo Salonları, lüks mimarisi ve zengin organizasyon menüleriyle en özel anlarınızı taçlandırıyor.";

  const titleLength = seoTitle.length;
  const descLength = seoDesc.length;

  return (
    <div className="space-y-5 text-xs text-cream/90">
      {/* ─── Page Attributes ─── */}
      <div className="space-y-3 pb-4 border-b border-gold/15">
        <div>
          <label className="block mb-1 font-medium text-cream/80">Sayfa Başlığı</label>
          <input
            type="text"
            value={page.title}
            onChange={(e) => onUpdatePage({ title: e.target.value })}
            placeholder="Sayfa başlığı yazın..."
            className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-cream/80">Kalıcı Bağlantı (Slug)</label>
          <div className="flex items-center gap-1">
            <span className="text-cream/50 text-[11px] font-mono">/</span>
            <input
              type="text"
              value={page.slug}
              onChange={(e) =>
                onUpdatePage({
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "-"),
                })
              }
              placeholder="kök sayfa için boş bırakın"
              className="flex-1 px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs font-mono outline-none focus:border-gold"
            />
          </div>
          <p className="text-[10px] text-cream/40 mt-1">Ana sayfa / kök için boş bırakabilirsiniz (/)</p>
        </div>

        {/* Status & Scheduled Date */}
        <div>
          <label className="block mb-1 font-medium text-cream/80">Sayfa Durumu</label>
          <select
            value={page.status}
            onChange={(e) => onUpdatePage({ status: e.target.value as PageStatus })}
            disabled={page.isSystem}
            className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none focus:border-gold disabled:opacity-50"
          >
            <option value="DRAFT">Taslak (DRAFT)</option>
            <option value="PENDING_REVIEW">İncelemede (PENDING_REVIEW)</option>
            <option value="SCHEDULED">Zamanlanmış (SCHEDULED)</option>
            <option value="PUBLISHED">Yayında (PUBLISHED)</option>
          </select>
        </div>

        {page.status === "SCHEDULED" && (
          <div className="p-3 bg-gold/10 border border-gold/25 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-gold font-semibold text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>Zamanlanmış Yayın Tarihi (TR Saati)</span>
            </div>
            <input
              type="datetime-local"
              value={page.scheduledAt ? new Date(page.scheduledAt).toISOString().slice(0, 16) : ""}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value).toISOString() : null;
                onUpdatePage({ scheduledAt: date });
              }}
              className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/25 rounded text-cream text-xs outline-none"
            />
            <p className="text-[10px] text-cream/50">
              Belirtilen saat geldiğinde otomatik olarak yayına alınır (PG-P-06).
            </p>
          </div>
        )}

        {/* Parent Page & Template */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block mb-1 font-medium text-cream/80">Üst Sayfa</label>
            <select
              value={page.parentId || ""}
              onChange={(e) => onUpdatePage({ parentId: e.target.value || null })}
              className="w-full px-2 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
            >
              <option value="">(Yok - Ana Seviye)</option>
              {allPages
                .filter((p) => p.id !== page.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-cream/80">Menü Sırası</label>
            <input
              type="number"
              value={page.menuOrder || 0}
              onChange={(e) => onUpdatePage({ menuOrder: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
            />
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block mb-1 font-medium text-cream/80">Öne Çıkan Görsel</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={page.featuredImageId || ""}
              onChange={(e) => onUpdatePage({ featuredImageId: e.target.value })}
              placeholder="Görsel URL veya ID"
              className="flex-1 px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
            />
            <button
              type="button"
              onClick={() => setShowMediaPicker(true)}
              className="px-2.5 py-1.5 bg-gold/15 border border-gold/30 rounded text-gold hover:bg-gold/25"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── SEO Panel (PG-S-01 to PG-S-07) ─── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 font-semibold text-gold text-xs">
          <Globe className="w-4 h-4" />
          <span>Arama Motoru Optimizasyonu (SEO)</span>
        </div>

        {/* Google Snippet Live Preview */}
        <div className="p-3 bg-charcoal-800/90 border border-gold/25 rounded-xl space-y-1">
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
            <span>elmiradavet.com</span>
            <span>› {page.slug || "sayfa"}</span>
          </div>
          <div className="text-sm font-semibold text-blue-400 hover:underline cursor-pointer truncate">
            {seoTitle || page.title || "Sayfa Başlığı"} | Elmira Davet
          </div>
          <div className="text-[11px] text-cream/70 line-clamp-2 leading-relaxed">
            {seoDesc}
          </div>
        </div>

        {/* SEO Title with Counter */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-medium text-cream/80">SEO Başlığı</label>
            <span
              className={`text-[10px] font-mono ${
                titleLength > 60 ? "text-amber-300 font-bold" : "text-cream/40"
              }`}
            >
              {titleLength} / 60 karakter
            </span>
          </div>
          <input
            type="text"
            value={seo.title || ""}
            onChange={(e) => updateSeo({ title: e.target.value })}
            placeholder={page.title || "Arama motorlarında görünecek başlık"}
            className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none focus:border-gold"
          />
        </div>

        {/* Meta Description with Counter */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-medium text-cream/80">Meta Açıklaması</label>
            <span
              className={`text-[10px] font-mono ${
                descLength > 155 ? "text-amber-300 font-bold" : "text-cream/40"
              }`}
            >
              {descLength} / 155 karakter
            </span>
          </div>
          <textarea
            rows={3}
            value={seo.description || ""}
            onChange={(e) => updateSeo({ description: e.target.value })}
            placeholder="Sayfa hakkında arama motorlarında çıkacak özet..."
            className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none focus:border-gold resize-none"
          />
        </div>

        {/* Canonical URL */}
        <div>
          <label className="block mb-1 font-medium text-cream/80">Kanonik URL (Canonical)</label>
          <input
            type="url"
            value={seo.canonical || ""}
            onChange={(e) => updateSeo({ canonical: e.target.value })}
            placeholder="https://elmiradavet.com/..."
            className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
          />
        </div>

        {/* Indexing Checkboxes */}
        <div className="pt-2 space-y-2 border-t border-gold/10">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!seo.noIndex}
              onChange={(e) => updateSeo({ noIndex: e.target.checked })}
              className="accent-gold rounded"
            />
            <span>Arama motorlarında dizine ekleme (noindex)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!seo.noFollow}
              onChange={(e) => updateSeo({ noFollow: e.target.checked })}
              className="accent-gold rounded"
            />
            <span>Bağlantıları takip etme (nofollow)</span>
          </label>
        </div>
      </div>

      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(media) => {
          onUpdatePage({ featuredImageId: media.url });
          setShowMediaPicker(false);
        }}
        currentUrl={page.featuredImageId || ""}
      />
    </div>
  );
}
