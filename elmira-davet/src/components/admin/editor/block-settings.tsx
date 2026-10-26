"use client";

import React, { useState } from "react";
import type { BlockNode } from "@/lib/cms/types";
import { MediaPickerModal } from "./media-picker-modal";
import { Image as ImageIcon, Sparkles, AlertCircle, Link as LinkIcon } from "lucide-react";

interface BlockSettingsProps {
  block: BlockNode;
  onUpdateAttrs: (attrs: Record<string, any>) => void;
  isAdmin?: boolean;
}

export function BlockSettings({ block, onUpdateAttrs, isAdmin = true }: BlockSettingsProps) {
  const { type, attrs } = block;
  const [mediaPickerTarget, setMediaPickerTarget] = useState<string | null>(null);

  const update = (partial: Record<string, any>) => {
    onUpdateAttrs({
      ...attrs,
      ...partial,
    });
  };

  const openMediaPicker = (fieldKey: string) => {
    setMediaPickerTarget(fieldKey);
  };

  const handleMediaSelected = (media: { url: string; alt: string; focalPoint?: string }) => {
    if (mediaPickerTarget) {
      if (mediaPickerTarget === "imageUrl") {
        update({ imageUrl: media.url, posterUrl: attrs.posterUrl || media.url });
      } else if (mediaPickerTarget === "posterUrl") {
        update({ posterUrl: media.url });
      } else if (mediaPickerTarget === "image_block") {
        update({ url: media.url, alt: media.alt || attrs.alt, focalPoint: media.focalPoint || "center" });
      }
    }
    setMediaPickerTarget(null);
  };

  return (
    <div className="space-y-4 text-xs text-cream/90">
      {/* ─── Hero Block Settings ─── */}
      {type === "hero" && (
        <div className="space-y-3">
          <div>
            <label className="block mb-1 font-medium text-cream/80">Medya Türü</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update({ mediaType: "image" })}
                className={`py-1.5 rounded text-xs border ${
                  attrs.mediaType !== "video"
                    ? "bg-gold text-charcoal-900 border-gold font-semibold"
                    : "bg-black/30 border-gold/15 text-cream/70"
                }`}
              >
                Görsel
              </button>
              <button
                type="button"
                onClick={() => update({ mediaType: "video" })}
                className={`py-1.5 rounded text-xs border ${
                  attrs.mediaType === "video"
                    ? "bg-gold text-charcoal-900 border-gold font-semibold"
                    : "bg-black/30 border-gold/15 text-cream/70"
                }`}
              >
                Video
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-cream/80">Arka Plan Görseli</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={attrs.imageUrl || ""}
                onChange={(e) => update({ imageUrl: e.target.value })}
                className="flex-1 px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
              />
              <button
                type="button"
                onClick={() => openMediaPicker("imageUrl")}
                className="px-2.5 py-1.5 bg-gold/15 border border-gold/30 rounded text-gold hover:bg-gold/25"
                title="Galeriden Seç"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {attrs.mediaType === "video" && (
            <>
              <div>
                <label className="block mb-1 font-medium text-cream/80">Video URL (MP4 / WebM)</label>
                <input
                  type="text"
                  value={attrs.videoUrl || ""}
                  onChange={(e) => update({ videoUrl: e.target.value })}
                  placeholder="https://...video.mp4"
                  className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-medium text-cream/80">Video Posteri (Zorunlu PG-B-03)</label>
                  {!attrs.posterUrl && (
                    <span className="text-[10px] text-amber-300">Zorunlu!</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={attrs.posterUrl || ""}
                    onChange={(e) => update({ posterUrl: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => openMediaPicker("posterUrl")}
                    className="px-2.5 py-1.5 bg-gold/15 border border-gold/30 rounded text-gold hover:bg-gold/25"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-cream/40 mt-1">Mobilde video yerine bu poster yüklenir.</p>
              </div>
            </>
          )}

          <div>
            <label className="block mb-1 font-medium text-cream/80">Başlık Metni</label>
            <input
              type="text"
              value={attrs.title || ""}
              onChange={(e) => update({ title: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-cream/80">Alt Başlık</label>
            <textarea
              rows={2}
              value={attrs.subtitle || ""}
              onChange={(e) => update({ subtitle: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 font-medium text-cream/80">1. Buton Yazısı</label>
              <input
                type="text"
                value={attrs.primaryButtonText || ""}
                onChange={(e) => update({ primaryButtonText: e.target.value })}
                className="w-full px-2 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-cream/80">1. Buton Linki</label>
              <input
                type="text"
                value={attrs.primaryButtonUrl || ""}
                onChange={(e) => update({ primaryButtonUrl: e.target.value })}
                className="w-full px-2 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 font-medium text-cream/80">2. Buton Yazısı</label>
              <input
                type="text"
                value={attrs.secondaryButtonText || ""}
                onChange={(e) => update({ secondaryButtonText: e.target.value })}
                className="w-full px-2 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-cream/80">2. Buton Linki</label>
              <input
                type="text"
                value={attrs.secondaryButtonUrl || ""}
                onChange={(e) => update({ secondaryButtonUrl: e.target.value })}
                className="w-full px-2 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-cream/80">Katman Koyuluğu</span>
              <span className="text-gold font-mono">%{attrs.overlayOpacity ?? 55}</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={attrs.overlayOpacity ?? 55}
              onChange={(e) => update({ overlayOpacity: parseInt(e.target.value) })}
              className="w-full accent-gold"
            />
          </div>
        </div>
      )}

      {/* ─── Heading Block Settings ─── */}
      {type === "heading" && (
        <div className="space-y-3">
          <div>
            <label className="block mb-1 font-medium text-cream/80">Başlık Seviyesi (H1 - H4)</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => update({ level: lvl })}
                  className={`py-1.5 text-xs font-semibold rounded border ${
                    (attrs.level || 2) === lvl
                      ? "bg-gold text-charcoal-900 border-gold"
                      : "bg-black/30 border-gold/15 text-cream/70"
                  }`}
                >
                  H{lvl}
                </button>
              ))}
            </div>
            {attrs.level === 1 && (
              <p className="text-[10px] text-amber-300 mt-1">
                Sayfada yalnızca bir adet H1 bulunmalıdır (SEO PG-O-07).
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium text-cream/80">Başlık Metni</label>
            <input
              type="text"
              value={attrs.text || ""}
              onChange={(e) => update({ text: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-cream/80">Üst Rozet Metni (Badge)</label>
            <input
              type="text"
              value={attrs.badgeText || ""}
              onChange={(e) => update({ badgeText: e.target.value })}
              placeholder="örn: ELMİRA DAVET"
              className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-cream/80">Açıklayıcı Alt Metin</label>
            <textarea
              rows={2}
              value={attrs.subtitle || ""}
              onChange={(e) => update({ subtitle: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none resize-none"
            />
          </div>
        </div>
      )}

      {/* ─── Text Block Settings ─── */}
      {type === "text" && (
        <div className="space-y-3">
          <label className="block font-medium text-cream/80">Zengin Metin (HTML)</label>
          <textarea
            rows={8}
            value={attrs.html || ""}
            onChange={(e) => update({ html: e.target.value })}
            className="w-full p-2.5 bg-black/40 border border-gold/20 rounded text-cream text-xs font-mono outline-none"
          />
          <p className="text-[10px] text-cream/50">
            Yapıştırılan metinlerdeki zararlı scriptler ve gereksiz Word stilleri kaydedilirken otomatik temizlenir.
          </p>
        </div>
      )}

      {/* ─── Image Block Settings ─── */}
      {type === "image" && (
        <div className="space-y-3">
          <div>
            <label className="block mb-1 font-medium text-cream/80">Görsel URL'si</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={attrs.url || ""}
                onChange={(e) => update({ url: e.target.value })}
                className="flex-1 px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
              />
              <button
                type="button"
                onClick={() => openMediaPicker("image_block")}
                className="px-2.5 py-1.5 bg-gold/15 border border-gold/30 rounded text-gold hover:bg-gold/25"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-medium text-cream/80">Görsel Alt Metni (SEO)</label>
              {!attrs.alt && <span className="text-[10px] text-amber-300">Zorunlu!</span>}
            </div>
            <input
              type="text"
              value={attrs.alt || ""}
              onChange={(e) => update({ alt: e.target.value })}
              placeholder="Görseli anlatan açıklama..."
              className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-cream/80">En-Boy Oranı</label>
            <select
              value={attrs.aspectRatio || "16:9"}
              onChange={(e) => update({ aspectRatio: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
            >
              <option value="16:9">16:9 (Geniş Ekran)</option>
              <option value="4:3">4:3 (Standart)</option>
              <option value="1:1">1:1 (Kare)</option>
              <option value="auto">Orijinal Boyut (Auto)</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-cream/80">Görsel Altı Yazısı (Caption)</label>
            <input
              type="text"
              value={attrs.caption || ""}
              onChange={(e) => update({ caption: e.target.value })}
              placeholder="İsteğe bağlı alt yazı"
              className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
            />
          </div>
        </div>
      )}

      {/* ─── Gallery Block Settings ─── */}
      {type === "gallery" && (
        <div className="space-y-3">
          <div>
            <label className="block mb-1 font-medium text-cream/80">Galeri Düzeni</label>
            <select
              value={attrs.layout || "masonry"}
              onChange={(e) => update({ layout: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
            >
              <option value="masonry">Masonry (Dinamik Yükseklik)</option>
              <option value="grid">Grid (Eşit Kareler)</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium text-cream/80">Sütun Sayısı</label>
            <select
              value={attrs.columns || 3}
              onChange={(e) => update({ columns: parseInt(e.target.value) })}
              className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
            >
              <option value={2}>2 Sütun</option>
              <option value={3}>3 Sütun</option>
              <option value={4}>4 Sütun</option>
            </select>
          </div>
        </div>
      )}

      {/* ─── Hall Cards Settings ─── */}
      {type === "hall_cards" && (
        <div className="space-y-3">
          <div>
            <label className="block mb-1 font-medium text-cream/80">Görüntüleme Modu</label>
            <select
              value={attrs.displayMode || "all"}
              onChange={(e) => update({ displayMode: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
            >
              <option value="all">Tüm Yayındaki Salonlar</option>
              <option value="selected">Seçilen Salonlar</option>
            </select>
          </div>
          <p className="text-[10px] text-cream/50">
            Taslak veya arşivdeki salonlar ön yüzde otomatik gizlenir (PG-B-04).
          </p>
        </div>
      )}

      {/* ─── Columns Settings (PG-B-07) ─── */}
      {type === "columns" && (
        <div className="space-y-3">
          <div>
            <label className="block mb-1 font-medium text-cream/80">Sütun Sayısı (2-4)</label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => update({ columnsCount: n })}
                  className={`py-1.5 text-xs font-semibold rounded border ${
                    (attrs.columnsCount || 2) === n
                      ? "bg-gold text-charcoal-900 border-gold"
                      : "bg-black/30 border-gold/15 text-cream/70"
                  }`}
                >
                  {n} Sütun
                </button>
              ))}
            </div>
          </div>
          <div className="p-2.5 rounded bg-white/5 border border-white/10 text-[10px] text-cream/60">
            Sütunlar mobilde otomatik alt alta dizilir (PG-B-07).
          </div>
        </div>
      )}

      {/* ─── Button / CTA Band Settings (PG-B-10) ─── */}
      {type === "button_cta" && (
        <div className="space-y-3">
          <div>
            <label className="block mb-1 font-medium text-cream/80">Başlık Metni</label>
            <input
              type="text"
              value={attrs.text || ""}
              onChange={(e) => update({ text: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-cream/80">Buton Yazısı</label>
            <input
              type="text"
              value={attrs.buttonText || ""}
              onChange={(e) => update({ buttonText: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-cream/80">Buton Bağlantısı (URL veya Çapa)</label>
            <input
              type="text"
              value={attrs.buttonUrl || ""}
              onChange={(e) => update({ buttonUrl: e.target.value })}
              placeholder="/iletisim, tel:..., wa.me/..., #bolum"
              className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream text-xs outline-none"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={!!attrs.openInNewTab}
              onChange={(e) => update({ openInNewTab: e.target.checked })}
              className="accent-gold rounded"
            />
            <span>Yeni Sekmede Aç (rel="noopener")</span>
          </label>
        </div>
      )}

      {/* ─── Custom HTML Block Settings (PG-B-09) ─── */}
      {type === "custom_html" && (
        <div className="space-y-3">
          {!isAdmin ? (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              Özel HTML bloğu yalnızca ADMIN tarafından düzenlenebilir (Salt Okunur).
            </div>
          ) : (
            <>
              <label className="block font-medium text-cream/80">Özel HTML Kodu</label>
              <textarea
                rows={8}
                value={attrs.html || ""}
                onChange={(e) => update({ html: e.target.value })}
                className="w-full p-2.5 bg-black/40 border border-gold/20 rounded text-cream text-xs font-mono outline-none"
              />
              <p className="text-[10px] text-cream/50">
                Sunucu tarafında zararlı olaylar ve scriptler temizlenir.
              </p>
            </>
          )}
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={!!mediaPickerTarget}
        onClose={() => setMediaPickerTarget(null)}
        onSelect={handleMediaSelected}
        currentUrl={
          mediaPickerTarget === "imageUrl"
            ? attrs.imageUrl
            : mediaPickerTarget === "posterUrl"
            ? attrs.posterUrl
            : attrs.url
        }
        currentAlt={attrs.alt}
      />
    </div>
  );
}
