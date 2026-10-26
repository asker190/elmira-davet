"use client";

import React from "react";
import { X, Keyboard } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ["Ctrl / ⌘", "S"], desc: "Taslağı veya Yayını Kaydet" },
    { keys: ["Ctrl / ⌘", "Z"], desc: "Son Değişikliği Geri Al (Undo)" },
    { keys: ["Ctrl / ⌘", "Shift", "Z"], desc: "İleri Al (Redo)" },
    { keys: ["/"], desc: "Hızlı Blok Ekleyiciyi Aç" },
    { keys: ["Esc"], desc: "Seçili Bloğu Bırak / Modalleri Kapat" },
    { keys: ["Alt", "↑"], desc: "Seçili Bloğu Bir Üste Taşı" },
    { keys: ["Alt", "↓"], desc: "Seçili Bloğu Bir Alta Taşı" },
    { keys: ["?"], desc: "Bu Kısayol Rehberini Aç" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-charcoal-900 border border-gold/30 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-gold/15 bg-white/5">
          <div className="flex items-center gap-2 text-gold font-semibold text-sm">
            <Keyboard className="w-4 h-4" />
            <span>Klavye Kısayolları</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-cream/50 hover:text-cream hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2.5 max-h-[70vh] overflow-y-auto">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-1.5 border-b border-white/5 text-xs">
              <span className="text-cream/80">{s.desc}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="px-2 py-0.5 rounded bg-black/60 border border-gold/25 text-gold font-mono text-[11px] shadow-inner"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-white/5 border-t border-gold/15 text-center text-[11px] text-cream/50">
          Kısayolları istediğiniz an <strong>?</strong> tuşuna basarak görüntüleyebilirsiniz.
        </div>
      </div>
    </div>
  );
}
