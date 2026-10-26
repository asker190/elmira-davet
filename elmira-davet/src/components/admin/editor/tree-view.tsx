"use client";

import React from "react";
import type { BlockNode } from "@/lib/cms/types";
import { BLOCK_REGISTRY } from "@/lib/cms/registry";
import {
  X,
  ListTree,
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Hash,
} from "lucide-react";

interface TreeViewProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: BlockNode[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onMoveBlock: (id: string, direction: "up" | "down") => void;
  onDuplicateBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
}

export function TreeView({
  isOpen,
  onClose,
  blocks,
  selectedBlockId,
  onSelectBlock,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
}: TreeViewProps) {
  if (!isOpen) return null;

  const renderBlockItem = (block: BlockNode, index: number, isChild: boolean = false) => {
    const def = BLOCK_REGISTRY[block.type];
    const isSelected = selectedBlockId === block.id;

    return (
      <div key={block.id} className="space-y-1">
        <div
          onClick={() => onSelectBlock(block.id)}
          className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all border ${
            isChild ? "ml-5" : ""
          } ${
            isSelected
              ? "bg-gold/20 border-gold text-gold font-semibold shadow-sm"
              : "bg-charcoal-800/80 border-gold/10 text-cream/80 hover:border-gold/30 hover:bg-white/5"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] text-cream/40 font-mono w-4 shrink-0 text-center">
              {index + 1}
            </span>
            <span className="truncate">{def?.name || block.type}</span>
            {block.anchorId && (
              <span className="flex items-center text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-cream/50 font-mono shrink-0">
                <Hash className="w-2.5 h-2.5 mr-0.5" />
                {block.anchorId}
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveBlock(block.id, "up");
              }}
              disabled={index === 0}
              className="p-1 hover:text-gold disabled:opacity-20 transition-colors"
              title="Yukarı Taşı"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveBlock(block.id, "down");
              }}
              disabled={index === blocks.length - 1}
              className="p-1 hover:text-gold disabled:opacity-20 transition-colors"
              title="Aşağı Taşı"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateBlock(block.id);
              }}
              className="p-1 hover:text-gold transition-colors"
              title="Çoğalt"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteBlock(block.id);
              }}
              className="p-1 hover:text-red-400 transition-colors"
              title="Sil"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Children (e.g. columns) */}
        {block.children && block.children.length > 0 && (
          <div className="space-y-1">
            {block.children.map((child, cIdx) => renderBlockItem(child, cIdx, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-80 bg-charcoal-900 border-r border-gold/20 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
      <div className="flex items-center justify-between p-4 border-b border-gold/15 bg-white/5">
        <div className="flex items-center gap-2 text-gold font-semibold text-sm">
          <ListTree className="w-4 h-4" />
          <span>Blok Ağacı (Liste Görünümü)</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-cream/50 hover:text-cream hover:bg-white/10 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {blocks.map((block, index) => renderBlockItem(block, index))}

        {blocks.length === 0 && (
          <div className="py-12 text-center text-cream/40 text-xs">
            Sayfada henüz blok bulunmuyor.
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gold/15 bg-black/20 text-[11px] text-cream/50 text-center">
        Toplam <strong>{blocks.length}</strong> blok
      </div>
    </div>
  );
}
