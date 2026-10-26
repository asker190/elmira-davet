"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export interface GalleryItem {
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

interface GalleryGridProps {
  categories: { id: string; name: string; slug: string }[];
  images: GalleryItem[];
}

export function GalleryGrid({ categories, images }: GalleryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);

  const filteredImages =
    selectedCategory === "all"
      ? images
      : images.filter((img) => img.categoryId === selectedCategory);

  const slides = filteredImages.map((img) => ({
    src: img.imageUrl,
    alt: img.alt,
    title: img.title || undefined,
  }));

  return (
    <div className="space-y-10">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
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

      {/* Images Grid */}
      {filteredImages.length === 0 ? (
        <div className="py-20 text-center text-text-muted text-sm bg-bg-secondary rounded-3xl border border-border">
          Bu kategoride henüz fotoğraf bulunmuyor.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredImages.map((img, idx) => (
            <div
              key={img.id}
              onClick={() => setLightboxIndex(idx)}
              className="group relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-surface border border-border cursor-pointer shadow-card"
            >
              <Image
                src={img.imageUrl}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Hover Dark Overlay with info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-between">
                <span className="self-start text-[11px] px-2.5 py-1 rounded-full bg-black/60 text-gold border border-gold/30 backdrop-blur-md">
                  {img.category.name}
                </span>

                <div>
                  <h4 className="text-white text-sm font-heading font-medium">
                    {img.title || img.alt}
                  </h4>
                  <p className="text-[11px] text-text-muted mt-1">
                    Büyütmek için tıklayınız
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={slides}
      />
    </div>
  );
}
