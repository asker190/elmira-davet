"use client";

import React, { useState, useEffect, useRef } from "react";
import type { BlockType } from "@/lib/cms/types";
import {
  BLOCK_CATEGORIES,
  BLOCK_REGISTRY,
  searchBlockRegistry,
} from "@/lib/cms/registry";
import {
  X,
  Search,
  LayoutTemplate,
  Heading,
  FileText,
  Image as ImageIcon,
  Images,
  Building2,
  PackageCheck,
  Clock,
  Quote,
  HelpCircle,
  CalendarCheck,
  MapPin,
  Columns,
  MousePointerClick,
  Video,
  Minus,
  BookmarkCheck,
  Code,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutTemplate,
  Heading,
  FileText,
  Image: ImageIcon,
  Images,
  Building2,
  PackageCheck,
  Clock,
  Quote,
  HelpCircle,
  CalendarCheck,
  MapPin,
  Columns,
  MousePointerClick,
  Video,
  Minus,
  BookmarkCheck,
  Code,
};

interface BlockInserterProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (type: BlockType) => void;
  isAdmin?: boolean;
}

export function BlockInserter({
  isOpen,
  onClose,
  onSelectBlock,
  isAdmin = true,
}: BlockInserterProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setActiveCategory("all");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredBlocks = searchBlockRegistry(search, activeCategory, isAdmin);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-charcoal-900 border border-gold/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gold/15 bg-white/5">
          <div className="flex items-center gap-2">
            <span className="text-gold font-semibold text-sm">Blok Ekle</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/25">
              17 Blok
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-cream/50 hover:text-cream hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-gold/15 space-y-3 bg-black/20">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gold/60" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Blok ara... (örn: hero, salon, sss, galeri, buton)"
              className="w-full pl-9 pr-4 py-2 bg-charcoal-800 border border-gold/25 rounded-xl text-cream text-sm placeholder-cream/40 focus:border-gold outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {BLOCK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? "bg-gold text-charcoal-900 font-semibold shadow-sm"
                    : "bg-white/5 text-cream/70 hover:bg-white/10 hover:text-cream"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Blocks Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredBlocks.map((block) => {
            const Icon = ICON_MAP[block.icon] || FileText;
            return (
              <button
                key={block.type}
                type="button"
                onClick={() => {
                  onSelectBlock(block.type);
                  onClose();
                }}
                className="flex items-start gap-3 p-3 text-left rounded-xl bg-charcoal-800/80 hover:bg-gold/10 border border-gold/15 hover:border-gold/50 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-gold/15 text-gold flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-gold group-hover:text-charcoal-900 transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-cream group-hover:text-gold transition-colors">
                      {block.name}
                    </span>
                    {block.adminOnly && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-cream/60 line-clamp-2 mt-0.5 leading-snug">
                    {block.description}
                  </p>
                </div>
              </button>
            );
          })}

          {filteredBlocks.length === 0 && (
            <div className="col-span-full py-12 text-center text-cream/50 text-xs">
              "{search}" aramasına uygun blok bulunamadı.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
