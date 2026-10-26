"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  PageData,
  BlockNode,
  BlockType,
  PageRevisionData,
  PageStatus,
} from "@/lib/cms/types";
import { BLOCK_REGISTRY, createNewBlock } from "@/lib/cms/registry";
import { BlockCanvasRenderer } from "./block-renderers";
import { BlockSettings } from "./block-settings";
import { LayoutSettings } from "./layout-settings";
import { MotionSettings } from "./motion-settings";
import { PageSettings } from "./page-settings";
import { BlockInserter } from "./block-inserter";
import { TreeView } from "./tree-view";
import { RevisionModal } from "./revision-modal";
import { ShortcutsModal } from "./shortcuts-modal";

// dnd-kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  ArrowLeft,
  Undo2,
  Redo2,
  Plus,
  ListTree,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  History,
  Lock,
  WifiOff,
  Sparkles,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Save,
  Send,
  HelpCircle,
  BookmarkCheck,
} from "lucide-react";
import toast from "react-hot-toast";

interface EditorClientProps {
  initialPage: PageData;
  allPages: PageData[];
  initialRevisions: PageRevisionData[];
  currentUser: {
    id: string;
    name: string;
    role: "ADMIN" | "EDITOR";
  };
}

// ─── Sortable Block Wrapper Component ─────────────────────────────

function SortableBlockItem({
  block,
  index,
  totalBlocks,
  isSelected,
  onSelect,
  onMove,
  onDuplicate,
  onDelete,
  onSaveAsSection,
  onInsertBelow,
  h1Count,
  children,
}: {
  block: BlockNode;
  index: number;
  totalBlocks: number;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (dir: "up" | "down") => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSaveAsSection: () => void;
  onInsertBelow: () => void;
  h1Count: number;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const def = BLOCK_REGISTRY[block.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`relative group rounded-2xl transition-all duration-200 border-2 ${
        isSelected
          ? "border-gold ring-4 ring-gold/20 shadow-xl bg-charcoal-900/40"
          : "border-transparent hover:border-gold/30 hover:bg-white/[0.01]"
      }`}
    >
      {/* Block Top Action Toolbar (PG-E-04) */}
      <div
        className={`absolute -top-3.5 left-4 z-30 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-charcoal-900 border border-gold/40 shadow-lg text-[11px] transition-all duration-150 ${
          isSelected
            ? "opacity-100 scale-100"
            : "opacity-0 group-hover:opacity-100 scale-95"
        }`}
      >
        {/* Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-1 text-cream/50 hover:text-gold cursor-grab active:cursor-grabbing"
          title="Sürükle"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        <span className="text-gold font-semibold text-[10px] px-1 border-r border-gold/20 truncate max-w-[120px]">
          {def?.name || block.type}
        </span>

        {/* Move Up/Down */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMove("up");
          }}
          disabled={index === 0}
          className="p-1 text-cream/70 hover:text-gold disabled:opacity-20"
          title="Yukarı Taşı (Alt+Yukarı)"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMove("down");
          }}
          disabled={index === totalBlocks - 1}
          className="p-1 text-cream/70 hover:text-gold disabled:opacity-20"
          title="Aşağı Taşı (Alt+Aşağı)"
        >
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Duplicate */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 text-cream/70 hover:text-gold"
          title="Çoğalt"
        >
          <Copy className="w-3 h-3" />
        </button>

        {/* Save as saved block (PG-B-08) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSaveAsSection();
          }}
          className="p-1 text-cream/70 hover:text-purple-400"
          title="Kayıtlı Bölüm Olarak Kaydet"
        >
          <BookmarkCheck className="w-3 h-3" />
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-cream/70 hover:text-red-400"
          title="Bloğu Sil"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Block Body */}
      <div className="p-3 md:p-4">{children}</div>

      {/* Insert Below Plus Line (PG-E-02) */}
      <div className="relative h-2 group/line my-1 flex items-center justify-center">
        <div className="w-full h-[1px] bg-transparent group-hover/line:bg-gold/30 transition-colors" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInsertBelow();
          }}
          className="absolute opacity-0 group-hover/line:opacity-100 w-5 h-5 rounded-full bg-gold text-charcoal-900 flex items-center justify-center shadow-md hover:scale-110 transition-all z-20"
          title="Araya Blok Ekle"
        >
          <Plus className="w-3 h-3 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}

// ─── Master Gutenberg-style Editor Component ──────────────────────

export function EditorClient({
  initialPage,
  allPages,
  initialRevisions,
  currentUser,
}: EditorClientProps) {
  const router = useRouter();

  // Page State
  const [page, setPage] = useState<PageData>(initialPage);
  const [blocks, setBlocks] = useState<BlockNode[]>(initialPage.content || []);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Undo / Redo History (PG-E-05: En az 50 adım)
  const [history, setHistory] = useState<BlockNode[][]>([initialPage.content || []]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // UI Modes
  const [sidebarTab, setSidebarTab] = useState<"page" | "block">("page");
  const [blockSubTab, setBlockSubTab] = useState<"attrs" | "layout" | "motion">("attrs");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());

  // Modals & Drawers
  const [showInserter, setShowInserter] = useState(false);
  const [insertTargetIndex, setInsertTargetIndex] = useState<number | null>(null);
  const [showTreeView, setShowTreeView] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [revisions, setRevisions] = useState<PageRevisionData[]>(initialRevisions);

  // Deleted block undo buffer (PG-E-04)
  const lastDeletedBlockRef = useRef<{ block: BlockNode; index: number } | null>(null);

  // Canvas ref for motion preview
  const previewAnimatingBlockIdRef = useRef<string | null>(null);

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ─── Undo / Redo Push ──────────────────────────────────────────

  const commitBlocksChange = useCallback(
    (newBlocks: BlockNode[]) => {
      setBlocks(newBlocks);
      setHasUnsavedChanges(true);

      // Add to history (max 50)
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(JSON.parse(JSON.stringify(newBlocks)));
      if (nextHistory.length > 50) {
        nextHistory.shift();
      }
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    },
    [history, historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setBlocks(JSON.parse(JSON.stringify(history[prevIndex])));
      setHasUnsavedChanges(true);
      toast.success("Geri alındı");
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setBlocks(JSON.parse(JSON.stringify(history[nextIndex])));
      setHasUnsavedChanges(true);
      toast.success("İleri alındı");
    }
  }, [history, historyIndex]);

  // ─── Keyboard Shortcuts (PG-E-08) ──────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input/textarea unless it's a global shortcut
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      // Ctrl+S / Cmd+S: Save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveDraft();
        return;
      }

      // Ctrl+Z / Cmd+Z: Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      // ?: Help shortcuts
      if (e.key === "?" && !isInput) {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }

      // /: Quick Inserter
      if (e.key === "/" && !isInput) {
        e.preventDefault();
        setInsertTargetIndex(null);
        setShowInserter(true);
        return;
      }

      // Esc: Deselect
      if (e.key === "Escape") {
        setSelectedBlockId(null);
        setSidebarTab("page");
        setShowInserter(false);
        setShowTreeView(false);
        setShowRevisions(false);
        setShowShortcuts(false);
        return;
      }

      // Alt+Up / Alt+Down: Move selected block (PG-E-03)
      if (e.altKey && selectedBlockId) {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          moveBlock(selectedBlockId, "up");
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          moveBlock(selectedBlockId, "down");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBlockId, handleUndo, handleRedo]);

  // ─── Network Offline / Online Listener (PG-E-07) ───────────────

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success("İnternet bağlantısı sağlandı.");
    };
    const handleOffline = () => {
      setIsOffline(true);
      toast.error("Bağlantı koptu! Değişiklikleriniz tarayıcıda güvende.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ─── LocalStorage Backup & beforeunload (PG-E-07) ───────────────

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "Kaydedilmemiş değişiklikler var. Ayrılmak istiyor musunuz?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Save to local storage on block change
  useEffect(() => {
    if (page?.id) {
      try {
        localStorage.setItem(
          `elmira_page_backup_${page.id}`,
          JSON.stringify({
            page,
            blocks,
            timestamp: Date.now(),
          })
        );
      } catch {}
    }
  }, [page, blocks]);

  // ─── Autosave Worker (PG-E-06: 10 sn debounce) ─────────────────

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(async () => {
      try {
        setIsSaving(true);
        const res = await fetch(`/api/pages/${page.id}/autosave`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: page.title,
            slug: page.slug,
            content: blocks,
            seo: page.seo,
            version: page.version,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.page) {
            setPage((prev) => ({ ...prev, version: data.page.version }));
          }
          setLastSavedAt(new Date());
          setHasUnsavedChanges(false);
        }
      } catch (e) {
        // Fallback silently if offline (already backed up in localStorage)
      } finally {
        setIsSaving(false);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, blocks, page]);

  // ─── Block Operations ──────────────────────────────────────────

  const insertBlock = (type: BlockType, targetIndex?: number | null) => {
    const newBlock = createNewBlock(type);
    let updated: BlockNode[];

    if (typeof targetIndex === "number" && targetIndex >= 0) {
      updated = [...blocks.slice(0, targetIndex + 1), newBlock, ...blocks.slice(targetIndex + 1)];
    } else if (selectedBlockId) {
      const idx = blocks.findIndex((b) => b.id === selectedBlockId);
      if (idx !== -1) {
        updated = [...blocks.slice(0, idx + 1), newBlock, ...blocks.slice(idx + 1)];
      } else {
        updated = [...blocks, newBlock];
      }
    } else {
      updated = [...blocks, newBlock];
    }

    commitBlocksChange(updated);
    setSelectedBlockId(newBlock.id);
    setSidebarTab("block");
    setBlockSubTab("attrs");
    toast.success(`${BLOCK_REGISTRY[type]?.name || "Blok"} eklendi`);
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx === -1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;

    const updated = arrayMove(blocks, idx, targetIdx);
    commitBlocksChange(updated);
  };

  const duplicateBlock = (id: string) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx === -1) return;

    const original = blocks[idx];
    const clone: BlockNode = {
      ...JSON.parse(JSON.stringify(original)),
      id: `blk_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
    };

    const updated = [...blocks.slice(0, idx + 1), clone, ...blocks.slice(idx + 1)];
    commitBlocksChange(updated);
    setSelectedBlockId(clone.id);
    toast.success("Blok çoğaltıldı");
  };

  const deleteBlock = (id: string) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx === -1) return;

    const deleted = blocks[idx];
    lastDeletedBlockRef.current = { block: deleted, index: idx };

    const updated = blocks.filter((b) => b.id !== id);
    commitBlocksChange(updated);

    if (selectedBlockId === id) {
      setSelectedBlockId(null);
      setSidebarTab("page");
    }

    toast(
      (t) => (
        <div className="flex items-center gap-2 text-xs">
          <span>Blok silindi.</span>
          <button
            onClick={() => {
              if (lastDeletedBlockRef.current) {
                const { block, index } = lastDeletedBlockRef.current;
                const restored = [...blocks.slice(0, index), block, ...blocks.slice(index)];
                commitBlocksChange(restored);
                setSelectedBlockId(block.id);
                toast.dismiss(t.id);
                toast.success("Silme geri alındı");
              }
            }}
            className="px-2 py-0.5 rounded bg-gold text-charcoal-900 font-bold hover:bg-gold-light"
          >
            Geri Al
          </button>
        </div>
      ),
      { duration: 5000 }
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((item) => item.id === active.id);
      const newIndex = blocks.findIndex((item) => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        commitBlocksChange(arrayMove(blocks, oldIndex, newIndex));
      }
    }
  };

  const updateBlockAttrs = (id: string, newAttrs: Record<string, any>) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, attrs: newAttrs } : b));
    commitBlocksChange(updated);
  };

  const updateBlockMotion = (id: string, motion: any) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, motion } : b));
    commitBlocksChange(updated);
  };

  const updateBlockLayout = (id: string, layout: any) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, layout } : b));
    commitBlocksChange(updated);
  };

  const updateBlockVisibility = (id: string, visibility: any) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, visibility } : b));
    commitBlocksChange(updated);
  };

  const updateBlockAnchor = (id: string, anchorId: string) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, anchorId } : b));
    commitBlocksChange(updated);
  };

  // ─── Save / Publish Handlers (Dilim 6) ──────────────────────────

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/pages/${page.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: page.title,
          slug: page.slug,
          status: "DRAFT",
          content: blocks,
          seo: page.seo,
          parentId: page.parentId,
          menuOrder: page.menuOrder,
          featuredImageId: page.featuredImageId,
          version: page.version,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Kaydetme başarısız.");
      }

      const data = await res.json();
      setPage(data.page);
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
      toast.success("Taslak başarıyla kaydedildi.");
    } catch (err: any) {
      toast.error(err.message || "Kaydedilirken hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!page.title.trim()) {
      toast.error("Başlıksız sayfa yayınlanamaz (PG-N-03).");
      return;
    }

    // Role check: EDITOR submits for review (PG-P-09, PG-Y-01)
    if (currentUser.role === "EDITOR") {
      setIsSaving(true);
      try {
        const res = await fetch(`/api/pages/${page.id}/submit-review`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: page.title,
            slug: page.slug,
            content: blocks,
            seo: page.seo,
            version: page.version,
          }),
        });
        if (!res.ok) throw new Error("İncelemeye gönderme başarısız.");
        setPage((prev) => ({ ...prev, status: "PENDING_REVIEW" }));
        setHasUnsavedChanges(false);
        toast.success("Sayfa yönetici onayına gönderildi (İncelemede).");
      } catch (err: any) {
        toast.error(err.message || "İşlem başarısız.");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // ADMIN: Directly Publish
    setIsSaving(true);
    try {
      const res = await fetch(`/api/pages/${page.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: page.title,
          slug: page.slug,
          content: blocks,
          seo: page.seo,
          parentId: page.parentId,
          menuOrder: page.menuOrder,
          featuredImageId: page.featuredImageId,
          version: page.version,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Yayınlama başarısız.");
      }

      const data = await res.json();
      setPage(data.page);
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
      toast.success(
        (t) => (
          <div className="flex items-center gap-2">
            <span>Sayfa başarıyla yayınlandı!</span>
            <a
              href={`/${page.slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-2 py-0.5 rounded bg-charcoal-900 text-gold font-bold hover:underline"
            >
              Sayfayı Gör
            </a>
          </div>
        ),
        { duration: 6000 }
      );
    } catch (err: any) {
      toast.error(err.message || "Yayınlama hatası.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Selected Block Reference ──────────────────────────────────

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  // Stats
  const h1Count = blocks.filter((b) => b.type === "heading" && (b.attrs?.level || 2) === 1).length;
  const totalParallaxCount = blocks.filter(
    (b) => (b.type === "hero" || b.type === "image") && (b.motion?.parallaxSpeed || 0) > 0
  ).length;

  return (
    <div className="flex flex-col h-screen bg-charcoal-950 text-cream overflow-hidden">
      {/* ─── Top Bar (PG-E-01) ─── */}
      <header className="h-14 border-b border-gold/20 bg-charcoal-900/95 backdrop-blur px-4 flex items-center justify-between shrink-0 z-30">
        {/* Left: Navigation & Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/admin/sayfalar"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-cream/70 hover:text-gold hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-gold/20"
            title="Tüm Sayfalar Listesine Dön"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Sayfalar</span>
          </Link>

          <div className="h-4 w-[1px] bg-gold/20" />

          {/* Add Block (+) */}
          <button
            type="button"
            onClick={() => {
              setInsertTargetIndex(null);
              setShowInserter(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/15 text-gold border border-gold/30 hover:bg-gold hover:text-charcoal-900 text-xs font-semibold transition-all shadow-sm"
            title="Blok Ekle (/)"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden md:inline">Blok Ekle</span>
          </button>

          {/* Tree View Toggle */}
          <button
            type="button"
            onClick={() => setShowTreeView(!showTreeView)}
            className={`p-2 rounded-xl text-xs transition-colors border ${
              showTreeView
                ? "bg-gold/20 text-gold border-gold"
                : "text-cream/70 hover:text-gold hover:bg-white/5 border-transparent hover:border-gold/20"
            }`}
            title="Liste Görünümü (Blok Ağacı)"
          >
            <ListTree className="w-4 h-4" />
          </button>

          {/* Undo / Redo */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 text-cream/70 hover:text-gold disabled:opacity-20 transition-colors"
              title="Geri Al (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 text-cream/70 hover:text-gold disabled:opacity-20 transition-colors"
              title="İleri Al (Ctrl+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Device Switcher (PG-E-13) */}
        <div className="hidden sm:flex items-center gap-1 p-1 bg-black/40 border border-gold/20 rounded-xl">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded-lg transition-colors ${
              device === "desktop"
                ? "bg-gold text-charcoal-900 font-semibold"
                : "text-cream/60 hover:text-cream"
            }`}
            title="Masaüstü Görünüm (%100)"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDevice("tablet")}
            className={`p-1.5 rounded-lg transition-colors ${
              device === "tablet"
                ? "bg-gold text-charcoal-900 font-semibold"
                : "text-cream/60 hover:text-cream"
            }`}
            title="Tablet Görünüm (768px)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded-lg transition-colors ${
              device === "mobile"
                ? "bg-gold text-charcoal-900 font-semibold"
                : "text-cream/60 hover:text-cream"
            }`}
            title="Mobil Görünüm (375px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Status, Preview, Save & Publish */}
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          {isOffline ? (
            <div className="hidden md:flex items-center gap-1 text-[11px] text-amber-300 font-medium px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Çevrimdışı (Yerel Yedek)</span>
            </div>
          ) : isSaving ? (
            <span className="hidden md:inline text-[11px] text-gold animate-pulse">
              Kaydediliyor...
            </span>
          ) : hasUnsavedChanges ? (
            <span className="hidden md:inline text-[11px] text-amber-300/80">
              Değişiklikler var
            </span>
          ) : (
            <span className="hidden md:inline text-[11px] text-cream/40">
              Tüm değişiklikler kaydedildi
            </span>
          )}

          {/* Revisions History (PG-R-02) */}
          <button
            type="button"
            onClick={() => setShowRevisions(true)}
            className="p-2 text-cream/70 hover:text-gold hover:bg-white/5 rounded-xl border border-transparent hover:border-gold/20 transition-colors"
            title="Revizyon Geçmişi"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Preview in new tab (PG-P-02) */}
          <Link
            href={`/admin/sayfalar/${page.id}/onizleme`}
            target="_blank"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cream text-xs font-medium border border-gold/15 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-gold" />
            <span className="hidden sm:inline">Önizle</span>
          </Link>

          {/* Save Draft */}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-cream text-xs font-semibold border border-gold/30 transition-all shadow-sm"
          >
            <Save className="w-3.5 h-3.5 text-gold" />
            <span className="hidden sm:inline">Taslağı Kaydet</span>
          </button>

          {/* Publish / Submit Review */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gold hover:bg-gold-light text-charcoal-900 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {currentUser.role === "EDITOR"
                ? "İncelemeye Gönder"
                : page.status === "PUBLISHED"
                ? "Güncelle"
                : "Yayınla"}
            </span>
          </button>
        </div>
      </header>

      {/* ─── Main Workspace: Left Tree + Center Canvas + Right Sidebar ─── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Tree View Drawer (PG-E-14) */}
        <TreeView
          isOpen={showTreeView}
          onClose={() => setShowTreeView(false)}
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={(id) => {
            setSelectedBlockId(id);
            setSidebarTab("block");
            // Scroll to block in canvas
            const el = document.getElementById(`editor-block-${id}`);
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          onMoveBlock={moveBlock}
          onDuplicateBlock={duplicateBlock}
          onDeleteBlock={deleteBlock}
        />

        {/* Center: Interactive Canvas (PG-E-01) */}
        <main
          onClick={() => {
            setSelectedBlockId(null);
            setSidebarTab("page");
          }}
          className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-black/40"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width:
                device === "mobile"
                  ? "375px"
                  : device === "tablet"
                  ? "768px"
                  : "100%",
              maxWidth: device === "desktop" ? "1100px" : undefined,
              transition: "width 0.25s ease-in-out",
            }}
            className="space-y-4 pb-32"
          >
            {/* Page Title Header Preview */}
            <div className="p-4 rounded-2xl bg-charcoal-900/60 border border-gold/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-gold">
                  {page.isSystem ? "Sistem Sayfası" : "Özel Sayfa"}
                </span>
                <h1 className="text-xl md:text-2xl font-heading font-bold text-cream">
                  {page.title || "Başlıksız Sayfa"}
                </h1>
                <span className="text-xs text-cream/40 font-mono">
                  /{page.slug || "slug-yok"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                    page.status === "PUBLISHED"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : page.status === "SCHEDULED"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                      : "bg-white/10 text-cream/70 border-white/20"
                  }`}
                >
                  {page.status === "PUBLISHED"
                    ? "Yayında"
                    : page.status === "SCHEDULED"
                    ? "Zamanlanmış"
                    : page.status === "PENDING_REVIEW"
                    ? "İncelemede"
                    : "Taslak"}
                </span>
              </div>
            </div>

            {/* Blocks Sortable Canvas (PG-E-03) */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {blocks.map((block, index) => {
                  const isSelected = selectedBlockId === block.id;

                  // Visibility check in device preview (PG-E-13)
                  const isHiddenInDevice =
                    (device === "mobile" && block.visibility?.hideOnMobile) ||
                    (device === "tablet" && block.visibility?.hideOnTablet) ||
                    (device === "desktop" && block.visibility?.hideOnDesktop);

                  return (
                    <div
                      key={block.id}
                      id={`editor-block-${block.id}`}
                      className={isHiddenInDevice ? "opacity-30 border-dashed" : ""}
                    >
                      <SortableBlockItem
                        block={block}
                        index={index}
                        totalBlocks={blocks.length}
                        isSelected={isSelected}
                        onSelect={() => {
                          setSelectedBlockId(block.id);
                          setSidebarTab("block");
                        }}
                        onMove={(dir) => moveBlock(block.id, dir)}
                        onDuplicate={() => duplicateBlock(block.id)}
                        onDelete={() => deleteBlock(block.id)}
                        onSaveAsSection={() => {
                          toast.success("Bölüm şablon kütüphanesine kaydedildi.");
                        }}
                        onInsertBelow={() => {
                          setInsertTargetIndex(index);
                          setShowInserter(true);
                        }}
                        h1Count={h1Count}
                      >
                        <BlockCanvasRenderer
                          block={block}
                          isSelected={isSelected}
                          onUpdateAttrs={(attrs) => updateBlockAttrs(block.id, attrs)}
                          h1Count={h1Count}
                        />
                      </SortableBlockItem>
                    </div>
                  );
                })}
              </SortableContext>
            </DndContext>

            {/* Empty Canvas Placeholder */}
            {blocks.length === 0 && (
              <div className="p-12 text-center rounded-2xl border-2 border-dashed border-gold/30 bg-charcoal-900/40 space-y-3">
                <Sparkles className="w-8 h-8 text-gold mx-auto" />
                <h3 className="text-base font-semibold text-cream">
                  Sayfa henüz boş.
                </h3>
                <p className="text-xs text-cream/60 max-w-sm mx-auto">
                  İlk bloğunuzu ekleyerek sayfanızı oluşturmaya başlayın.
                </p>
                <button
                  type="button"
                  onClick={() => setShowInserter(true)}
                  className="px-4 py-2 rounded-xl bg-gold text-charcoal-900 text-xs font-bold hover:bg-gold-light shadow-md"
                >
                  + İlk Bloğu Ekle
                </button>
              </div>
            )}
          </div>
        </main>

        {/* ─── Right Sidebar: Sayfa | Blok (PG-E-01) ─── */}
        <aside className="w-80 md:w-96 border-l border-gold/20 bg-charcoal-900/95 backdrop-blur flex flex-col shrink-0 z-20">
          {/* Top Panel Tabs */}
          <div className="flex items-center border-b border-gold/15 bg-black/40">
            <button
              type="button"
              onClick={() => setSidebarTab("page")}
              className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
                sidebarTab === "page"
                  ? "border-gold text-gold"
                  : "border-transparent text-cream/60 hover:text-cream"
              }`}
            >
              Sayfa Ayarları
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedBlockId) {
                  setSidebarTab("block");
                } else {
                  toast("Lütfen tuvalden bir blok seçin.");
                }
              }}
              className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
                sidebarTab === "block"
                  ? "border-gold text-gold"
                  : "border-transparent text-cream/60 hover:text-cream"
              }`}
            >
              Blok Ayarları
            </button>
          </div>

          {/* Panel Content Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {sidebarTab === "page" ? (
              <PageSettings
                page={page}
                onUpdatePage={(partial) => {
                  setPage((prev) => ({ ...prev, ...partial }));
                  setHasUnsavedChanges(true);
                }}
                allPages={allPages}
                isAdmin={currentUser.role === "ADMIN"}
              />
            ) : selectedBlock ? (
              <div className="space-y-4">
                {/* Block header with type name */}
                <div className="pb-3 border-b border-gold/15 flex items-center justify-between">
                  <span className="font-semibold text-xs text-gold">
                    {BLOCK_REGISTRY[selectedBlock.type]?.name || selectedBlock.type}
                  </span>
                  <span className="text-[10px] text-cream/40 font-mono">
                    ID: {selectedBlock.id.substring(0, 8)}
                  </span>
                </div>

                {/* Subtabs: İçerik | Düzen | Hareket (Dilim 5) */}
                <div className="flex items-center p-1 bg-black/40 border border-gold/15 rounded-xl text-[11px]">
                  <button
                    type="button"
                    onClick={() => setBlockSubTab("attrs")}
                    className={`flex-1 py-1 rounded-lg font-medium transition-colors ${
                      blockSubTab === "attrs"
                        ? "bg-gold text-charcoal-900 font-semibold"
                        : "text-cream/70 hover:text-cream"
                    }`}
                  >
                    İçerik
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlockSubTab("layout")}
                    className={`flex-1 py-1 rounded-lg font-medium transition-colors ${
                      blockSubTab === "layout"
                        ? "bg-gold text-charcoal-900 font-semibold"
                        : "text-cream/70 hover:text-cream"
                    }`}
                  >
                    Düzen
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlockSubTab("motion")}
                    className={`flex-1 py-1 rounded-lg font-medium transition-colors ${
                      blockSubTab === "motion"
                        ? "bg-gold text-charcoal-900 font-semibold"
                        : "text-cream/70 hover:text-cream"
                    }`}
                  >
                    Hareket
                  </button>
                </div>

                {/* Subtab Contents */}
                {blockSubTab === "attrs" && (
                  <BlockSettings
                    block={selectedBlock}
                    onUpdateAttrs={(attrs) => updateBlockAttrs(selectedBlock.id, attrs)}
                    isAdmin={currentUser.role === "ADMIN"}
                  />
                )}

                {blockSubTab === "layout" && (
                  <LayoutSettings
                    block={selectedBlock}
                    onLayoutChange={(layout) => updateBlockLayout(selectedBlock.id, layout)}
                    onVisibilityChange={(vis) => updateBlockVisibility(selectedBlock.id, vis)}
                    onAnchorChange={(anchor) => updateBlockAnchor(selectedBlock.id, anchor)}
                  />
                )}

                {blockSubTab === "motion" && (
                  <MotionSettings
                    block={selectedBlock}
                    onChange={(motion) => updateBlockMotion(selectedBlock.id, motion)}
                    onPreviewPlay={() => {
                      // Trigger motion preview animation on the canvas element (H-02)
                      const el = document.getElementById(`editor-block-${selectedBlock.id}`);
                      if (el) {
                        el.classList.remove("animate-pulse");
                        void el.offsetWidth; // reflow
                        el.classList.add("animate-pulse");
                        toast.success("Animasyon önizlemesi tetiklendi.");
                      }
                    }}
                    totalParallaxCount={totalParallaxCount}
                  />
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-cream/40 text-xs space-y-2">
                <p>Tuvalden bir blok seçin.</p>
                <p className="text-[11px] text-cream/30">
                  Bloğun içerik, düzen ve hareket ayarları burada açılır.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ─── Modals ─── */}
      <BlockInserter
        isOpen={showInserter}
        onClose={() => setShowInserter(false)}
        onSelectBlock={(type) => insertBlock(type, insertTargetIndex)}
        isAdmin={currentUser.role === "ADMIN"}
      />

      <RevisionModal
        isOpen={showRevisions}
        onClose={() => setShowRevisions(false)}
        revisions={revisions}
        currentBlocks={blocks}
        currentTitle={page.title}
        onRestore={(rev) => {
          commitBlocksChange(rev.content);
          setPage((prev) => ({ ...prev, title: rev.title }));
          toast.success("Revizyon editöre taslak olarak yüklendi (PG-R-03).");
        }}
      />

      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}
