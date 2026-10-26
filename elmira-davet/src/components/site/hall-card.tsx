"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users, Check } from "lucide-react";
import { ScrollZoom } from "@/components/animations/scroll-zoom";

export interface HallData {
  id: string;
  name: string;
  slug: string;
  capacity: string;
  area: string;
  tagline: string;
  description: string;
  imageUrl: string;
  features: string[];
}

interface HallCardProps {
  hall: HallData;
}

export function HallCard({ hall }: HallCardProps) {
  return (
    <article className="group relative rounded-3xl overflow-hidden bg-surface border border-border transition-all duration-500 hover:border-gold/50 shadow-card flex flex-col justify-between">
      {/* Image Container with Scroll-Linked Zoom & Hover expansion */}
      <div className="relative h-72 sm:h-80 w-full overflow-hidden">
        <ScrollZoom scaleRange={[1, 1.08]} wrapperClassName="h-full w-full">
          <div className="relative h-72 sm:h-80 w-full">
            <Image
              src={hall.imageUrl}
              alt={`${hall.name} - Elmira Davet Salonu`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
        </ScrollZoom>
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/30 pointer-events-none" />

        {/* Capacity Floating Tag */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-gold border border-gold/30 text-xs font-medium">
          <Users className="w-3.5 h-3.5 text-gold" />
          <span>{hall.capacity}</span>
        </div>

        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-cream text-[11px] font-sans">
          {hall.area}
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6 sm:p-8 space-y-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-widest text-gold font-medium block">
            {hall.tagline}
          </span>
          <h3 className="text-2xl sm:text-3xl font-heading text-cream group-hover:text-gold transition-colors">
            {hall.name}
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed pt-1 font-sans">
            {hall.description}
          </p>
        </div>

        {/* Features list */}
        <div className="pt-4 border-t border-border">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {hall.features.map((feat, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-xs text-text-secondary"
              >
                <Check className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-border flex items-center justify-between">
          <Link
            href={`/salonlar/${hall.slug}`}
            className="text-xs uppercase tracking-wider text-cream group-hover:text-gold transition-colors font-semibold flex items-center gap-1.5"
            aria-label={`${hall.name} detaylarını inceleyin`}
          >
            <span>Salonu İnceleyin</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="#randevu"
            className="px-4 py-2 rounded-full bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 text-xs font-medium transition-colors"
            aria-label={`${hall.name} için randevu alın`}
          >
            Randevu Al
          </Link>
        </div>
      </div>
    </article>
  );
}
