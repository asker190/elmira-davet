"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { ImageCropUpload } from "@/components/admin/ui/image-crop-upload";
import { createPackage } from "../actions";
import { slugify } from "@/lib/utils";
import toast from "react-hot-toast";

export function PackageCreateForm() {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const name = formData.get("name") as string;
      const slug = (formData.get("slug") as string) || slugify(name);
      const description = formData.get("description") as string;
      const priceRaw = formData.get("price") as string;
      const price = priceRaw ? parseFloat(priceRaw) : null;
      const priceLabel = (formData.get("priceLabel") as string) || null;
      const isFeatured = formData.get("isFeatured") === "on";
      const featuresRaw = formData.get("features") as string;
      const features = featuresRaw
        ? featuresRaw
            .split("\n")
            .map((f) => f.trim())
            .filter(Boolean)
        : [];

      await createPackage({
        name,
        slug,
        description,
        price,
        priceLabel,
        imageUrl: imageUrl || null,
        isFeatured,
        features,
      });

      toast.success("Paket başarıyla oluşturuldu");
      form.reset();
      setImageUrl("");
    } catch (err) {
      toast.error("Paket kaydedilirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-bg-secondary border border-border space-y-4">
      <h3 className="text-lg font-heading text-text-primary flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-gold" />
        <span>Yeni Paket Ekle</span>
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              Paket Adı *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Örn: Platin Düğün Paketi"
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              URL Slug (Boş bırakılırsa otomatik oluşur)
            </label>
            <input
              type="text"
              name="slug"
              placeholder="platin-dugun-paketi"
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              Fiyat (₺ cinsinden rakam)
            </label>
            <input
              type="number"
              name="price"
              placeholder="250000"
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              Fiyat Etiketi / Alt Yazı
            </label>
            <input
              type="text"
              name="priceLabel"
              placeholder="Başlayan fiyatlarla / Kişi başı"
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            />
          </div>

          <div className="md:col-span-2 flex items-center pt-6">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isFeatured"
                className="w-4 h-4 rounded border-border text-gold focus:ring-gold bg-surface"
              />
              <span className="text-sm text-text-secondary">
                Öne Çıkarılan / Popüler Paket (Rozet eklenir)
              </span>
            </label>
          </div>

          {/* Image Upload from Computer with Interactive Cropper */}
          <div className="col-span-full">
            <ImageCropUpload
              label="Paket Tanıtım Görseli (Bilgisayardan Yükle / Kırp)"
              description="Bilgisayarınızdan görsel seçin veya mevcut galeriden belirleyin. 16:9 oranında kırpılarak otomatik galeri arşivine eklenecektir."
              value={imageUrl}
              onChange={setImageUrl}
              aspectRatio="16/9"
              category="Paketler"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
            Paket Açıklaması *
          </label>
          <textarea
            name="description"
            required
            rows={2}
            placeholder="Paketin kısa ve etkileyici tanıtım açıklaması..."
            className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
            Paket Özellikleri (Her satıra bir özellik yazınız)
          </label>
          <textarea
            name="features"
            rows={4}
            placeholder={"500 kişilik salon\nCanlı orkestra\nLüks pasta ikramı\nÜcretsiz vale"}
            className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none font-mono text-xs"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-gold text-bg-primary font-semibold text-sm hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? "Kaydediliyor..." : "Paketi Kaydet"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
