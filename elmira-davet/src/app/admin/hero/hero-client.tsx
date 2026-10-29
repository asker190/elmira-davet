"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { PlusCircle, Trash2, Eye, EyeOff, Image as ImageIcon, Sparkles, Video, MapPin, Save } from "lucide-react";
import { createHeroSlide, deleteHeroSlide, toggleHeroSlide, saveHeroVideoSettings } from "../actions";
import { ImageCropUpload } from "@/components/admin/ui/image-crop-upload";

interface HeroClientProps {
  initialSlides: any[];
  initialVideoSettings?: {
    location?: string;
    videoUrl?: string;
  };
}

export function HeroClient({ initialSlides, initialVideoSettings }: HeroClientProps) {
  const [slides, setSlides] = useState(initialSlides);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    buttonText: "",
    buttonLink: "",
    sortOrder: slides.length,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) {
      toast.error("Lütfen bilgisayarınızdan bir slayt görseli seçin ve kırpın.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createHeroSlide({
          title: form.title,
          subtitle: form.subtitle || undefined,
          imageUrl: form.imageUrl,
          buttonText: form.buttonText || undefined,
          buttonLink: form.buttonLink || undefined,
          sortOrder: Number(form.sortOrder) || 0,
        });

        if (res.success) {
          toast.success("Hero slaytı başarıyla eklendi!");
          setSlides([
            ...slides,
            {
              id: "slide_" + Date.now(),
              ...form,
              isActive: true,
            },
          ]);
          setForm({
            title: "",
            subtitle: "",
            imageUrl: "",
            buttonText: "",
            buttonLink: "",
            sortOrder: slides.length + 1,
          });
        } else {
          toast.error((res as any)?.error || "Hata oluştu.");
        }
      } catch {
        toast.error("Slayt eklenemedi.");
      }
    });
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleHeroSlide(id, !currentStatus);
      setSlides(slides.map((s) => (s.id === id ? { ...s, isActive: !currentStatus } : s)));
      toast.success("Slayt durumu güncellendi.");
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Bu slaytı silmek istediğinize emin misiniz?")) return;
    startTransition(async () => {
      await deleteHeroSlide(id);
      setSlides(slides.filter((s) => s.id !== id));
      toast.success("Slayt silindi.");
    });
  };

  const [videoSettings, setVideoSettings] = useState({
    location: initialVideoSettings?.location || "İstanbul - Gaziosmanpaşa",
    videoUrl: initialVideoSettings?.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-walking-in-a-forest-41378-large.mp4",
  });
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingVideo(true);
    try {
      const res = await saveHeroVideoSettings(videoSettings);
      if (res.success) {
        toast.success("Hero video ve konum ayarları güncellendi!");
      } else {
        toast.error("Ayarlar kaydedilemedi.");
      }
    } catch {
      toast.error("Bağlantı hatası oluştu.");
    } finally {
      setIsSavingVideo(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Video & Location Settings */}
      <div className="p-6 rounded-2xl bg-bg-secondary border border-border space-y-4 shadow-card">
        <h3 className="text-base font-heading text-text-primary flex items-center gap-2">
          <Video className="w-4 h-4 text-gold" />
          <span>Hero Giriş Sahnesi Video & Konum Ayarları</span>
        </h3>
        <p className="text-xs text-text-muted">
          Ana sayfanın en üstünde arka planda sessiz oynayan sinematik video bağlantısını ve üzerindeki konum rozetini belirleyin.
        </p>

        <form onSubmit={handleSaveVideo} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              <span>Konum Rozeti Metni</span>
            </label>
            <input
              type="text"
              value={videoSettings.location}
              onChange={(e) => setVideoSettings({ ...videoSettings, location: e.target.value })}
              placeholder="Örn: İstanbul - Gaziosmanpaşa"
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-gold" />
              <span>Arka Plan Video URL (MP4 / WebM)</span>
            </label>
            <input
              type="text"
              value={videoSettings.videoUrl}
              onChange={(e) => setVideoSettings({ ...videoSettings, videoUrl: e.target.value })}
              placeholder="https://...mp4"
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none font-mono text-xs"
            />
          </div>

          <div className="md:col-span-2 flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSavingVideo}
              className="px-4 py-2 rounded-xl bg-gold/15 border border-gold/30 text-gold hover:bg-gold/25 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingVideo ? "Kaydediliyor..." : "Video & Konum Ayarlarını Kaydet"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Add New Slide Form */}
      <div className="p-6 rounded-2xl bg-bg-secondary border border-border space-y-4 shadow-card">
        <h3 className="text-lg font-heading text-text-primary flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-gold" />
          <span>Yeni Hero Slaytı Ekle</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
                Ana Başlık *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Örn: Hayalinizdeki Düğün"
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
                Alt Başlık / Slogan
              </label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Örn: Elmira Davet ile Gerçek Olsun"
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>
          </div>

          {/* Computer upload with 16:9 cinematic cropper */}
          <ImageCropUpload
            label="Slayt Arka Plan Fotoğrafı *"
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            aspectRatio="16/9"
            recommendedDimensions="1920x1080 px (16:9 Sinematik)"
            category="Hero Slider"
            helperText="Bilgisayarınızdan yüksek çözünürlüklü fotoğraf yükleyin. 16:9 formatında kırpılarak otomatik galeriye eklenecektir."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
                Buton Metni
              </label>
              <input
                type="text"
                value={form.buttonText}
                onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                placeholder="Örn: Paketleri İncele"
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
                Buton Linki
              </label>
              <input
                type="text"
                value={form.buttonLink}
                onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                placeholder="/paketler veya /iletisim"
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
                Sıralama (0, 1, 2...)
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl bg-gradient-gold text-bg-primary font-semibold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isPending ? "Kaydediliyor..." : "Slaytı Kaydet"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Slides List */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading text-text-primary">
          Mevcut Slaytlar ({slides.length})
        </h3>

        {slides.length === 0 ? (
          <div className="p-8 text-center text-text-muted bg-bg-secondary rounded-2xl border border-border text-sm">
            Henüz eklenmiş bir hero slaytı bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="rounded-2xl bg-bg-secondary border border-border overflow-hidden flex flex-col justify-between group hover:border-gold/30 transition-colors shadow-card"
              >
                {/* Image preview */}
                <div className="relative h-44 w-full bg-surface overflow-hidden">
                  {slide.imageUrl ? (
                    <Image
                      src={slide.imageUrl}
                      alt={slide.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[11px] font-medium bg-black/60 backdrop-blur-md text-gold border border-gold/20">
                    Sıra: {slide.sortOrder}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-heading text-text-primary text-base font-bold">
                      {slide.title}
                    </h4>
                    {slide.subtitle && (
                      <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.buttonText && (
                      <div className="mt-3 inline-block px-2.5 py-1 rounded-md bg-surface text-gold text-xs border border-border">
                        {slide.buttonText} → {slide.buttonLink || "#"}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggle(slide.id, slide.isActive)}
                      className={`text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        slide.isActive
                          ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                          : "bg-surface text-text-muted border-border"
                      }`}
                    >
                      {slide.isActive ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Yayında</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Pasif</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(slide.id)}
                      className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                      title="Slaytı Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
