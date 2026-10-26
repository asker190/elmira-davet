"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  Images,
  Plus,
  Trash2,
  FolderPlus,
  Crop,
  MoveUp,
  MoveDown,
  Sparkles,
  Check,
  X,
  ExternalLink,
  Layers,
  UploadCloud,
  Eye,
} from "lucide-react";
import { addGalleryImage, deleteGalleryImage, createGalleryCategory } from "../actions";

interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
}

interface GalleryImageItem {
  id: string;
  imageUrl: string;
  alt: string;
  title?: string | null;
  categoryId: string;
  category?: { name: string; slug: string };
  aspectRatio?: string;
}

interface GalleryClientProps {
  initialCategories: GalleryCategory[];
  initialImages: GalleryImageItem[];
}

const ASPECT_RATIOS = [
  { label: "16:9 Yatay / Sinematik", value: "16/9", class: "aspect-video" },
  { label: "1:1 Kare / Instagram", value: "1/1", class: "aspect-square" },
  { label: "4:3 Klasik Fotoğraf", value: "4/3", class: "aspect-4/3" },
  { label: "9:16 Dikey / Hikaye", value: "9/16", class: "aspect-[9/16]" },
];

export function GalleryClient({
  initialCategories,
  initialImages,
}: GalleryClientProps) {
  const [categories, setCategories] = useState<GalleryCategory[]>(initialCategories);
  const [images, setImages] = useState<GalleryImageItem[]>(initialImages);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  // Multi-upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [bulkUrls, setBulkUrls] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    categories[0]?.id || "cat-1"
  );
  const [selectedRatio, setSelectedRatio] = useState("16/9");
  const [commonTitle, setCommonTitle] = useState("");
  const [commonAlt, setCommonAlt] = useState("");

  // New Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // Preview / Lightbox Modal
  const [previewImage, setPreviewImage] = useState<GalleryImageItem | null>(null);

  // Filtered Images
  const filteredImages = images.filter((img) =>
    activeCategory === "ALL" ? true : img.categoryId === activeCategory
  );

  // Handle Multi / Bulk Upload
  const handleBulkUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const urls = bulkUrls
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http"));

    if (urls.length === 0) {
      toast.error("Lütfen en az bir geçerli görsel URL adresi girin");
      return;
    }

    startTransition(async () => {
      let successCount = 0;
      const newItems: GalleryImageItem[] = [];

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const res = await addGalleryImage({
          imageUrl: url,
          categoryId: selectedCategory,
          title: commonTitle
            ? `${commonTitle} (${i + 1})`
            : "Elmira Davet Galeri",
          alt: commonAlt || "Elmira Davet Salonu Görseli",
          aspectRatio: selectedRatio,
        });

        if (res.success) {
          successCount++;
          const cat = categories.find((c) => c.id === selectedCategory);
          newItems.push({
            id: "img_" + Date.now() + "_" + i,
            imageUrl: url,
            title: commonTitle ? `${commonTitle} (${i + 1})` : "Elmira Davet Galeri",
            alt: commonAlt || "Elmira Davet Salonu Görseli",
            categoryId: selectedCategory,
            category: cat ? { name: cat.name, slug: cat.slug } : undefined,
            aspectRatio: selectedRatio,
          });
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} adet fotoğraf galeriye eklendi`);
        setImages((prev) => [...newItems, ...prev]);
        setIsUploadModalOpen(false);
        setBulkUrls("");
        setCommonTitle("");
        setCommonAlt("");
      } else {
        toast.error("Görseller kaydedilemedi");
      }
    });
  };

  // Handle Delete Image
  const handleDelete = (id: string) => {
    if (!confirm("Bu fotoğrafı silmek istediğinize emin misiniz?")) return;

    startTransition(async () => {
      try {
        const res = await deleteGalleryImage(id);
        if (res.success) {
          toast.success("Fotoğraf silindi");
          setImages((prev) => prev.filter((img) => img.id !== id));
        } else {
          toast.error("Silinemedi");
        }
      } catch {
        toast.error("Hata oluştu");
      }
    });
  };

  // Reorder Images
  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setImages(copy);
    toast.success("Görsel sıralaması güncellendi");
  };

  // Add Category Handler
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    startTransition(async () => {
      try {
        const slug = newCatName
          .toLowerCase()
          .replace(/ğ/g, "g")
          .replace(/ü/g, "u")
          .replace(/ş/g, "s")
          .replace(/ı/g, "i")
          .replace(/ö/g, "o")
          .replace(/ç/g, "c")
          .replace(/[^a-z0-9]/g, "-");

        await createGalleryCategory(newCatName, slug);
        toast.success(`"${newCatName}" kategorisi eklendi`);
        setCategories((prev) => [
          ...prev,
          { id: "cat_" + Date.now(), name: newCatName, slug },
        ]);
        setNewCatName("");
        setIsCategoryModalOpen(false);
      } catch {
        toast.error("Kategori eklenemedi");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === "ALL"
                ? "bg-gold text-bg-primary font-semibold shadow-xs"
                : "bg-bg-secondary text-text-muted hover:text-text-primary"
            }`}
          >
            Tüm Fotoğraflar ({images.length})
          </button>
          {categories.map((cat) => {
            const count = images.filter((img) => img.categoryId === cat.id).length;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-gold text-bg-primary font-semibold shadow-xs"
                    : "bg-bg-secondary text-text-muted hover:text-text-primary"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-bg-secondary border border-border text-xs text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-gold" />
            Yeni Kategori
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-gold text-bg-primary font-semibold text-xs flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-opacity"
          >
            <UploadCloud className="w-4 h-4" />
            Çoklu Yükle & Kırp
          </button>
        </div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {filteredImages.map((img, index) => {
          const ratioClass =
            img.aspectRatio === "1/1"
              ? "aspect-square"
              : img.aspectRatio === "9/16"
              ? "aspect-[9/16]"
              : img.aspectRatio === "4/3"
              ? "aspect-4/3"
              : "aspect-video";

          return (
            <div
              key={img.id}
              className="group relative rounded-xl overflow-hidden bg-surface border border-border flex flex-col justify-between shadow-xs hover:border-gold/50 transition-all"
            >
              {/* Image Thumbnail */}
              <div
                className={`relative w-full ${ratioClass} bg-bg-secondary cursor-pointer overflow-hidden`}
                onClick={() => setPreviewImage(img)}
              >
                <Image
                  src={img.imageUrl}
                  alt={img.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                  <span className="self-start text-[10px] px-2 py-0.5 rounded bg-black/60 text-gold font-mono backdrop-blur-xs">
                    {img.aspectRatio || "16:9"}
                  </span>
                  <div className="flex items-center justify-center">
                    <span className="p-2 rounded-full bg-black/60 text-white backdrop-blur-xs">
                      <Eye className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Caption & Reorder Controls */}
              <div className="p-2.5 bg-surface border-t border-border flex items-center justify-between gap-1 text-xs">
                <div className="min-w-0">
                  <p className="font-medium text-cream truncate text-[11px]">
                    {img.title || img.alt}
                  </p>
                  <p className="text-[10px] text-text-muted truncate">
                    {img.category?.name || "Kategori"}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    className="p-1 rounded text-text-muted hover:text-gold hover:bg-bg-secondary disabled:opacity-20"
                    title="Öne Al"
                  >
                    <MoveUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleMove(index, "down")}
                    disabled={index === filteredImages.length - 1}
                    className="p-1 rounded text-text-muted hover:text-gold hover:bg-bg-secondary disabled:opacity-20"
                    title="Arkaya Al"
                  >
                    <MoveDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="p-1 rounded text-text-muted hover:text-error hover:bg-error/10"
                    title="Sil"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredImages.length === 0 && (
          <div className="col-span-full py-16 text-center text-text-muted bg-surface rounded-2xl border border-border">
            <Images className="w-8 h-8 text-gold mx-auto mb-2 opacity-50" />
            <p className="text-sm">Bu kategoride henüz fotoğraf bulunmuyor.</p>
            <p className="text-xs text-text-muted mt-1">
              "Çoklu Yükle & Kırp" butonuna basarak yeni fotoğraflar ekleyebilirsiniz.
            </p>
          </div>
        )}
      </div>

      {/* MULTI UPLOAD & CROPPING MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-surface border border-border rounded-2xl shadow-xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-heading text-cream">Çoklu Fotoğraf Yükle & Kırp</h3>
                <p className="text-xs text-text-muted">
                  Tek seferde birden fazla görsel URL'si ekleyin, kategori ve kırpma oranını belirleyin
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Görsel URL Adresleri (Her satıra bir adet URL) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={bulkUrls}
                  onChange={(e) => setBulkUrls(e.target.value)}
                  placeholder={`https://images.unsplash.com/photo-1519741497674...\nhttps://images.unsplash.com/photo-1464366400600...\nhttps://images.unsplash.com/photo-1511795409834...`}
                  className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Kategori Seçimi *
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Kırpma / En Boy Oranı (Aspect Ratio)
                  </label>
                  <select
                    value={selectedRatio}
                    onChange={(e) => setSelectedRatio(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                  >
                    {ASPECT_RATIOS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Görsel Başlığı (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={commonTitle}
                    onChange={(e) => setCommonTitle(e.target.value)}
                    placeholder="Örn: Kristal Salon Gece Atmosferi"
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    SEO Alt Metni (Açıklama)
                  </label>
                  <input
                    type="text"
                    value={commonAlt}
                    onChange={(e) => setCommonAlt(e.target.value)}
                    placeholder="Elmira Davet Gaziosmanpaşa düğün mekanı"
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                  />
                </div>
              </div>

              {/* Aspect Ratio Visual Crop Preview Box */}
              <div className="p-3 rounded-xl bg-bg-secondary border border-border">
                <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                  <Crop className="w-3.5 h-3.5 text-gold" />
                  <span>Kırpma Önizleme Formatı:</span>
                  <span className="text-gold font-mono font-semibold">{selectedRatio}</span>
                </div>
                <div className="w-full flex items-center justify-center p-2 bg-surface/50 rounded-lg">
                  <div
                    className={`max-w-xs w-full bg-gold/10 border-2 border-dashed border-gold/60 rounded flex items-center justify-center text-[11px] text-gold font-mono p-4 ${
                      selectedRatio === "1/1"
                        ? "aspect-square"
                        : selectedRatio === "9/16"
                        ? "aspect-[9/16] max-w-[120px]"
                        : selectedRatio === "4/3"
                        ? "aspect-4/3"
                        : "aspect-video"
                    }`}
                  >
                    Oran: {selectedRatio}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary rounded-xl"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-semibold bg-gradient-gold text-bg-primary rounded-xl shadow-xs hover:opacity-95 disabled:opacity-50"
                >
                  {isPending ? "Yükleniyor..." : "Görselleri Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-surface border border-border rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h3 className="text-base font-heading text-cream">Yeni Galeri Kategorisi</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Örn: Sünnet & Doğum Günü"
                  className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isPending || !newCatName.trim()}
                  className="px-4 py-1.5 text-xs font-semibold bg-gradient-gold text-bg-primary rounded-xl disabled:opacity-50"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX / FULL PREVIEW MODAL */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl space-y-4 p-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div>
                <h4 className="text-sm font-heading text-cream">
                  {previewImage.title || previewImage.alt}
                </h4>
                <p className="text-xs text-text-muted">{previewImage.category?.name}</p>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="relative w-full h-[60vh] bg-black/50 rounded-xl overflow-hidden">
              <Image
                src={previewImage.imageUrl}
                alt={previewImage.alt}
                fill
                className="object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border">
              <span>SEO Alt Metni: {previewImage.alt}</span>
              <a
                href={previewImage.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-gold hover:underline flex items-center gap-1"
              >
                Tam Boyutta Aç <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
