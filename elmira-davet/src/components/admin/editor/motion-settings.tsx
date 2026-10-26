"use client";

import React from "react";
import type { BlockNode, BlockMotionConfig } from "@/lib/cms/types";
import { Play, Sparkles, AlertCircle } from "lucide-react";

interface MotionSettingsProps {
  block: BlockNode;
  onChange: (motion: BlockMotionConfig) => void;
  onPreviewPlay: () => void;
  totalParallaxCount: number;
}

export function MotionSettings({
  block,
  onChange,
  onPreviewPlay,
  totalParallaxCount,
}: MotionSettingsProps) {
  const motion: BlockMotionConfig = block.motion || {
    animation: "none",
    duration: 0.8,
    delay: 0.1,
    trigger: "viewport",
    once: true,
  };

  const update = (partial: Partial<BlockMotionConfig>) => {
    onChange({
      ...motion,
      ...partial,
    });
  };

  const isParallaxSupported = block.type === "hero" || block.type === "image";

  return (
    <div className="space-y-5 text-xs text-cream/90">
      {/* Play Preview Button */}
      <div className="flex items-center justify-between pb-3 border-b border-gold/15">
        <div className="flex items-center gap-2 font-medium text-gold">
          <Sparkles className="w-4 h-4" />
          <span>Giriş & Scroll Efektleri</span>
        </div>
        <button
          type="button"
          onClick={onPreviewPlay}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-gold/15 text-gold hover:bg-gold/25 transition-colors border border-gold/30"
          title="Animasyonu tuvalde canlı test et"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Oynat</span>
        </button>
      </div>

      {/* Animation Preset */}
      <div>
        <label className="block mb-1.5 font-medium text-cream/80">Animasyon Türü</label>
        <select
          value={motion.animation}
          onChange={(e) => update({ animation: e.target.value as any })}
          className="w-full px-2.5 py-1.5 bg-black/40 border border-gold/20 rounded text-cream focus:border-gold outline-none"
        >
          <option value="none">Yok (Doğrudan Göster)</option>
          <option value="fade">Yavaşça Belirme (Fade In)</option>
          <option value="slide-up">Aşağıdan Yukarı Kayma (Slide Up)</option>
          <option value="slide-left">Soldan Sağa Kayma (Slide Left)</option>
          <option value="slide-right">Sağdan Sola Kayma (Slide Right)</option>
          <option value="zoom">Büyüyerek Belirme (Zoom In)</option>
          <option value="mask">Açılan Maske (Mask Reveal)</option>
          <option value="text-reveal">Satır Satır Metin Belirmesi (Text Reveal)</option>
        </select>
      </div>

      {motion.animation !== "none" && (
        <>
          {/* Duration Slider (0.2s - 2.0s) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-cream/80">Süre (Duration)</span>
              <span className="text-gold font-mono">{motion.duration.toFixed(1)} sn</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.1"
              value={motion.duration}
              onChange={(e) => update({ duration: parseFloat(e.target.value) })}
              className="w-full accent-gold cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-cream/40 mt-0.5">
              <span>0.2s (Çok Hızlı)</span>
              <span>2.0s (Ağır & Şık)</span>
            </div>
          </div>

          {/* Delay Slider (0.0s - 2.0s) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-cream/80">Gecikme (Delay)</span>
              <span className="text-gold font-mono">{motion.delay.toFixed(1)} sn</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.1"
              value={motion.delay}
              onChange={(e) => update({ delay: parseFloat(e.target.value) })}
              className="w-full accent-gold cursor-pointer"
            />
          </div>

          {/* Trigger & Repeat */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block mb-1.5 font-medium text-cream/80">Tetikleyici</label>
              <select
                value={motion.trigger}
                onChange={(e) => update({ trigger: e.target.value as any })}
                className="w-full px-2 py-1.5 bg-black/40 border border-gold/20 rounded text-cream focus:border-gold outline-none"
              >
                <option value="viewport">Ekrana Gelince (Scroll)</option>
                <option value="load">Sayfa Açılınca (Load)</option>
              </select>
            </div>
            <div>
              <label className="block mb-1.5 font-medium text-cream/80">Tekrarlama</label>
              <select
                value={motion.once ? "true" : "false"}
                onChange={(e) => update({ once: e.target.value === "true" })}
                className="w-full px-2 py-1.5 bg-black/40 border border-gold/20 rounded text-cream focus:border-gold outline-none"
              >
                <option value="true">Sadece 1 Kez</option>
                <option value="false">Her Ekrana Gelişte</option>
              </select>
            </div>
          </div>

          {/* Stagger (for lists / grids) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-cream/80">Kademeli Geçiş (Stagger)</span>
              <span className="text-gold font-mono">{(motion.stagger || 0).toFixed(2)} sn</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={motion.stagger || 0}
              onChange={(e) => update({ stagger: parseFloat(e.target.value) })}
              className="w-full accent-gold cursor-pointer"
            />
            <p className="text-[10px] text-cream/40 mt-0.5">Alt elemanların birbirini kaç saniye arayla izleyeceği.</p>
          </div>
        </>
      )}

      {/* Parallax Speed (Hero & Image only - H-03) */}
      {isParallaxSupported && (
        <div className="pt-3 border-t border-gold/15">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-cream/80">Parallax Kaydırma Hızı</span>
            <span className="text-gold font-mono">{(motion.parallaxSpeed || 0).toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.8"
            step="0.05"
            value={motion.parallaxSpeed || 0}
            onChange={(e) => update({ parallaxSpeed: parseFloat(e.target.value) })}
            className="w-full accent-gold cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-cream/40 mt-0.5">
            <span>0.0 (Sabit)</span>
            <span>0.8 (Derinlikli)</span>
          </div>

          {/* Performance warning if > 6 parallax blocks in page (H-04) */}
          {totalParallaxCount > 6 && (
            <div className="mt-2.5 p-2 bg-amber-500/10 border border-amber-500/30 rounded flex items-start gap-2 text-amber-300 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Sayfada 6'dan fazla parallax efekti var. Mobilde performans düşüşü yaşanabilir.</span>
            </div>
          )}
        </div>
      )}

      {/* Accessibility Note (H-05) */}
      <div className="p-2.5 rounded bg-white/5 border border-white/10 text-[10px] text-cream/60">
        <span className="font-semibold text-cream/80">Erişilebilirlik Koruması:</span> Kullanıcının cihazında "Hareketi Azalt" (prefers-reduced-motion) açıksa tüm animasyonlar otomatik olarak devre dışı bırakılır.
      </div>
    </div>
  );
}
