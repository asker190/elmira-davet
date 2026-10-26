"use client";

import { useState } from "react";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { X, ZoomIn, Sparkles } from "lucide-react";

export interface GalleryImageItem {
  id: string;
  imageUrl: string;
  alt: string;
  title?: string | null;
  categoryId: string;
  category: {
    name: string;
    slug: string;
  };
}

interface MasonryGalleryProps {
  categories: { id: string; name: string; slug: string }[];
  images: GalleryImageItem[];
}

export function MasonryGallery({ categories, images }: MasonryGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<GalleryImageItem | null>(null);

  const filteredImages =
    selectedCategory === "all"
      ? images
      : images.filter((img) => img.categoryId === selectedCategory);

  return (
    <div className="space-y-10">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
            selectedCategory === "all"
              ? "bg-gradient-gold text-bg-primary shadow-gold"
              : "bg-surface hover:bg-surface-hover text-text-secondary border border-border"
          }`}
        >
          Tüm Fotoğraflar ({images.length})
        </button>

        {categories.map((cat) => {
          const count = images.filter((img) => img.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-gradient-gold text-bg-primary shadow-gold"
                  : "bg-surface hover:bg-surface-hover text-text-secondary border border-border"
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Masonry Columns Layout */}
      {filteredImages.length === 0 ? (
        <div className="py-20 text-center text-text-muted text-sm bg-surface rounded-3xl border border-border">
          Bu kategoride henüz fotoğraf bulunmuyor.
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredImages.map((img, index) => {
            // Asymmetric aspect ratio for masonry look
            const isTall = index % 3 === 0;

            return (
              <m.div
                key={img.id}
                layoutId={`gallery-card-${img.id}`}
                onClick={() => setSelectedImage(img)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`group relative rounded-3xl overflow-hidden bg-surface border border-border hover:border-gold/50 cursor-pointer shadow-card break-inside-avoid ${
                  isTall ? "h-96" : "h-72"
                }`}
              >
                <Image
                  src={img.imageUrl}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />

                {/* Dark Hover Reveal Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-between">
                  <span className="self-start text-[11px] px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-gold border border-gold/30">
                    {img.category.name}
                  </span>

                  <div className="flex items-end justify-between">
                    <div>
                      <h4 className="text-white text-base font-heading font-medium">
                        {img.title || img.alt}
                      </h4>
                      <p className="text-[11px] text-gold mt-1 flex items-center gap-1 font-sans">
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>Büyütmek için dokunun</span>
                      </p>
                    </div>
                  </div>
                </div>
              </m.div>
            );
          })}
        </div>
      )}

      {/* Shared Layout Transition Fullscreen Modal */}
      <AnimatePresence>
        {selectedImage && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <m.div
              layoutId={`gallery-card-${selectedImage.id}`}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[85vh] rounded-3xl overflow-hidden bg-surface border border-gold/40 shadow-elevated flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedImage(null)}
                aria-label="Kapat"
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/70 hover:bg-black text-white hover:text-gold border border-white/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Large Image */}
              <div className="relative w-full h-[60vh] sm:h-[70vh] bg-black">
                <Image
                  src={selectedImage.imageUrl}
                  alt={selectedImage.alt}
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              {/* Modal Footer Info */}
              <div className="p-6 bg-bg-secondary border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-gold uppercase tracking-wider block">
                    {selectedImage.category.name}
                  </span>
                  <h3 className="text-lg font-heading text-cream mt-0.5">
                    {selectedImage.title || selectedImage.alt}
                  </h3>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span>Elmira Davet Gaziosmanpaşa</span>
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
