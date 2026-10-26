"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FileText,
  Search,
  Plus,
  Edit2,
  Copy,
  Trash2,
  ExternalLink,
  Eye,
  Lock,
  RotateCcw,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  CornerDownRight,
  MoreVertical,
} from "lucide-react";
import type { PageData, PageStatus } from "@/lib/cms/types";
import {
  quickEditPageAction,
  batchPagesAction,
  trashPageAction,
  restorePageAction,
  permanentlyDeletePageAction,
  clonePageAction,
} from "./actions";

interface PagesListClientProps {
  initialPages: PageData[];
  initialCounts: {
    all: number;
    published: number;
    draft: number;
    scheduled: number;
    pendingReview: number;
    trash: number;
  };
}

export function PagesListClient({
  initialPages,
  initialCounts,
}: PagesListClientProps) {
  const router = useRouter();
  const [pages, setPages] = useState<PageData[]>(initialPages);
  const [counts, setCounts] = useState(initialCounts);
  const [activeTab, setActiveTab] = useState<PageStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Quick Edit State (PG-L-05)
  const [quickEditingId, setQuickEditingId] = useState<string | null>(null);
  const [quickForm, setQuickForm] = useState<{
    title: string;
    slug: string;
    status: PageStatus;
    parentId: string | null;
    menuOrder: number;
    scheduledAt: string;
  }>({
    title: "",
    slug: "",
    status: "DRAFT",
    parentId: null,
    menuOrder: 0,
    scheduledAt: "",
  });

  // Hierarchy trash modal (PG-L-07)
  const [trashPromptPage, setTrashPromptPage] = useState<PageData | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<"updatedAt" | "title" | "menuOrder">("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter pages
  const filteredPages = pages.filter((page) => {
    // Tab filter (L-02: Çöp Tümü sekmesinde görünmez)
    if (activeTab === "ALL") {
      if (page.status === "TRASH") return false;
    } else if (page.status !== activeTab) {
      return false;
    }

    // Search filter: Turkish character insensitive (L-03)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLocaleLowerCase("tr-TR");
      const titleMatch = page.title.toLocaleLowerCase("tr-TR").includes(q);
      const slugMatch = page.slug.toLocaleLowerCase("tr-TR").includes(q);
      if (!titleMatch && !slugMatch) return false;
    }

    return true;
  });

  // Sort pages
  const sortedPages = [...filteredPages].sort((a, b) => {
    if (sortBy === "title") {
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title, "tr")
        : b.title.localeCompare(a.title, "tr");
    }
    if (sortBy === "menuOrder") {
      return sortOrder === "asc" ? a.menuOrder - b.menuOrder : b.menuOrder - a.menuOrder;
    }
    return sortOrder === "asc"
      ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Organize hierarchy: root pages first, children indented under parent (PG-L-07)
  const buildHierarchicalList = (items: PageData[]): PageData[] => {
    const parentMap = new Map<string, PageData[]>();
    const roots: PageData[] = [];

    items.forEach((item) => {
      if (item.parentId) {
        const arr = parentMap.get(item.parentId) || [];
        arr.push(item);
        parentMap.set(item.parentId, arr);
      } else {
        roots.push(item);
      }
    });

    const result: PageData[] = [];
    const traverse = (node: PageData) => {
      result.push(node);
      const children = parentMap.get(node.id) || [];
      children.forEach(traverse);
    };

    roots.forEach(traverse);
    // Include orphaned items if parent was not found in filtered list
    items.forEach((item) => {
      if (!result.includes(item)) result.push(item);
    });

    return result;
  };

  const displayList = buildHierarchicalList(sortedPages);

  // Quick edit open
  const startQuickEdit = (page: PageData) => {
    setQuickEditingId(page.id);
    setQuickForm({
      title: page.title,
      slug: page.slug,
      status: page.status,
      parentId: page.parentId || null,
      menuOrder: page.menuOrder,
      scheduledAt: page.scheduledAt ? page.scheduledAt.slice(0, 16) : "",
    });
  };

  const handleSaveQuickEdit = () => {
    if (!quickEditingId) return;

    startTransition(async () => {
      const res = await quickEditPageAction(quickEditingId, {
        title: quickForm.title,
        slug: quickForm.slug,
        status: quickForm.status,
        parentId: quickForm.parentId,
        menuOrder: quickForm.menuOrder,
        scheduledAt: quickForm.scheduledAt ? new Date(quickForm.scheduledAt).toISOString() : null,
      });

      if (res.success && res.page) {
        toast.success("Sayfa güncellendi");
        setPages((prev) => prev.map((p) => (p.id === res.page!.id ? res.page! : p)));
        setQuickEditingId(null);
      } else {
        toast.error(res.error || "Güncelleme başarısız");
      }
    });
  };

  // Trash handling
  const handleTrashClick = (page: PageData) => {
    const children = pages.filter((p) => p.parentId === page.id && p.status !== "TRASH");
    if (children.length > 0) {
      setTrashPromptPage(page);
    } else {
      executeTrash(page.id, false);
    }
  };

  const executeTrash = (id: string, reassignChildren: boolean) => {
    startTransition(async () => {
      const res = await trashPageAction(id, { reassignChildrenToParent: reassignChildren });
      if (res.success) {
        toast.success("Sayfa çöpe atıldı");
        setPages((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "TRASH" as const } : p))
        );
        setCounts((c) => ({
          ...c,
          all: Math.max(0, c.all - 1),
          trash: c.trash + 1,
        }));
        setTrashPromptPage(null);
      } else {
        toast.error(res.error || "İşlem başarısız");
      }
    });
  };

  // Restore handling
  const handleRestore = (id: string) => {
    startTransition(async () => {
      const res = await restorePageAction(id);
      if (res.success) {
        toast.success("Sayfa taslak olarak geri yüklendi");
        setPages((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "DRAFT" as const } : p))
        );
        setCounts((c) => ({
          ...c,
          all: c.all + 1,
          trash: Math.max(0, c.trash - 1),
          draft: c.draft + 1,
        }));
      } else {
        toast.error(res.error || "Geri yükleme başarısız");
      }
    });
  };

  // Permanently delete
  const handlePermanentDelete = (id: string, title: string) => {
    if (!confirm(`"${title}" sayfası kalıcı olarak silinecektir. Bu işlem geri alınamaz. Devam edilsin mi?`)) {
      return;
    }

    startTransition(async () => {
      const res = await permanentlyDeletePageAction(id);
      if (res.success) {
        toast.success("Sayfa kalıcı olarak silindi");
        setPages((prev) => prev.filter((p) => p.id !== id));
        setCounts((c) => ({ ...c, trash: Math.max(0, c.trash - 1) }));
      } else {
        toast.error(res.error || "Silme başarısız");
      }
    });
  };

  // Clone handling
  const handleClone = (id: string) => {
    startTransition(async () => {
      const res = await clonePageAction(id);
      if (res.success && res.page) {
        toast.success(`"${res.page.title}" kopyalandı`);
        setPages((prev) => [res.page!, ...prev]);
        setCounts((c) => ({ ...c, all: c.all + 1, draft: c.draft + 1 }));
      } else {
        toast.error(res.error || "Kopyalama başarısız");
      }
    });
  };

  // Bulk actions (L-06)
  const handleBulkAction = (action: "publish" | "draft" | "clone" | "trash") => {
    if (selectedIds.length === 0) return;

    startTransition(async () => {
      const res = await batchPagesAction(selectedIds, action);
      toast.success(res.message);
      setSelectedIds([]);
      router.refresh();
    });
  };

  // Status badge helper
  const getStatusBadge = (status: PageStatus, scheduledAt?: string | null) => {
    switch (status) {
      case "PUBLISHED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Yayında</span>;
      case "DRAFT":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">Taslak</span>;
      case "SCHEDULED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30 inline-flex items-center gap-1" title={scheduledAt || ""}>
            <Clock className="w-3 h-3" />
            <span>Zamanlanmış</span>
          </span>
        );
      case "PENDING_REVIEW":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30">İncelemede</span>;
      case "TRASH":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">Çöp</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading text-cream flex items-center gap-2">
            <FileText className="w-6 h-6 text-gold" />
            <span>Tüm Sayfalar</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Web sitenizdeki tüm dinamik sayfaları WordPress mantığında oluşturun ve yönetin.
          </p>
        </div>

        <Link
          href="/admin/sayfalar/yeni"
          className="px-4 py-2.5 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider shadow-gold hover:opacity-95 transition-opacity flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Sayfa Ekle</span>
        </Link>
      </div>

      {/* ── Status Tabs (PG-L-02) ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { key: "ALL", label: "Tümü", count: counts.all },
          { key: "PUBLISHED", label: "Yayında", count: counts.published },
          { key: "DRAFT", label: "Taslak", count: counts.draft },
          { key: "SCHEDULED", label: "Zamanlanmış", count: counts.scheduled },
          { key: "PENDING_REVIEW", label: "İncelemede", count: counts.pendingReview },
          { key: "TRASH", label: "Çöp", count: counts.trash },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === tab.key
                ? "bg-gold/20 text-gold border border-gold/40 shadow-sm"
                : "text-text-secondary hover:text-cream hover:bg-surface/60"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.key
                  ? "bg-gold text-bg-primary font-bold"
                  : "bg-surface text-text-muted"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search & Bulk Action Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Bulk Actions */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-surface p-1.5 rounded-xl border border-border">
              <span className="text-xs text-text-muted px-2">
                {selectedIds.length} seçildi
              </span>
              {activeTab !== "TRASH" ? (
                <>
                  <button
                    onClick={() => handleBulkAction("publish")}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-medium cursor-pointer"
                  >
                    Yayınla
                  </button>
                  <button
                    onClick={() => handleBulkAction("draft")}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-xs font-medium cursor-pointer"
                  >
                    Taslağa Al
                  </button>
                  <button
                    onClick={() => handleBulkAction("trash")}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-xs font-medium cursor-pointer"
                  >
                    Çöpe At
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleBulkAction("draft")}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-medium cursor-pointer"
                >
                  Geri Yükle
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search input (PG-L-03) */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Başlık veya bağlantı ara..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-border text-xs text-cream focus:border-gold focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-cream"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Pages Table ── */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-bg-secondary/60 border-b border-border text-text-muted uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      displayList.length > 0 &&
                      selectedIds.length === displayList.length
                    }
                    onChange={(e) =>
                      setSelectedIds(
                        e.target.checked ? displayList.map((p) => p.id) : []
                      )
                    }
                    className="rounded border-border accent-gold cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => {
                    setSortBy("title");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-gold transition-colors"
                >
                  Başlık & Bağlantı
                </th>
                <th className="py-3 px-4 w-28">Durum</th>
                <th className="py-3 px-4 w-28">Yazar</th>
                <th
                  onClick={() => {
                    setSortBy("menuOrder");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                  className="py-3 px-4 w-20 cursor-pointer hover:text-gold transition-colors"
                >
                  Sıra
                </th>
                <th
                  onClick={() => {
                    setSortBy("updatedAt");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                  className="py-3 px-4 w-36 cursor-pointer hover:text-gold transition-colors"
                >
                  Son Değişiklik
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    {searchQuery ? (
                      <div className="space-y-1">
                        <p className="text-cream font-medium">Aramayla eşleşen sayfa bulunamadı</p>
                        <p className="text-[11px] text-text-muted">Farklı bir kelime deneyin veya filtreyi temizleyin.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <FileText className="w-8 h-8 text-text-muted mx-auto opacity-50" />
                        <p className="text-cream font-medium">Henüz bu sekmede sayfa bulunmuyor</p>
                        <Link
                          href="/admin/sayfalar/yeni"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gold/15 text-gold border border-gold/30 text-xs font-semibold hover:bg-gold/25 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Yeni Sayfa Oluştur</span>
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                displayList.map((page) => {
                  const isQuickEditing = quickEditingId === page.id;
                  const isSelected = selectedIds.includes(page.id);
                  const isChild = Boolean(page.parentId);

                  return (
                    <tr
                      key={page.id}
                      className={`group hover:bg-surface/80 transition-colors ${
                        isSelected ? "bg-gold/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 align-top">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            setSelectedIds(
                              e.target.checked
                                ? [...selectedIds, page.id]
                                : selectedIds.filter((id) => id !== page.id)
                            )
                          }
                          className="rounded border-border accent-gold cursor-pointer mt-1"
                        />
                      </td>

                      {/* Title & Quick Edit Container */}
                      <td className="py-3.5 px-4 align-top">
                        {isQuickEditing ? (
                          /* Quick Edit Row (PG-L-05) */
                          <div className="space-y-3 p-3 bg-bg-secondary rounded-xl border border-gold/30 my-1">
                            <div className="font-semibold text-gold text-xs flex items-center gap-1.5">
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Hızlı Düzenle: {page.title}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[11px] text-text-muted block mb-1">
                                  Sayfa Başlığı
                                </label>
                                <input
                                  type="text"
                                  value={quickForm.title}
                                  onChange={(e) =>
                                    setQuickForm({ ...quickForm, title: e.target.value })
                                  }
                                  className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-cream"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] text-text-muted block mb-1">
                                  Kalıcı Bağlantı (Slug)
                                </label>
                                <input
                                  type="text"
                                  value={quickForm.slug}
                                  placeholder="kök sayfa için boş bırakın"
                                  onChange={(e) =>
                                    setQuickForm({ ...quickForm, slug: e.target.value })
                                  }
                                  className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-cream"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] text-text-muted block mb-1">
                                  Durum
                                </label>
                                <select
                                  disabled={page.isSystem}
                                  value={quickForm.status}
                                  onChange={(e) =>
                                    setQuickForm({
                                      ...quickForm,
                                      status: e.target.value as PageStatus,
                                    })
                                  }
                                  className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-cream disabled:opacity-50"
                                >
                                  <option value="DRAFT">Taslak</option>
                                  <option value="PENDING_REVIEW">İncelemede</option>
                                  <option value="SCHEDULED">Zamanlanmış</option>
                                  <option value="PUBLISHED">Yayında</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[11px] text-text-muted block mb-1">
                                  Menü Sırası
                                </label>
                                <input
                                  type="number"
                                  value={quickForm.menuOrder}
                                  onChange={(e) =>
                                    setQuickForm({
                                      ...quickForm,
                                      menuOrder: parseInt(e.target.value, 10) || 0,
                                    })
                                  }
                                  className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-cream"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                onClick={() => setQuickEditingId(null)}
                                className="px-3 py-1.5 rounded-lg border border-border text-xs text-text-secondary hover:text-cream cursor-pointer"
                              >
                                İptal
                              </button>
                              <button
                                onClick={handleSaveQuickEdit}
                                disabled={isPending}
                                className="px-4 py-1.5 rounded-lg bg-gold text-bg-primary text-xs font-semibold hover:opacity-90 cursor-pointer"
                              >
                                {isPending ? "Kaydediliyor..." : "Kaydet"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Normal Row Display */
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isChild && (
                                <CornerDownRight className="w-3.5 h-3.5 text-gold shrink-0 ml-2" />
                              )}

                              <Link
                                href={`/admin/sayfalar/${page.id}`}
                                className="font-semibold text-cream hover:text-gold transition-colors text-sm"
                              >
                                {page.title}
                              </Link>

                              {/* System page badge (PG-L-10) */}
                              {page.isSystem && (
                                <span className="px-2 py-0.2 rounded text-[10px] bg-gold/15 text-gold font-medium border border-gold/30">
                                  Sistem Sayfası
                                </span>
                              )}

                              {/* Active Lock badge (PG-L-11) */}
                              {page.lock && (
                                <span className="px-2 py-0.2 rounded text-[10px] bg-rose-500/15 text-rose-400 font-medium border border-rose-500/30 flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>{page.lock.userName} düzenliyor</span>
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-text-muted flex items-center gap-2">
                              <span>/{page.slug === "anasayfa" || !page.slug ? "" : page.slug}</span>
                              {page.template !== "default" && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">{page.template} şablonu</span>
                                </>
                              )}
                            </div>

                            {/* Row Action Buttons (PG-L-04) */}
                            <div className="flex items-center gap-3 pt-1 text-[11px] opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              {activeTab !== "TRASH" ? (
                                <>
                                  <Link
                                    href={`/admin/sayfalar/${page.id}`}
                                    className="text-gold hover:underline font-medium"
                                  >
                                    Düzenle
                                  </Link>
                                  <button
                                    onClick={() => startQuickEdit(page)}
                                    className="text-text-secondary hover:text-cream cursor-pointer"
                                  >
                                    Hızlı Düzenle
                                  </button>
                                  <button
                                    onClick={() => handleClone(page.id)}
                                    className="text-text-secondary hover:text-cream cursor-pointer"
                                  >
                                    Kopyala
                                  </button>
                                  {!page.isSystem && (
                                    <button
                                      onClick={() => handleTrashClick(page)}
                                      className="text-rose-400 hover:underline cursor-pointer"
                                    >
                                      Çöpe At
                                    </button>
                                  )}
                                  <a
                                    href={`/${page.slug === "anasayfa" || !page.slug ? "" : page.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-text-secondary hover:text-cream inline-flex items-center gap-0.5"
                                  >
                                    <span>{page.status === "PUBLISHED" ? "Görüntüle" : "Önizle"}</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleRestore(page.id)}
                                    className="text-emerald-400 hover:underline font-medium cursor-pointer"
                                  >
                                    Geri Yükle
                                  </button>
                                  {!page.isSystem && (
                                    <button
                                      onClick={() => handlePermanentDelete(page.id, page.title)}
                                      className="text-rose-400 hover:underline cursor-pointer"
                                    >
                                      Kalıcı Olarak Sil
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-top">
                        {getStatusBadge(page.status, page.scheduledAt)}
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 align-top text-text-secondary">
                        {page.authorName || "Yönetici"}
                      </td>

                      {/* Menu Order */}
                      <td className="py-3.5 px-4 align-top text-text-muted font-mono">
                        {page.menuOrder}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 align-top text-text-secondary">
                        <div>
                          {new Date(page.updatedAt).toLocaleDateString("tr-TR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          {new Date(page.updatedAt).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Hierarchy Trash Modal (PG-L-07) ── */}
      {trashPromptPage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-secondary border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-elevated">
            <div className="flex items-center gap-2 text-gold">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-heading text-cream">
                Alt Sayfalar Bulundu
              </h3>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              &quot;{trashPromptPage.title}&quot; sayfasının altında bağlı alt sayfalar bulunmaktadır. Nasıl işlem yapmak istersiniz?
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => executeTrash(trashPromptPage.id, true)}
                className="w-full py-2.5 px-4 rounded-xl bg-surface border border-gold/40 text-gold text-xs font-semibold hover:bg-gold/10 transition-colors text-left"
              >
                Alt sayfalar bir üst seviyeye çıksın (Önerilen)
              </button>
              <button
                onClick={() => executeTrash(trashPromptPage.id, false)}
                className="w-full py-2.5 px-4 rounded-xl bg-surface border border-border text-text-secondary text-xs hover:text-cream transition-colors text-left"
              >
                Yalnızca bu sayfayı çöpe at (Alt sayfalar bağlı kalsın)
              </button>
              <button
                onClick={() => setTrashPromptPage(null)}
                className="w-full py-2 text-center text-xs text-text-muted hover:text-cream"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
