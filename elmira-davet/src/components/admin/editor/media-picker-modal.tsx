"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Image as ImageIcon, Upload, Check, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: { url: string; alt: string; focalPoint?: string }) => void;
  currentUrl?: string;
  currentAlt?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentUrl = "",
  currentAlt = "",
}: MediaPickerModalProps) {
  const [selectedUrl, setSelectedUrl] = useState(currentUrl);
  const [altText, setAltText] = useState(currentAlt);
  const [focalPoint, setFocalPoint] = useState("center");
  const [activeTab, setActiveTab] = useState<"upload" | "library">("upload");
  const [images, setImages] = useState<Array<{ id: string; url: string; title?: string }>>([]);
  const [loading, setLoading] = useState(false);

  // Preset curated wedding & banquet venue images
  const defaultPresets = [
    {
      id: "preset-1",
      url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
      title: "Görkemli Balo Salonu",
    },
    {
      id: "preset-2",
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      title: "Düğün Masa Düzeni & Şamdanlar",
    },
    {
      id: "preset-3",
      url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80",
      title: "Gelin Yolu ve Çiçek Tagı",
    },
    {
      id: "preset-4",
      url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
      title: "Kına ve Özel Davet Alanı",
    },
    {
      id: "preset-5",
      url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
      title: "Dış Mekan & Kokteyl Bahçesi",
    },
    {
      id: "preset-6",
      url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80",
      title: "Gourmet Düğün Menüsü",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(currentUrl);
      setAltText(currentAlt || "");
      fetch("/api/upload")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.items) && data.items.length > 0) {
            setImages(
              data.items.map((i: any) => ({
                id: i.id,
                url: i.imageUrl || i.url,
                title: i.title || "Elmira Davet",
              }))
            );
          } else {
            setImages(defaultPresets);
          }
        })
        .catch(() => setImages(defaultPresets));
    }
  }, [isOpen, currentUrl, currentAlt]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedUrl) {
      toast.error("Lütfen bilgisayarınızdan bir görsel yükleyin veya galeriden seçin.");
      return;
    }

    if (!altText.trim()) {
      toast("Alt metin (SEO & Erişilebilirlik) boş bırakıldı. Doldurmanız önerilir.", {
        icon: "⚠️",
      });
    }

    onSelect({
      url: selectedUrl,
      alt: altText.trim(),
      focalPoint,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-charcoal-900 border border-gold/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gold/15 bg-white/5">
          <div className="flex items-center gap-2 text-gold font-semibold text-sm">
            <ImageIcon className="w-4 h-4" />
            <span>Medya & Fotoğraf Seçici</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-cream/50 hover:text-cream hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-gold/15 bg-black/30 px-4">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "upload"
                ? "border-gold text-gold"
                : "border-transparent text-cream/60 hover:text-cream"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bilgisayardan Yükle & Kırp</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("library")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "library"
                ? "border-gold text-gold"
                : "border-transparent text-cream/60 hover:text-cream"
            }`}
          >
            Medya Galerisi & Arşiv
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === "upload" && (
            <div className="space-y-4">
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={async (e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (!file) return;
                  if (!file.type.startsWith("image/")) {
                    toast.error("Lütfen bir görsel dosyası seçin");
                    return;
                  }
                  setLoading(true);
                  const toastId = toast.loading("Görsel yükleniyor...");
                  try {
                    const fd = new FormData();
                    fd.append("file", file);
                    const res = await fetch("/api/upload", { method: "POST", body: fd });
                    const json = await res.json();
                    if (json.success && json.url) {
                      setSelectedUrl(json.url);
                      if (!altText) setAltText(file.name.replace(/\.[^/.]+$/, ""));
                      toast.success("Fotoğraf bilgisayardan başarıyla yüklendi!", { id: toastId });
                    } else {
                      toast.error(json.error || "Yüklenemedi", { id: toastId });
                    }
                  } catch {
                    toast.error("Bağlantı hatası", { id: toastId });
                  } finally {
                    setLoading(false);
                  }
                }}
                className="border-2 border-dashed border-gold/30 hover:border-gold rounded-2xl p-8 text-center bg-black/30 hover:bg-black/50 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer block"
              >
                <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                  {loading ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <Upload className="w-7 h-7" />
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-cream block">
                    Bilgisayarınızdan fotoğraf seçmek için tıklayın
                  </span>
                  <span className="text-xs text-cream/50 block">
                    veya fotoğrafı doğrudan bu alana sürükleyip bırakın (PNG, JPG, WebP)
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  disabled={loading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setLoading(true);
                    const toastId = toast.loading("Görsel yükleniyor...");
                    try {
                      const fd = new FormData();
                      fd.append("file", file);
                      const res = await fetch("/api/upload", { method: "POST", body: fd });
                      const json = await res.json();
                      if (json.success && json.url) {
                        setSelectedUrl(json.url);
                        if (!altText) setAltText(file.name.replace(/\.[^/.]+$/, ""));
                        toast.success("Fotoğraf başarıyla yüklendi!", { id: toastId });
                      } else {
                        toast.error(json.error || "Yüklenemedi", { id: toastId });
                      }
                    } catch {
                      toast.error("Bağlantı hatası", { id: toastId });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="hidden"
                />
              </label>

              {selectedUrl && (
                <div className="p-3 bg-white/5 rounded-xl border border-gold/20 flex items-center gap-3">
                  <img
                    src={selectedUrl}
                    alt="Seçilen Görsel"
                    className="w-20 h-14 object-cover rounded-lg border border-gold/30"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-gold font-semibold block">Seçili Görsel</span>
                    <span className="text-xs text-cream/70 truncate block">{selectedUrl}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "library" && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((img) => {
                  const isChosen = selectedUrl === img.url;
                  return (
                    <div
                      key={img.id}
                      onClick={() => {
                        setSelectedUrl(img.url);
                        if (!altText) setAltText(img.title || "Elmira Davet");
                      }}
                      className={`group relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        isChosen
                          ? "border-gold ring-2 ring-gold/40 shadow-lg scale-[1.02]"
                          : "border-white/10 hover:border-gold/50"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.title || ""}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                        <span className="text-[11px] text-cream font-medium truncate">
                          {img.title}
                        </span>
                      </div>
                      {isChosen && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gold text-charcoal-900 flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alt text and Focal Point inputs (Mandatory for SEO & Accessibility PG-E-11, PG-O-07) */}
          {selectedUrl && (
            <div className="pt-3 border-t border-gold/15 space-y-3 bg-black/20 p-3 rounded-xl">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-cream/90 flex items-center gap-1.5">
                    <span>Görsel Alt Metni (SEO & Erişilebilirlik)</span>
                    <span className="text-gold font-normal text-[11px]">*Zorunlu</span>
                  </label>
                  {!altText.trim() && (
                    <span className="text-[10px] text-amber-300 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Alt metin eksik!
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Görseli tanımlayan açıklama (örn: Düğün masası şamdan detayları)"
                  className="w-full px-3 py-2 bg-charcoal-800 border border-gold/25 rounded-xl text-cream text-xs focus:border-gold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-cream/80 mb-1">
                    Odak Noktası (Focal Point)
                  </label>
                  <select
                    value={focalPoint}
                    onChange={(e) => setFocalPoint(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-charcoal-800 border border-gold/25 rounded-lg text-cream text-xs focus:border-gold outline-none"
                  >
                    <option value="center">Merkez (Orta)</option>
                    <option value="top">Üst Kısım</option>
                    <option value="bottom">Alt Kısım</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-3 border-t border-gold/15 bg-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-cream/70 hover:text-cream rounded-xl transition-colors"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedUrl}
            className="px-5 py-2 text-xs font-semibold bg-gold text-charcoal-900 rounded-xl hover:bg-gold-light disabled:opacity-50 transition-colors shadow-sm"
          >
            Seçimi Uygula
          </button>
        </div>
      </div>
    </div>
  );
}
