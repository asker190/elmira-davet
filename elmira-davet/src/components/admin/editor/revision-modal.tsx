"use client";

import React, { useState } from "react";
import type { PageRevisionData, BlockNode } from "@/lib/cms/types";
import { X, History, RotateCcw, GitCompare, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  revisions: PageRevisionData[];
  currentBlocks: BlockNode[];
  currentTitle: string;
  onRestore: (revision: PageRevisionData) => void;
}

export function RevisionModal({
  isOpen,
  onClose,
  revisions,
  currentBlocks,
  currentTitle,
  onRestore,
}: RevisionModalProps) {
  const [selectedRevisionId, setSelectedRevisionId] = useState<string>(
    revisions.length > 0 ? revisions[0].id : ""
  );

  if (!isOpen) return null;

  const selectedRev = revisions.find((r) => r.id === selectedRevisionId);

  const formatTrDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("tr-TR", {
        timeZone: "Europe/Istanbul",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "PUBLISH":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Yayın</span>;
      case "MANUAL":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">Manuel</span>;
      case "AUTOSAVE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-cream/60 border border-white/10">Oto Kayıt</span>;
      case "RESTORE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">Geri Yükleme</span>;
      default:
        return null;
    }
  };

  // Diff summary
  const revBlocks = selectedRev?.content || [];
  const revBlockTypes = revBlocks.map((b) => b.type);
  const currentBlockTypes = currentBlocks.map((b) => b.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-charcoal-900 border border-gold/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gold/15 bg-white/5">
          <div className="flex items-center gap-2 text-gold font-semibold text-sm">
            <History className="w-4 h-4" />
            <span>Revizyon Geçmişi & Sürüm Karşılaştırma</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/25 font-normal">
              {revisions.length} Revizyon
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-cream/50 hover:text-cream hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-pane layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Revisions list */}
          <div className="w-72 border-r border-gold/15 overflow-y-auto p-3 space-y-2 bg-black/30">
            {revisions.map((rev) => {
              const isSelected = rev.id === selectedRevisionId;
              return (
                <div
                  key={rev.id}
                  onClick={() => setSelectedRevisionId(rev.id)}
                  className={`p-3 rounded-xl cursor-pointer text-xs transition-all border ${
                    isSelected
                      ? "bg-gold/15 border-gold text-cream shadow-sm"
                      : "bg-charcoal-800/80 border-gold/10 text-cream/70 hover:border-gold/30 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    {getTypeBadge(rev.type)}
                    <span className="text-[11px] text-cream/50 font-mono">
                      {formatTrDate(rev.createdAt)}
                    </span>
                  </div>
                  <div className="font-medium text-cream truncate">{rev.title}</div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-cream/50">
                    <span>{rev.authorName || "Yönetici"}</span>
                    <span>{rev.content?.length || 0} Blok</span>
                  </div>
                </div>
              );
            })}

            {revisions.length === 0 && (
              <div className="py-12 text-center text-cream/40 text-xs">
                Kayıtlı revizyon bulunamadı.
              </div>
            )}
          </div>

          {/* Right: Revision Details & Diff (PG-R-02) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {selectedRev ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-gold/15">
                  <div>
                    <h3 className="font-semibold text-sm text-cream flex items-center gap-2">
                      <span>{selectedRev.title}</span>
                      {getTypeBadge(selectedRev.type)}
                    </h3>
                    <p className="text-xs text-cream/50 mt-0.5">
                      {formatTrDate(selectedRev.createdAt)} tarihinde{" "}
                      <strong>{selectedRev.authorName || "Yönetici"}</strong> tarafından kaydedildi.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onRestore(selectedRev);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gold text-charcoal-900 rounded-xl text-xs font-semibold hover:bg-gold-light transition-colors shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Taslak Olarak Geri Yükle</span>
                  </button>
                </div>

                {/* Diff Comparison Card */}
                <div className="p-4 rounded-xl bg-charcoal-800/80 border border-gold/20 space-y-3">
                  <div className="flex items-center gap-2 text-gold text-xs font-semibold">
                    <GitCompare className="w-4 h-4" />
                    <span>Mevcut Sürüm ile Farklar</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
                      <span className="text-[11px] text-cream/50 font-medium block">
                        Seçilen Revizyon ({selectedRev.content.length} Blok)
                      </span>
                      <div className="font-medium text-cream truncate">
                        Başlık: {selectedRev.title}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {revBlockTypes.map((t, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-cream/70 font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
                      <span className="text-[11px] text-cream/50 font-medium block">
                        Şu Anki Editör Hâli ({currentBlocks.length} Blok)
                      </span>
                      <div className="font-medium text-cream truncate">
                        Başlık: {currentTitle}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {currentBlockTypes.map((t, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-cream/70 font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blocks inside revision */}
                <div>
                  <h4 className="text-xs font-semibold text-cream/80 mb-2">
                    Revizyondaki Bloklar ({selectedRev.content.length})
                  </h4>
                  <div className="space-y-1.5">
                    {selectedRev.content.map((b, idx) => (
                      <div
                        key={b.id || idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-cream/80"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-cream/40 font-mono w-5">
                            {idx + 1}.
                          </span>
                          <span className="font-medium capitalize">{b.type}</span>
                        </div>
                        <span className="text-[11px] text-cream/50 font-mono">
                          {b.anchorId ? `#${b.anchorId}` : "ID: " + b.id.substring(0, 8)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-cream/40 text-xs">
                İncelemek için sol taraftan bir revizyon seçin.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
