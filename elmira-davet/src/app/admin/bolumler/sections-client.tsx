"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import {
  Layers,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Save,
} from "lucide-react";
import { savePageSectionsConfig } from "../actions";
import { ImageCropUpload } from "@/components/admin/ui/image-crop-upload";

export interface PageSectionItem {
  id: string;
  name: string;
  badge: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  isEnabled: boolean;
  order: number;
}

interface SectionsClientProps {
  initialSections: PageSectionItem[];
}

export function SectionsClient({ initialSections }: SectionsClientProps) {
  const [sections, setSections] = useState<PageSectionItem[]>(initialSections);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Move section up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setSections((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy.map((sec, idx) => ({ ...sec, order: idx }));
    });
  };

  // Move section down
  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    setSections((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy.map((sec, idx) => ({ ...sec, order: idx }));
    });
  };

  // Toggle enabled/disabled
  const handleToggle = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isEnabled: !s.isEnabled } : s))
    );
  };

  // Save full configuration
  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await savePageSectionsConfig(sections);
        if (res.success) {
          toast.success("Bölüm sıralaması ve ayarları başarıyla kaydedildi");
          setEditingId(null);
        } else {
          toast.error("Kaydetme işlemi başarısız oldu");
        }
      } catch {
        toast.error("Bağlantı hatası oluştu");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-heading text-cream">
            Ana Sayfa Blok Hiyerarşisi
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Ziyaretçilerin ilk gördüğü blok sırasını ve başlıklarını özelleştirin
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-bg-secondary border border-border text-xs text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ön Yüzde Gör
          </a>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-5 py-2 rounded-xl bg-gradient-gold text-bg-primary font-semibold text-xs flex items-center gap-1.5 shadow-xs hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {isPending ? "Kaydediliyor..." : "Değişiklikleri Yayınla"}
          </button>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((sec, index) => {
          const isEditing = editingId === sec.id;

          return (
            <div
              key={sec.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                sec.isEnabled
                  ? "bg-surface border-border hover:border-gold/40 shadow-xs"
                  : "bg-bg-secondary/40 border-border/50 opacity-60"
              }`}
            >
              <div className="flex items-start sm:items-center justify-between gap-4">
                {/* Left: Reorder arrows + Index + Title */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Arrows */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 rounded text-text-muted hover:text-gold hover:bg-bg-secondary disabled:opacity-20 transition-colors"
                      title="Yukarı Taşı"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === sections.length - 1}
                      className="p-1 rounded text-text-muted hover:text-gold hover:bg-bg-secondary disabled:opacity-20 transition-colors"
                      title="Aşağı Taşı"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Order Index */}
                  <div className="w-7 h-7 rounded-lg bg-bg-secondary border border-border flex items-center justify-center text-xs font-mono font-bold text-gold shrink-0">
                    {index + 1}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                        {sec.badge || sec.id}
                      </span>
                      <span className="text-xs font-heading text-cream truncate font-semibold">
                        {sec.name}
                      </span>
                    </div>

                    {!isEditing ? (
                      <p className="text-xs text-text-muted truncate mt-1">
                        Başlık: <span className="text-text-secondary">"{sec.title}"</span>
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Right Actions: Edit toggle + Visibility Switch */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingId(isEditing ? null : sec.id)}
                    className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                      isEditing
                        ? "bg-gold text-bg-primary font-semibold border-gold"
                        : "bg-bg-secondary border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {isEditing ? "Kapat" : "Metni Düzenle"}
                    </span>
                  </button>

                  <button
                    onClick={() => handleToggle(sec.id)}
                    className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                      sec.isEnabled
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                        : "bg-error/15 text-error border-error/30 hover:bg-error/25"
                    }`}
                    title={sec.isEnabled ? "Bölümü Kapat" : "Bölümü Aç"}
                  >
                    {sec.isEnabled ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Yayında</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Gizli</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Inline Edit Box */}
              {isEditing && (
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-[11px] font-medium text-text-muted mb-1">
                      Bölüm Rozeti (Badge)
                    </label>
                    <input
                      type="text"
                      value={sec.badge}
                      onChange={(e) =>
                        setSections((prev) =>
                          prev.map((s) =>
                            s.id === sec.id ? { ...s, badge: e.target.value } : s
                          )
                        )
                      }
                      className="w-full px-3 py-1.5 bg-bg-secondary border border-border rounded-lg text-xs text-cream focus:outline-hidden focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-text-muted mb-1">
                      Ana Başlık (H2 / H1)
                    </label>
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) =>
                        setSections((prev) =>
                          prev.map((s) =>
                            s.id === sec.id ? { ...s, title: e.target.value } : s
                          )
                        )
                      }
                      className="w-full px-3 py-1.5 bg-bg-secondary border border-border rounded-lg text-xs text-cream focus:outline-hidden focus:border-gold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-text-muted mb-1">
                      Açıklama / Spot Metin
                    </label>
                    <textarea
                      rows={2}
                      value={sec.subtitle}
                      onChange={(e) =>
                        setSections((prev) =>
                          prev.map((s) =>
                            s.id === sec.id
                              ? { ...s, subtitle: e.target.value }
                              : s
                          )
                        )
                      }
                      className="w-full px-3 py-1.5 bg-bg-secondary border border-border rounded-lg text-xs text-cream focus:outline-hidden focus:border-gold resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <ImageCropUpload
                      label="Arka Plan Görseli / İllüstrasyon"
                      description="Bilgisayarınızdan görsel yükleyin veya galeriden seçin."
                      value={sec.imageUrl || ""}
                      onChange={(url) =>
                        setSections((prev) =>
                          prev.map((s) =>
                            s.id === sec.id
                              ? { ...s, imageUrl: url }
                              : s
                          )
                        )
                      }
                      aspectRatio="16/9"
                      category="Bölümler"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
