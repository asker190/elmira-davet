import { prisma } from "@/lib/prisma";
import {
  createHeroSlide,
  deleteHeroSlide,
  toggleHeroSlide,
} from "../actions";
import { PlusCircle, Trash2, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const slides = await prisma.heroSlide.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading text-text-primary">
          Hero Slider Yönetimi
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Ana sayfanın en üstünde gösterilen tam ekran görsel ve metin slaytlarını buradan düzenleyebilirsiniz.
        </p>
      </div>

      {/* Add New Slide Form */}
      <div className="p-6 rounded-2xl bg-bg-secondary border border-border space-y-4">
        <h3 className="text-lg font-heading text-text-primary flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-gold" />
          <span>Yeni Slayt Ekle</span>
        </h3>

        <form
          action={async (formData: FormData) => {
            "use server";
            await createHeroSlide({
              title: formData.get("title") as string,
              subtitle: (formData.get("subtitle") as string) || undefined,
              imageUrl: formData.get("imageUrl") as string,
              buttonText: (formData.get("buttonText") as string) || undefined,
              buttonLink: (formData.get("buttonLink") as string) || undefined,
              sortOrder: Number(formData.get("sortOrder")) || 0,
            });
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2"
        >
          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              Ana Başlık *
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="Örn: Hayalinizdeki Düğün"
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              Alt Başlık / Slogan
            </label>
            <input
              type="text"
              name="subtitle"
              placeholder="Örn: Elmira Davet ile Gerçek Olsun"
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              Görsel URL *
            </label>
            <input
              type="url"
              name="imageUrl"
              required
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              Buton Metni
            </label>
            <input
              type="text"
              name="buttonText"
              placeholder="Örn: Paketleri İncele"
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              Buton Linki
            </label>
            <input
              type="text"
              name="buttonLink"
              placeholder="/paketler veya /iletisim"
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1 font-medium">
              Sıralama (0, 1, 2...)
            </label>
            <input
              type="number"
              name="sortOrder"
              defaultValue={slides.length}
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:border-gold outline-none"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-gold text-bg-primary font-semibold text-sm hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Slaytı Kaydet</span>
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
                className="rounded-2xl bg-bg-secondary border border-border overflow-hidden flex flex-col justify-between group hover:border-gold/30 transition-colors"
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
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-heading text-text-primary text-base">
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
                  <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                    <form
                      action={async () => {
                        "use server";
                        await toggleHeroSlide(slide.id, !slide.isActive);
                      }}
                    >
                      <button
                        type="submit"
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
                    </form>

                    <form
                      action={async () => {
                        "use server";
                        await deleteHeroSlide(slide.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                        title="Slaytı Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
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
