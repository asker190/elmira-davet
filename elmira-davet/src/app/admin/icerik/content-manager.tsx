"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  saveHall,
  deleteHall,
  savePackage,
  deletePackage,
  togglePackageActive,
  saveMenu,
  deleteMenu,
  saveEventType,
  deleteEventType,
  saveFaq,
  deleteFaq,
  saveTestimonial,
  deleteTestimonial,
  saveCustomStats,
  saveCustomFeatures,
} from "../actions";
import {
  Building2,
  Package as PackageIcon,
  UtensilsCrossed,
  Sparkles,
  MessageSquareQuote,
  HelpCircle,
  Plus,
  Trash2,
  Check,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Edit2,
  X,
  Star,
  Calculator,
  Award,
  Save,
  Gem,
  Car,
  Music,
  HeartHandshake,
  MapPin,
} from "lucide-react";
import { ImageCropUpload } from "@/components/admin/ui/image-crop-upload";

interface ContentManagerProps {
  initialHalls: any[];
  initialPackages: any[];
  initialMenus: any[];
  initialEvents: any[];
  initialFaqs: any[];
  initialTestimonials: any[];
  initialStats?: any[];
  initialFeatures?: any;
}

export function ContentManager({
  initialHalls,
  initialPackages,
  initialMenus,
  initialEvents,
  initialFaqs,
  initialTestimonials,
  initialStats,
  initialFeatures,
}: ContentManagerProps) {
  const [activeTab, setActiveTab] = useState<
    "halls" | "stats" | "features" | "packages" | "menus" | "events" | "testimonials" | "faqs"
  >("halls");

  // State collections
  const [halls, setHalls] = useState(initialHalls);
  const [packages, setPackages] = useState(initialPackages);
  const [menus, setMenus] = useState(initialMenus);
  const [events, setEvents] = useState(initialEvents);
  const [faqs, setFaqs] = useState(initialFaqs);
  const [testimonials, setTestimonials] = useState(initialTestimonials);

  // Stats State & Handlers
  const [stats, setStats] = useState<any[]>(initialStats || []);
  const [isSavingStats, setIsSavingStats] = useState(false);

  const handleSaveStats = async () => {
    setIsSavingStats(true);
    try {
      const res = await saveCustomStats(stats);
      if (res.success) {
        toast.success("Sayaçlar ve istatistikler başarıyla kaydedildi!");
      } else {
        toast.error("Sayaçlar kaydedilemedi.");
      }
    } catch {
      toast.error("Bağlantı hatası oluştu.");
    } finally {
      setIsSavingStats(false);
    }
  };

  // Features & Highlights State & Handlers (about-heading / Neden Elmira Davet?)
  const [featuresData, setFeaturesData] = useState<any>(
    initialFeatures || {
      badge: "Gaziosmanpaşa Merkezde Prestijli Konum",
      title: "Bölgenin Standartlarını Zarafetle Yeniden Belirliyoruz",
      description:
        "Elmira Davet Salonu olarak, hayatınızın en özel anlarını unutulmaz kılmak için İstanbul Gaziosmanpaşa'da hizmetinizdeyiz. 600 kişilik lüks Kristal Salonumuz ve 300 kişilik büyüleyici Kır Bahçemiz ile aşkınızın en güzel hikayesine ev sahipliği yapıyoruz.",
      buttonText: "Hakkımızda Daha Fazla Bilgi",
      buttonLink: "/hakkimizda",
      items: [],
      showcase: {
        imageUrl: "",
        locationBadge: "İstanbul - Gaziosmanpaşa",
        title: "Unutulmaz Düğünler, Kusursuz Masallar",
        buttonText: "Galeri",
        buttonLink: "/galeri",
      },
    }
  );
  const [isSavingFeatures, setIsSavingFeatures] = useState(false);

  const handleSaveFeatures = async () => {
    setIsSavingFeatures(true);
    try {
      const res = await saveCustomFeatures(featuresData);
      if (res.success) {
        toast.success("Ayrıcalıklar ve vitrin bilgileri başarıyla kaydedildi!");
      } else {
        toast.error("Ayrıcalıklar kaydedilemedi.");
      }
    } catch {
      toast.error("Bağlantı hatası oluştu.");
    } finally {
      setIsSavingFeatures(false);
    }
  };

  // Modal / Editing state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields for each entity
  const [hallForm, setHallForm] = useState({
    name: "",
    slug: "",
    capacity: "",
    area: "",
    tagline: "",
    description: "",
    imageUrl: "",
    features: "",
  });

  const [packageForm, setPackageForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    priceLabel: "",
    isFeatured: false,
    features: "",
  });

  const [menuForm, setMenuForm] = useState({
    name: "",
    category: "Sıcak Yemekli Menü",
    description: "",
    price: "",
    items: "",
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    slug: "",
    desc: "",
    capacity: "",
    iconName: "Heart",
    imageUrl: "",
  });

  const [faqForm, setFaqForm] = useState({
    q: "",
    a: "",
    category: "Genel",
  });

  const [testimonialForm, setTestimonialForm] = useState({
    name: "",
    eventType: "Kristal Salon Düğünü",
    content: "",
    rating: 5,
  });

  // ─── Modal Open / Edit Helpers ──────────────────────────

  const openCreateModal = () => {
    setEditingItem(null);
    if (activeTab === "halls") {
      setHallForm({
        name: "",
        slug: "",
        capacity: "",
        area: "",
        tagline: "",
        description: "",
        imageUrl: "",
        features: "",
      });
    } else if (activeTab === "packages") {
      setPackageForm({
        name: "",
        slug: "",
        description: "",
        price: "",
        priceLabel: "",
        isFeatured: false,
        features: "",
      });
    } else if (activeTab === "menus") {
      setMenuForm({
        name: "",
        category: "Sıcak Yemekli Menü",
        description: "",
        price: "",
        items: "",
      });
    } else if (activeTab === "events") {
      setEventForm({
        title: "",
        slug: "",
        desc: "",
        capacity: "",
        iconName: "Heart",
        imageUrl: "",
      });
    } else if (activeTab === "faqs") {
      setFaqForm({
        q: "",
        a: "",
        category: "Genel",
      });
    } else if (activeTab === "testimonials") {
      setTestimonialForm({
        name: "",
        eventType: "Kristal Salon Düğünü",
        content: "",
        rating: 5,
      });
    }
    setShowModal(true);
  };

  const openEditModal = (item: any, tab: "halls" | "packages" | "menus" | "events" | "testimonials" | "faqs") => {
    setEditingItem(item);
    setActiveTab(tab);
    if (tab === "halls") {
      setHallForm({
        name: item.name || "",
        slug: item.slug || "",
        capacity: item.capacity || "",
        area: item.area || "",
        tagline: item.tagline || "",
        description: item.description || "",
        imageUrl: item.imageUrl || "",
        features: Array.isArray(item.features) ? item.features.join("\n") : (item.features || ""),
      });
    } else if (tab === "packages") {
      const featStr = Array.isArray(item.features)
        ? item.features.map((f: any) => (typeof f === "string" ? f : f.text)).join("\n")
        : "";
      setPackageForm({
        name: item.name || "",
        slug: item.slug || "",
        description: item.description || "",
        price: item.price !== null && item.price !== undefined ? String(item.price) : "",
        priceLabel: item.priceLabel || "",
        isFeatured: Boolean(item.isFeatured),
        features: featStr,
      });
    } else if (tab === "menus") {
      setMenuForm({
        name: item.name || "",
        category: item.category || "Sıcak Yemekli Menü",
        description: item.description || "",
        price: item.price !== null && item.price !== undefined ? String(item.price) : "",
        items: Array.isArray(item.items) ? item.items.join("\n") : "",
      });
    } else if (tab === "events") {
      setEventForm({
        title: item.title || "",
        slug: item.slug || "",
        desc: item.desc || "",
        capacity: item.capacity || "",
        iconName: item.iconName || "Heart",
        imageUrl: item.imageUrl || "",
      });
    } else if (tab === "faqs") {
      setFaqForm({
        q: item.q || "",
        a: item.a || "",
        category: item.category || "Genel",
      });
    } else if (tab === "testimonials") {
      setTestimonialForm({
        name: item.name || "",
        eventType: item.eventType || "",
        content: item.content || "",
        rating: Number(item.rating) || 5,
      });
    }
    setShowModal(true);
  };

  // ─── Submit Handlers ────────────────────────────────────

  const handleSubmitHall = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const featuresArr = hallForm.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        id: editingItem?.id,
        ...hallForm,
        slug: hallForm.slug || hallForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        features: featuresArr,
        isActive: true,
      };

      const res = await saveHall(payload);

      if (res.success) {
        if (editingItem) {
          setHalls(halls.map((h) => (h.id === editingItem.id ? res.item || { ...h, ...payload } : h)));
          toast.success("Salon başarıyla güncellendi!");
        } else {
          setHalls([...halls, res.item || { ...payload, id: "hall_" + Date.now() }]);
          toast.success("Salon başarıyla eklendi!");
        }
        setShowModal(false);
        setEditingItem(null);
      } else {
        toast.error(res.error || "Hata oluştu.");
      }
    } catch {
      toast.error("İşlem sırasında bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const featuresArr = packageForm.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        id: editingItem?.id,
        name: packageForm.name,
        slug: packageForm.slug || packageForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: packageForm.description,
        price: packageForm.price ? Number(packageForm.price) : null,
        priceLabel: packageForm.priceLabel || null,
        isFeatured: packageForm.isFeatured,
        features: featuresArr,
      };

      const res = await savePackage(payload);

      if (res.success) {
        if (editingItem) {
          setPackages(packages.map((p) => (p.id === editingItem.id ? res.item || { ...p, ...payload } : p)));
          toast.success("Paket başarıyla güncellendi!");
        } else {
          setPackages([...packages, res.item || { ...payload, id: "pkg_" + Date.now() }]);
          toast.success("Paket başarıyla eklendi!");
        }
        setShowModal(false);
        setEditingItem(null);
      } else {
        toast.error(res.error || "Geçersiz paket verisi.");
      }
    } catch {
      toast.error("Paket kaydedilirken hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const itemsArr = menuForm.items
        .split("\n")
        .map((i) => i.trim())
        .filter(Boolean);

      const payload = {
        id: editingItem?.id,
        name: menuForm.name,
        category: menuForm.category,
        description: menuForm.description,
        price: menuForm.price ? Number(menuForm.price) : null,
        items: itemsArr,
        isActive: true,
      };

      const res = await saveMenu(payload);

      if (res.success) {
        if (editingItem) {
          setMenus(menus.map((m) => (m.id === editingItem.id ? res.item || { ...m, ...payload } : m)));
          toast.success("Menü başarıyla güncellendi!");
        } else {
          setMenus([...menus, res.item || { ...payload, id: "menu_" + Date.now() }]);
          toast.success("Menü başarıyla eklendi!");
        }
        setShowModal(false);
        setEditingItem(null);
      } else {
        toast.error(res.error || "Hata oluştu.");
      }
    } catch {
      toast.error("Menü kaydedilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        id: editingItem?.id,
        title: eventForm.title,
        slug: eventForm.slug || eventForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        desc: eventForm.desc,
        capacity: eventForm.capacity,
        iconName: eventForm.iconName,
        imageUrl: eventForm.imageUrl,
        isActive: true,
      };

      const res = await saveEventType(payload);

      if (res.success) {
        if (editingItem) {
          setEvents(events.map((ev) => (ev.id === editingItem.id ? res.item || { ...ev, ...payload } : ev)));
          toast.success("Etkinlik türü başarıyla güncellendi!");
        } else {
          setEvents([...events, res.item || { ...payload, id: "ev_" + Date.now() }]);
          toast.success("Etkinlik türü başarıyla eklendi!");
        }
        setShowModal(false);
        setEditingItem(null);
      } else {
        toast.error(res.error || "Hata oluştu.");
      }
    } catch {
      toast.error("Etkinlik türü kaydedilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        id: editingItem?.id,
        q: faqForm.q,
        a: faqForm.a,
        category: faqForm.category,
        isActive: true,
      };

      const res = await saveFaq(payload);

      if (res.success) {
        if (editingItem) {
          setFaqs(faqs.map((f) => (f.id === editingItem.id ? res.item || { ...f, ...payload } : f)));
          toast.success("SSS maddesi başarıyla güncellendi!");
        } else {
          setFaqs([...faqs, res.item || { ...payload, id: "faq_" + Date.now() }]);
          toast.success("SSS maddesi eklendi!");
        }
        setShowModal(false);
        setEditingItem(null);
      } else {
        toast.error(res.error || "Hata oluştu.");
      }
    } catch {
      toast.error("SSS kaydedilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        id: editingItem?.id,
        name: testimonialForm.name,
        eventType: testimonialForm.eventType,
        content: testimonialForm.content,
        rating: Number(testimonialForm.rating),
      };

      const res = await saveTestimonial(payload);

      if (res.success) {
        if (editingItem) {
          setTestimonials(
            testimonials.map((t) => (t.id === editingItem.id ? res.item || { ...t, ...payload } : t))
          );
          toast.success("Yorum başarıyla güncellendi!");
        } else {
          setTestimonials([res.item || { ...payload, id: "testi_" + Date.now() }, ...testimonials]);
          toast.success("Yorum başarıyla eklendi!");
        }
        setShowModal(false);
        setEditingItem(null);
      } else {
        toast.error(res.error || "Hata oluştu.");
      }
    } catch {
      toast.error("Yorum kaydedilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Move Item Up/Down (Reorder simulation)
  const moveItem = (list: any[], setList: Function, index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const updated = [...list];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setList(updated);
    toast.success("Sıralama güncellendi!");
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading text-cream">İçerik Yönetimi</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Salonlar, menüler, paketler, etkinlik türleri ve sıkça sorulan soruları ekleyin, düzenleyin ve silin.
          </p>
        </div>

        {activeTab !== "stats" && activeTab !== "features" && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider shadow-gold hover:opacity-95 transition-opacity flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeTab === "halls" && "Yeni Salon Ekle"}
              {activeTab === "packages" && "Yeni Paket Ekle"}
              {activeTab === "menus" && "Yeni Menü Ekle"}
              {activeTab === "events" && "Yeni Etkinlik Türü"}
              {activeTab === "testimonials" && "Yeni Yorum Ekle"}
              {activeTab === "faqs" && "Yeni SSS Ekle"}
            </span>
          </button>
        )}
      </div>

      {/* ── Module Tabs ── */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-bg-secondary border border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab("halls")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "halls"
              ? "bg-surface text-gold border border-gold/30 shadow-xs"
              : "text-text-secondary hover:text-cream"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Salonlar ({halls.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("stats")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "stats"
              ? "bg-surface text-gold border border-gold/30 shadow-xs"
              : "text-text-secondary hover:text-cream"
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Sayaçlar ({stats.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("features")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "features"
              ? "bg-surface text-gold border border-gold/30 shadow-xs"
              : "text-text-secondary hover:text-cream"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Ayrıcalıklar & Hakkımızda</span>
        </button>

        <button
          onClick={() => setActiveTab("packages")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "packages"
              ? "bg-surface text-gold border border-gold/30 shadow-xs"
              : "text-text-secondary hover:text-cream"
          }`}
        >
          <PackageIcon className="w-3.5 h-3.5" />
          <span>Paketler ({packages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("menus")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "menus"
              ? "bg-surface text-gold border border-gold/30 shadow-xs"
              : "text-text-secondary hover:text-cream"
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Menüler ({menus.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("events")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "events"
              ? "bg-surface text-gold border border-gold/30 shadow-xs"
              : "text-text-secondary hover:text-cream"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Etkinlik Türleri ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("testimonials")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "testimonials"
              ? "bg-surface text-gold border border-gold/30 shadow-xs"
              : "text-text-secondary hover:text-cream"
          }`}
        >
          <MessageSquareQuote className="w-3.5 h-3.5" />
          <span>Yorumlar ({testimonials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("faqs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "faqs"
              ? "bg-surface text-gold border border-gold/30 shadow-xs"
              : "text-text-secondary hover:text-cream"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>SSS ({faqs.length})</span>
        </button>
      </div>

      {/* ── TAB 1: SALONLAR ── */}
      {activeTab === "halls" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {halls.map((hall, idx) => (
            <div
              key={hall.id || idx}
              className="p-6 rounded-2xl bg-bg-secondary border border-border flex flex-col justify-between space-y-4 hover:border-gold/30 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gold font-medium block">
                      {hall.tagline}
                    </span>
                    <h3 className="text-xl font-heading text-cream font-bold mt-0.5">
                      {hall.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Yayında
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="text-cream font-medium">{hall.capacity}</span>
                  <span>•</span>
                  <span>{hall.area}</span>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {hall.description}
                </p>

                {hall.features && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {(Array.isArray(hall.features) ? hall.features : []).map((f: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-1 rounded-lg bg-surface border border-border text-text-secondary"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-text-muted">
                  <button
                    onClick={() => moveItem(halls, setHalls, idx, "up")}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-surface disabled:opacity-30 cursor-pointer"
                    title="Yukarı Taşı"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveItem(halls, setHalls, idx, "down")}
                    disabled={idx === halls.length - 1}
                    className="p-1 rounded hover:bg-surface disabled:opacity-30 cursor-pointer"
                    title="Aşağı Taşı"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(hall, "halls")}
                    className="p-1.5 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 transition-colors cursor-pointer"
                    title="Düzenle"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`"${hall.name}" salonunu silmek istediğinize emin misiniz?`)) {
                        await deleteHall(hall.id);
                        setHalls(halls.filter((h) => h.id !== hall.id));
                        toast.success("Salon silindi.");
                      }
                    }}
                    className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: SAYAÇLAR & İSTATİSTİKLER ── */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-bg-secondary border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-heading text-cream font-bold">
                Ana Sayfa Sayaçları (Rakamlarla Elmira)
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Hero bölümünün hemen altında ziyaretçileri karşılayan 4 adet güven ve tecrübe istatistiğini düzenleyin.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveStats}
              disabled={isSavingStats}
              className="px-4 py-2 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider shadow-gold hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingStats ? "Kaydediliyor..." : "Sayaçları Kaydet"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((st, idx) => (
              <div
                key={st.id || idx}
                className="p-5 rounded-2xl bg-bg-secondary border border-border space-y-4 hover:border-gold/30 transition-colors shadow-card"
              >
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs font-heading text-gold font-bold">
                    Sayaç #{idx + 1}
                  </span>
                  <div className="text-sm font-heading text-cream">
                    Önizleme: <span className="text-gradient-gold font-bold">{st.prefix}{st.value}{st.suffix}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-text-secondary mb-1">
                      Ön Ek
                    </label>
                    <input
                      type="text"
                      value={st.prefix || ""}
                      onChange={(e) => {
                        const copy = [...stats];
                        copy[idx] = { ...copy[idx], prefix: e.target.value };
                        setStats(copy);
                      }}
                      placeholder="%"
                      className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-cream text-xs focus:border-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-text-secondary mb-1">
                      Sayısal Değer *
                    </label>
                    <input
                      type="number"
                      value={st.value}
                      onChange={(e) => {
                        const copy = [...stats];
                        copy[idx] = { ...copy[idx], value: Number(e.target.value) || 0 };
                        setStats(copy);
                      }}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-cream text-xs focus:border-gold outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-text-secondary mb-1">
                      Son Ek
                    </label>
                    <input
                      type="text"
                      value={st.suffix || ""}
                      onChange={(e) => {
                        const copy = [...stats];
                        copy[idx] = { ...copy[idx], suffix: e.target.value };
                        setStats(copy);
                      }}
                      placeholder="+ veya Kişi"
                      className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-cream text-xs focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-text-secondary mb-1">
                    Ana Başlık / Etiket *
                  </label>
                  <input
                    type="text"
                    value={st.label}
                    onChange={(e) => {
                      const copy = [...stats];
                      copy[idx] = { ...copy[idx], label: e.target.value };
                      setStats(copy);
                    }}
                    placeholder="Örn: Mutlu Düğün & Davet"
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-cream text-xs focus:border-gold outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-text-secondary mb-1">
                    Alt Açıklama
                  </label>
                  <input
                    type="text"
                    value={st.sublabel || ""}
                    onChange={(e) => {
                      const copy = [...stats];
                      copy[idx] = { ...copy[idx], sublabel: e.target.value };
                      setStats(copy);
                    }}
                    placeholder="Örn: Gaziosmanpaşa'da unutulmaz tecrübe"
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-cream text-xs focus:border-gold outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: AYRICALIKLAR & AVANTAJLAR ── */}
      {activeTab === "features" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-bg-secondary border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-heading text-cream font-bold">
                Neden Elmira Davet? (Hakkımızda & Ayrıcalıklar & Vitrin - about-heading)
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Ana sayfadaki Hakkımızda & Ayrıcalıklar bölümünün rozet, başlık, açıklama metni, butonları, 4 özellik kartını ve vitrin görselini düzenleyin.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveFeatures}
              disabled={isSavingFeatures}
              className="px-4 py-2 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider shadow-gold hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingFeatures ? "Kaydediliyor..." : "Ayrıcalıkları Kaydet"}</span>
            </button>
          </div>

          {/* Section Headers & About Text */}
          <div className="p-5 rounded-2xl bg-bg-secondary border border-border space-y-4">
            <h4 className="text-xs uppercase tracking-wider text-gold font-bold">
              Bölüm Rozet, Başlık & Hakkımızda Metni
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-text-secondary mb-1">
                  Konum Rozeti Metni
                </label>
                <input
                  type="text"
                  value={featuresData.badge || ""}
                  onChange={(e) =>
                    setFeaturesData({ ...featuresData, badge: e.target.value })
                  }
                  placeholder="Örn: Gaziosmanpaşa Merkezde Prestijli Konum"
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-cream text-xs focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-text-secondary mb-1">
                  Bölüm Ana Başlığı (about-heading)
                </label>
                <input
                  type="text"
                  value={featuresData.title || ""}
                  onChange={(e) =>
                    setFeaturesData({ ...featuresData, title: e.target.value })
                  }
                  placeholder="Bölgenin Standartlarını Zarafetle Yeniden Belirliyoruz"
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-cream text-xs focus:border-gold outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] uppercase tracking-wider text-text-secondary mb-1">
                  Hakkımızda / Tanıtım Açıklama Metni (Ana Sayfada Başlığın Altındaki Paragraf)
                </label>
                <textarea
                  rows={3}
                  value={featuresData.description || ""}
                  onChange={(e) =>
                    setFeaturesData({ ...featuresData, description: e.target.value })
                  }
                  placeholder="Elmira Davet Salonu olarak, hayatınızın en özel anlarını unutulmaz kılmak için İstanbul Gaziosmanpaşa'da hizmetinizdeyiz..."
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-cream text-xs focus:border-gold outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-text-secondary mb-1">
                  Hakkımızda Buton Metni
                </label>
                <input
                  type="text"
                  value={featuresData.buttonText || ""}
                  onChange={(e) =>
                    setFeaturesData({ ...featuresData, buttonText: e.target.value })
                  }
                  placeholder="Hakkımızda Daha Fazla Bilgi"
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-cream text-xs focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-text-secondary mb-1">
                  Hakkımızda Buton Bağlantısı
                </label>
                <input
                  type="text"
                  value={featuresData.buttonLink || ""}
                  onChange={(e) =>
                    setFeaturesData({ ...featuresData, buttonLink: e.target.value })
                  }
                  placeholder="/hakkimizda"
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-cream text-xs focus:border-gold outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4 Feature Items */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-gold font-bold">
              4 Ayrıcalık Kartı
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(featuresData.items || []).map((feat: any, fIdx: number) => (
                <div
                  key={feat.id || fIdx}
                  className="p-4 rounded-2xl bg-bg-secondary border border-border space-y-3 shadow-card"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-xs font-heading text-cream font-semibold">
                      Kart #{fIdx + 1}
                    </span>
                    <select
                      value={feat.icon || "gem"}
                      onChange={(e) => {
                        const items = [...(featuresData.items || [])];
                        items[fIdx] = { ...items[fIdx], icon: e.target.value };
                        setFeaturesData({ ...featuresData, items });
                      }}
                      className="px-2.5 py-1 bg-surface border border-border rounded-lg text-gold text-xs outline-none"
                    >
                      <option value="gem">Mücevher (Kristal Avizeler)</option>
                      <option value="car">Araç (Otopark & Vale)</option>
                      <option value="music">Müzik (Akustik & Sahne)</option>
                      <option value="heart">Kalp (Gelin & Damat Süiti)</option>
                      <option value="sparkles">Yıldız (Lüks İkram)</option>
                      <option value="shield">Kalkan (Güvenlik)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-text-secondary mb-1">
                      Kart Başlığı
                    </label>
                    <input
                      type="text"
                      value={feat.title || ""}
                      onChange={(e) => {
                        const items = [...(featuresData.items || [])];
                        items[fIdx] = { ...items[fIdx], title: e.target.value };
                        setFeaturesData({ ...featuresData, items });
                      }}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-cream text-xs focus:border-gold outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-text-secondary mb-1">
                      Açıklama Metni
                    </label>
                    <textarea
                      rows={2}
                      value={feat.description || ""}
                      onChange={(e) => {
                        const items = [...(featuresData.items || [])];
                        items[fIdx] = { ...items[fIdx], description: e.target.value };
                        setFeaturesData({ ...featuresData, items });
                      }}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-cream text-xs focus:border-gold outline-none resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Showcase Box */}
          <div className="p-5 rounded-2xl bg-bg-secondary border border-border space-y-4">
            <h4 className="text-xs uppercase tracking-wider text-gold font-bold">
              Sağ Vitrin Görseli ve Bilgi Kutusu
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-full">
                <ImageCropUpload
                  label="Vitrin Görseli (Bilgisayardan Yükle / Kırp)"
                  description="Bölümün sağında yer alan büyük vitrin görselini seçin. 4:3 veya 16:9 oranında kırparak anında kaydedin."
                  value={featuresData.showcase?.imageUrl || ""}
                  onChange={(url) =>
                    setFeaturesData({
                      ...featuresData,
                      showcase: { ...(featuresData.showcase || {}), imageUrl: url },
                    })
                  }
                  aspectRatio="4/3"
                  category="Ayrıcalıklar"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-text-secondary mb-1">
                  Vitrin Üst Konum Rozeti
                </label>
                <input
                  type="text"
                  value={featuresData.showcase?.locationBadge || ""}
                  onChange={(e) =>
                    setFeaturesData({
                      ...featuresData,
                      showcase: {
                        ...(featuresData.showcase || {}),
                        locationBadge: e.target.value,
                      },
                    })
                  }
                  placeholder="İstanbul - Gaziosmanpaşa"
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-cream text-xs focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-text-secondary mb-1">
                  Vitrin Başlığı
                </label>
                <input
                  type="text"
                  value={featuresData.showcase?.title || ""}
                  onChange={(e) =>
                    setFeaturesData({
                      ...featuresData,
                      showcase: {
                        ...(featuresData.showcase || {}),
                        title: e.target.value,
                      },
                    })
                  }
                  placeholder="Unutulmaz Düğünler, Kusursuz Masallar"
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-cream text-xs focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-text-secondary mb-1">
                  Buton Metni
                </label>
                <input
                  type="text"
                  value={featuresData.showcase?.buttonText || ""}
                  onChange={(e) =>
                    setFeaturesData({
                      ...featuresData,
                      showcase: {
                        ...(featuresData.showcase || {}),
                        buttonText: e.target.value,
                      },
                    })
                  }
                  placeholder="Galeri"
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-cream text-xs focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-text-secondary mb-1">
                  Buton Bağlantısı (Link)
                </label>
                <input
                  type="text"
                  value={featuresData.showcase?.buttonLink || ""}
                  onChange={(e) =>
                    setFeaturesData({
                      ...featuresData,
                      showcase: {
                        ...(featuresData.showcase || {}),
                        buttonLink: e.target.value,
                      },
                    })
                  }
                  placeholder="/galeri"
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-cream text-xs focus:border-gold outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PAKETLER ── */}
      {activeTab === "packages" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg, idx) => (
            <div
              key={pkg.id || idx}
              className="p-6 rounded-2xl bg-bg-secondary border border-border flex flex-col justify-between space-y-4 hover:border-gold/30 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-heading text-cream font-bold">
                    {pkg.name}
                  </h3>
                  {pkg.isFeatured && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30 font-semibold">
                      Öne Çıkan
                    </span>
                  )}
                </div>

                <div className="text-xl font-heading text-gradient-gold font-bold">
                  {pkg.priceLabel || (pkg.price ? `₺${Number(pkg.price).toLocaleString("tr-TR")}` : "Özel Teklif")}
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {pkg.description}
                </p>

                <ul className="space-y-1.5 pt-2 text-xs text-text-secondary">
                  {(pkg.features || []).map((f: any, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span>{typeof f === "string" ? f : f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                <button
                  onClick={async () => {
                    await togglePackageActive(pkg.id, !pkg.isActive);
                    setPackages(
                      packages.map((p) =>
                        p.id === pkg.id ? { ...p, isActive: !p.isActive } : p
                      )
                    );
                    toast.success("Paket durumu güncellendi.");
                  }}
                  className="flex items-center gap-1.5 text-text-muted hover:text-cream cursor-pointer"
                >
                  {pkg.isActive ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Yayında</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-text-muted" />
                      <span>Taslak</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(pkg, "packages")}
                    className="p-1.5 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 transition-colors cursor-pointer"
                    title="Düzenle"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`"${pkg.name}" paketini silmek istediğinize emin misiniz?`)) {
                        await deletePackage(pkg.id);
                        setPackages(packages.filter((p) => p.id !== pkg.id));
                        toast.success("Paket silindi.");
                      }
                    }}
                    className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 3: MENÜLER ── */}
      {activeTab === "menus" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu, idx) => (
            <div
              key={menu.id || idx}
              className="p-6 rounded-2xl bg-bg-secondary border border-border flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-gold/10 text-gold border border-gold/20 font-medium">
                    {menu.category}
                  </span>
                  {menu.price && (
                    <span className="text-sm font-heading font-bold text-cream">
                      ₺{Number(menu.price).toLocaleString("tr-TR")}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-heading text-cream font-bold">
                  {menu.name}
                </h3>

                {menu.description && (
                  <p className="text-xs text-text-muted leading-relaxed">
                    {menu.description}
                  </p>
                )}

                <div className="pt-2 space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium block">
                    Menü İçeriği:
                  </span>
                  {(menu.items || []).map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-1.5">
                <button
                  onClick={() => openEditModal(menu, "menus")}
                  className="p-1.5 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 transition-colors cursor-pointer"
                  title="Düzenle"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => {
                    if (confirm(`"${menu.name}" menüsünü silmek istediğinize emin misiniz?`)) {
                      await deleteMenu(menu.id);
                      setMenus(menus.filter((m) => m.id !== menu.id));
                      toast.success("Menü silindi.");
                    }
                  }}
                  className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 4: ETKİNLİK TÜRLERİ ── */}
      {activeTab === "events" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev, idx) => (
            <div
              key={ev.id || idx}
              className="p-6 rounded-2xl bg-bg-secondary border border-border flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-heading text-cream font-bold">
                  {ev.title}
                </h3>
                <span className="text-xs text-gold font-medium block">
                  {ev.capacity}
                </span>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {ev.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-1.5">
                <button
                  onClick={() => openEditModal(ev, "events")}
                  className="p-1.5 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 transition-colors cursor-pointer"
                  title="Düzenle"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => {
                    if (confirm(`"${ev.title}" etkinliğini silmek istediğinize emin misiniz?`)) {
                      await deleteEventType(ev.id);
                      setEvents(events.filter((e) => e.id !== ev.id));
                      toast.success("Etkinlik türü silindi.");
                    }
                  }}
                  className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 5: YORUMLAR ── */}
      {activeTab === "testimonials" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={t.id || idx}
              className="p-6 rounded-2xl bg-bg-secondary border border-border flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < t.rating ? "fill-current" : "text-border"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-text-secondary italic leading-relaxed">
                  &ldquo;{t.content}&rdquo;
                </p>

                <div className="pt-2">
                  <h4 className="font-heading text-cream text-sm font-semibold">
                    {t.name}
                  </h4>
                  {t.eventType && (
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {t.eventType}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-medium">
                  Yayında
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(t, "testimonials")}
                    className="p-1.5 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 transition-colors cursor-pointer"
                    title="Düzenle"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`"${t.name}" misafir yorumunu silmek istediğinize emin misiniz?`)) {
                        await deleteTestimonial(t.id);
                        setTestimonials(testimonials.filter((item) => item.id !== t.id));
                        toast.success("Yorum silindi.");
                      }
                    }}
                    className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 6: SSS ── */}
      {activeTab === "faqs" && (
        <div className="space-y-4 max-w-4xl">
          {faqs.map((faq, idx) => (
            <div
              key={faq.id || idx}
              className="p-5 rounded-2xl bg-bg-secondary border border-border flex items-start justify-between gap-4"
            >
              <div className="space-y-1.5">
                <h4 className="font-heading text-sm text-cream font-medium">
                  {faq.q}
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {faq.a}
                </p>
                {faq.category && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-surface text-text-muted border border-border inline-block mt-2">
                    {faq.category}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEditModal(faq, "faqs")}
                  className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 transition-colors cursor-pointer"
                  title="Düzenle"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => {
                    if (confirm(`Bu SSS maddesini silmek istediğinize emin misiniz?`)) {
                      await deleteFaq(faq.id);
                      setFaqs(faqs.filter((f) => f.id !== faq.id));
                      toast.success("SSS silindi.");
                    }
                  }}
                  className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── EDIT / CREATE MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-bg-secondary border border-border rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-elevated">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading text-cream font-bold">
                {editingItem ? (
                  <>
                    {activeTab === "halls" && "Salonu Düzenle"}
                    {activeTab === "packages" && "Düğün Paketini Düzenle"}
                    {activeTab === "menus" && "Menüyü Düzenle"}
                    {activeTab === "events" && "Etkinlik Türünü Düzenle"}
                    {activeTab === "faqs" && "SSS Maddesini Düzenle"}
                    {activeTab === "testimonials" && "Misafir Yorumunu Düzenle"}
                  </>
                ) : (
                  <>
                    {activeTab === "halls" && "Yeni Salon Ekle"}
                    {activeTab === "packages" && "Yeni Düğün Paketi Ekle"}
                    {activeTab === "menus" && "Yeni Menü Ekle"}
                    {activeTab === "events" && "Yeni Etkinlik Türü Ekle"}
                    {activeTab === "faqs" && "Yeni Sıkça Sorulan Soru Ekle"}
                    {activeTab === "testimonials" && "Yeni Misafir Yorumu Ekle"}
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
                }}
                className="p-1 rounded-lg text-text-muted hover:text-cream cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM: HALL */}
            {activeTab === "halls" && (
              <form onSubmit={handleSubmitHall} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Salon Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={hallForm.name}
                    onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })}
                    placeholder="Örn: Kristal Salon"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                      Kapasite *
                    </label>
                    <input
                      type="text"
                      required
                      value={hallForm.capacity}
                      onChange={(e) => setHallForm({ ...hallForm, capacity: e.target.value })}
                      placeholder="Örn: 600 Kişilik Kapasite"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                      Alan Ölçüsü *
                    </label>
                    <input
                      type="text"
                      required
                      value={hallForm.area}
                      onChange={(e) => setHallForm({ ...hallForm, area: e.target.value })}
                      placeholder="Örn: 850 m² Kapalı Alan"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Spot Başlık
                  </label>
                  <input
                    type="text"
                    value={hallForm.tagline}
                    onChange={(e) => setHallForm({ ...hallForm, tagline: e.target.value })}
                    placeholder="Örn: Görkemli ve Büyüleyici Kapalı Salon"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <ImageCropUpload
                  label="Salon Fotoğrafı *"
                  value={hallForm.imageUrl}
                  onChange={(url) => setHallForm({ ...hallForm, imageUrl: url })}
                  aspectRatio="16/9"
                  recommendedDimensions="1600x1000 px (16:10 / 16:9)"
                  category="Salonlar"
                  helperText="Bilgisayarınızdan fotoğraf yükleyin ve salon kartı alanına göre kırpın."
                />

                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Açıklama *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={hallForm.description}
                    onChange={(e) => setHallForm({ ...hallForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Özellik Maddeleri (Her satıra bir tane)
                  </label>
                  <textarea
                    rows={3}
                    value={hallForm.features}
                    onChange={(e) => setHallForm({ ...hallForm, features: e.target.value })}
                    placeholder="Geniş Dans Pisti&#10;Gelin & Damat Süiti&#10;Akustik Ses Düzeni"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-surface border border-border text-text-secondary text-xs font-medium cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider shadow-gold cursor-pointer"
                  >
                    {isSubmitting
                      ? editingItem
                        ? "Güncelleniyor..."
                        : "Kaydediliyor..."
                      : editingItem
                      ? "Güncelle"
                      : "Kaydet"}
                  </button>
                </div>
              </form>
            )}

            {/* FORM: PACKAGE */}
            {activeTab === "packages" && (
              <form onSubmit={handleSubmitPackage} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Paket Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                    placeholder="Örn: Platin Düğün Paketi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                      Fiyat (₺)
                    </label>
                    <input
                      type="number"
                      value={packageForm.price}
                      onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                      placeholder="Örn: 200000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                      Özel Fiyat Etiketi (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={packageForm.priceLabel}
                      onChange={(e) => setPackageForm({ ...packageForm, priceLabel: e.target.value })}
                      placeholder="Fiyat için arayınız"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Açıklama *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={packageForm.description}
                    onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Dahil Olan Hizmetler (Her satıra bir özellik)
                  </label>
                  <textarea
                    rows={3}
                    value={packageForm.features}
                    onChange={(e) => setPackageForm({ ...packageForm, features: e.target.value })}
                    placeholder="Canlı Orkestra ve DJ&#10;Sıcak Yemek Menüsü&#10;Gelin Başı ve Fotoğraf"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={packageForm.isFeatured}
                    onChange={(e) => setPackageForm({ ...packageForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-gold rounded"
                  />
                  <label htmlFor="isFeatured" className="text-xs text-cream cursor-pointer">
                    En Çok Tercih Edilen (Öne Çıkan) Olarak İşaretle
                  </label>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-surface border border-border text-text-secondary text-xs cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider shadow-gold cursor-pointer"
                  >
                    {isSubmitting
                      ? editingItem
                        ? "Güncelleniyor..."
                        : "Ekleniyor..."
                      : editingItem
                      ? "Güncelle"
                      : "Paket Ekle"}
                  </button>
                </div>
              </form>
            )}

            {/* FORM: MENU */}
            {activeTab === "menus" && (
              <form onSubmit={handleSubmitMenu} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Menü Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={menuForm.name}
                    onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                    placeholder="Örn: Gurme Kırmızı Et Menüsü"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                      Kategori *
                    </label>
                    <select
                      value={menuForm.category}
                      onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                    >
                      <option value="Yemekli Menü">Yemekli Menü</option>
                      <option value="Sıcak Yemekli Menü">Sıcak Yemekli Menü</option>
                      <option value="Kokteyl Menü">Kokteyl Menü</option>
                      <option value="Açık Büfe Menü">Açık Büfe Menü</option>
                      <option value="Çocuk Menüsü">Çocuk Menüsü</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                      Kişi Başı Fiyat (₺)
                    </label>
                    <input
                      type="number"
                      value={menuForm.price}
                      onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                      placeholder="850"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Açıklama (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={menuForm.description}
                    onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                    placeholder="Örn: Özel soslu dana antrikot ve leziz mezeler"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Yemek Kalemleri (Her satıra bir lezzet)
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={menuForm.items}
                    onChange={(e) => setMenuForm({ ...menuForm, items: e.target.value })}
                    placeholder="Ordövr Tabağı (6 Çeşit Meze)&#10;Paçanga Böreği&#10;Kuzu Tandır ve İç Pilav&#10;Düğün Pastası ve Meşrubat"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-surface border border-border text-text-secondary text-xs cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider shadow-gold cursor-pointer"
                  >
                    {isSubmitting
                      ? editingItem
                        ? "Güncelleniyor..."
                        : "Kaydediliyor..."
                      : editingItem
                      ? "Güncelle"
                      : "Menü Ekle"}
                  </button>
                </div>
              </form>
            )}

            {/* FORM: EVENT TYPE */}
            {activeTab === "events" && (
              <form onSubmit={handleSubmitEvent} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Etkinlik Türü Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="Örn: Kına Gecesi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                      Kapasite / Bilgi *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventForm.capacity}
                      onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })}
                      placeholder="Örn: 200 - 600 Kişi"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                      İkon
                    </label>
                    <input
                      type="text"
                      value={eventForm.iconName}
                      onChange={(e) => setEventForm({ ...eventForm, iconName: e.target.value })}
                      placeholder="Heart, Sparkles, Building2..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Açıklama *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={eventForm.desc}
                    onChange={(e) => setEventForm({ ...eventForm, desc: e.target.value })}
                    placeholder="Geleneksel motifler ve modern dokunuşların harmanlandığı büyülü kına organizasyonları..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <ImageCropUpload
                  label="Etkinlik Kapak Fotoğrafı *"
                  value={eventForm.imageUrl}
                  onChange={(url) => setEventForm({ ...eventForm, imageUrl: url })}
                  aspectRatio="16/9"
                  recommendedDimensions="1200x800 px (16:9)"
                  category="Etkinlikler"
                  helperText="Bilgisayarınızdan fotoğraf yükleyin ve etkinlik kartı alanına göre kırpın."
                />

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-surface border border-border text-text-secondary text-xs cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider shadow-gold cursor-pointer"
                  >
                    {isSubmitting
                      ? editingItem
                        ? "Güncelleniyor..."
                        : "Kaydediliyor..."
                      : editingItem
                      ? "Güncelle"
                      : "Etkinlik Ekle"}
                  </button>
                </div>
              </form>
            )}

            {/* FORM: FAQ */}
            {activeTab === "faqs" && (
              <form onSubmit={handleSubmitFaq} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Soru *
                  </label>
                  <input
                    type="text"
                    required
                    value={faqForm.q}
                    onChange={(e) => setFaqForm({ ...faqForm, q: e.target.value })}
                    placeholder="Örn: Otopark ve vale hizmetiniz var mı?"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={faqForm.category}
                    onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                    placeholder="Genel, Menü, Rezervasyon..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Cevap *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={faqForm.a}
                    onChange={(e) => setFaqForm({ ...faqForm, a: e.target.value })}
                    placeholder="Evet, misafirlerimiz için geniş ücretsiz otopark ve vale hizmetimiz bulunmaktadır."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-surface border border-border text-text-secondary text-xs cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider shadow-gold cursor-pointer"
                  >
                    {isSubmitting
                      ? editingItem
                        ? "Güncelleniyor..."
                        : "Kaydediliyor..."
                      : editingItem
                      ? "Güncelle"
                      : "Soru Ekle"}
                  </button>
                </div>
              </form>
            )}

            {/* FORM: TESTIMONIAL */}
            {activeTab === "testimonials" && (
              <form onSubmit={handleSubmitTestimonial} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Çift / Misafir Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={testimonialForm.name}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                    placeholder="Örn: Ayşe & Barış Demir"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Etkinlik Türü
                  </label>
                  <input
                    type="text"
                    value={testimonialForm.eventType}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, eventType: e.target.value })}
                    placeholder="Örn: Kristal Salon Düğünü"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Puan (1 - 5)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setTestimonialForm({ ...testimonialForm, rating: star })}
                        className="p-1 rounded cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= testimonialForm.rating
                              ? "text-gold fill-current"
                              : "text-border"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Yorum Metni *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={testimonialForm.content}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
                    placeholder="Hayallerimizin ötesinde bir gece yaşadık..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-surface border border-border text-text-secondary text-xs cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider shadow-gold cursor-pointer"
                  >
                    {isSubmitting
                      ? editingItem
                        ? "Güncelleniyor..."
                        : "Kaydediliyor..."
                      : editingItem
                      ? "Güncelle"
                      : "Yorum Ekle"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
