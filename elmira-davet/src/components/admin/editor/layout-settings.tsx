"use client";

import React from "react";
import type { BlockNode, BlockLayoutConfig, BlockVisibilityConfig } from "@/lib/cms/types";
import { Eye, Monitor, Tablet, Smartphone, Hash, Palette } from "lucide-react";

interface LayoutSettingsProps {
  block: BlockNode;
  onLayoutChange: (layout: BlockLayoutConfig) => void;
  onVisibilityChange: (vis: BlockVisibilityConfig) => void;
  onAnchorChange: (anchor: string) => void;
}

export function LayoutSettings({
  block,
  onLayoutChange,
  onVisibilityChange,
  onAnchorChange,
}: LayoutSettingsProps) {
  const layout: BlockLayoutConfig = block.layout || {
    align: "center",
    contentWidth: "normal",
    paddingY: "medium",
  };

  const visibility: BlockVisibilityConfig = block.visibility || {};

  return (
    <div className="space-y-5 text-xs text-cream/90">
      {/* Layout / Alignment */}
      <div>
        <label className="block mb-1.5 font-medium text-cream/80">Metin & İçerik Hizalaması</label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: "left", label: "Sola" },
            { id: "center", label: "Ortala" },
            { id: "right", label: "Sağa" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onLayoutChange({ ...layout, align: item.id as any })}
              className={`py-1.5 text-xs rounded border transition-colors ${
                layout.align === item.id
                  ? "bg-gold text-charcoal-900 border-gold font-semibold"
                  : "bg-black/30 text-cream/70 border-gold/15 hover:border-gold/40"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Width */}
      <div>
        <label className="block mb-1.5 font-medium text-cream/80">İçerik Genişliği</label>
        <select
          value={layout.contentWidth || "normal"}
          onChange={(e) => onLayoutChange({ ...layout, contentWidth: e.target.value as any })}
          className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream focus:border-gold outline-none"
        >
          <option value="narrow">Dar (Max 800px - Okuma & Form)</option>
          <option value="normal">Standart (Max 1200px - Sayfa Düzeni)</option>
          <option value="full">Tam Genişlik (%100 Full Width)</option>
        </select>
      </div>

      {/* Padding Y */}
      <div>
        <label className="block mb-1.5 font-medium text-cream/80">Dikey Boşluk (Padding)</label>
        <select
          value={layout.paddingY || "medium"}
          onChange={(e) => onLayoutChange({ ...layout, paddingY: e.target.value as any })}
          className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream focus:border-gold outline-none"
        >
          <option value="none">Boşluksuz (0px)</option>
          <option value="small">Küçük (32px)</option>
          <option value="medium">Orta (64px)</option>
          <option value="large">Büyük (96px)</option>
          <option value="xlarge">Ekstra Büyük (128px)</option>
        </select>
      </div>

      {/* Background */}
      <div className="pt-3 border-t border-gold/15">
        <div className="flex items-center gap-1.5 font-medium text-gold mb-2">
          <Palette className="w-3.5 h-3.5" />
          <span>Arka Plan</span>
        </div>
        <select
          value={layout.background?.type || "none"}
          onChange={(e) =>
            onLayoutChange({
              ...layout,
              background: {
                type: e.target.value as any,
                value:
                  e.target.value === "color"
                    ? "rgba(255,255,255,0.03)"
                    : e.target.value === "gradient"
                    ? "linear-gradient(135deg, rgba(201,160,80,0.1) 0%, rgba(20,20,25,0.95) 100%)"
                    : "",
              },
            })
          }
          className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream focus:border-gold outline-none mb-2"
        >
          <option value="none">Şeffaf (Varsayılan)</option>
          <option value="color">Düz Renk / Transparan Kutu</option>
          <option value="gradient">Altın Gradyan Efekti</option>
        </select>

        {layout.background?.type && layout.background.type !== "none" && (
          <input
            type="text"
            value={layout.background.value || ""}
            onChange={(e) =>
              onLayoutChange({
                ...layout,
                background: {
                  type: layout.background!.type,
                  value: e.target.value,
                },
              })
            }
            placeholder="Renk veya CSS kodu (örn: rgba(0,0,0,0.5))"
            className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream font-mono text-[11px] focus:border-gold outline-none"
          />
        )}
      </div>

      {/* Visibility Settings */}
      <div className="pt-3 border-t border-gold/15">
        <div className="flex items-center gap-1.5 font-medium text-gold mb-2">
          <Eye className="w-3.5 h-3.5" />
          <span>Cihaz Görünürlüğü</span>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!visibility.hideOnDesktop}
              onChange={(e) => onVisibilityChange({ ...visibility, hideOnDesktop: e.target.checked })}
              className="accent-gold rounded"
            />
            <Monitor className="w-3.5 h-3.5 text-cream/70" />
            <span>Masaüstünde Gizle</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!visibility.hideOnTablet}
              onChange={(e) => onVisibilityChange({ ...visibility, hideOnTablet: e.target.checked })}
              className="accent-gold rounded"
            />
            <Tablet className="w-3.5 h-3.5 text-cream/70" />
            <span>Tablette Gizle</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!visibility.hideOnMobile}
              onChange={(e) => onVisibilityChange({ ...visibility, hideOnMobile: e.target.checked })}
              className="accent-gold rounded"
            />
            <Smartphone className="w-3.5 h-3.5 text-cream/70" />
            <span>Mobilde Gizle</span>
          </label>
        </div>
      </div>

      {/* Anchor ID */}
      <div className="pt-3 border-t border-gold/15">
        <div className="flex items-center gap-1.5 font-medium text-gold mb-1.5">
          <Hash className="w-3.5 h-3.5" />
          <span>Çapa Kimliği (HTML ID)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gold font-mono text-xs">#</span>
          <input
            type="text"
            value={block.anchorId || ""}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
              onAnchorChange(cleaned);
            }}
            placeholder="orn: salonlar-bolumu"
            className="flex-1 px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream font-mono text-[11px] focus:border-gold outline-none"
          />
        </div>
        <p className="text-[10px] text-cream/40 mt-1">
          Menüden veya butondan <code>#{block.anchorId || "bolum"}</code> yazarak bu bloğa doğrudan kaydırma yapabilirsiniz.
        </p>
      </div>
    </div>
  );
}
