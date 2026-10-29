"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { ImageCropUpload } from "@/components/admin/ui/image-crop-upload";
import { createBlogPost } from "../actions";
import { slugify } from "@/lib/utils";
import toast from "react-hot-toast";

export function BlogCreateForm() {
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const title = formData.get("title") as string;
      const slug = (formData.get("slug") as string) || slugify(title);
      const excerpt = (formData.get("excerpt") as string) || undefined;
      const content = formData.get("content") as string;
      const status = (formData.get("status") as "DRAFT" | "PUBLISHED") || "DRAFT";

      await createBlogPost({
        title,
        slug,
        excerpt,
        content,
        coverImageUrl: coverImageUrl || undefined,
        status,
      });

      toast.success("Blog yazısı başarıyla kaydedildi");
      form.reset();
      setCoverImageUrl("");
    } catch (err) {
      toast.error("Blog yazısı kaydedilirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-bg-secondary border border-border space-y-4">
      <h3 className="text-lg font-heading text-text-primary flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-gold" />
        <span>Yeni Blog Yazısı Ekle</span>
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              Yazı Başlığı *
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="Örn: 2026 Yılının En Popüler Düğün Konseptleri"
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              Yayın Durumu
            </label>
            <select
              name="status"
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            >
              <option value="PUBLISHED">Doğrudan Yayınla</option>
              <option value="DRAFT">Taslak Olarak Kaydet</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              URL Slug (Boş bırakılırsa otomatik oluşur)
            </label>
            <input
              type="text"
              name="slug"
              placeholder="2026-dugun-konseptleri"
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            />
          </div>

          {/* Cover Image Upload from Computer with Interactive Cropper */}
          <div className="col-span-full">
            <ImageCropUpload
              label="Kapak Görseli (Bilgisayardan Yükle / Kırp)"
              description="Bilgisayarınızdan görsel seçin veya mevcut galeriden belirleyin. 16:9 formatında kırpılarak otomatik galeri arşivine kaydedilecektir."
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              aspectRatio="16/9"
              category="Blog"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
            Kısa Özet (Listede ve arama sonuçlarında gösterilir)
          </label>
          <textarea
            name="excerpt"
            rows={2}
            placeholder="Yazının 1-2 cümlelik kısa özeti..."
            className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
            Yazı İçeriği (HTML / Paragraflar) *
          </label>
          <textarea
            name="content"
            required
            rows={6}
            placeholder="<h2>Alt Başlık</h2><p>Yazı paragrafları buraya...</p>"
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
            <span>{loading ? "Kaydediliyor..." : "Yazıyı Kaydet"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
