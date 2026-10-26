"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  saveHall,
  deleteHall,
  createPackage,
  deletePackage,
  togglePackageActive,
  saveMenu,
  deleteMenu,
  saveEventType,
  saveFaq,
  deleteFaq,
  createTestimonial,
  deleteTestimonial,
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
} from "lucide-react";

interface ContentManagerProps {
  initialHalls: any[];
  initialPackages: any[];
  initialMenus: any[];
  initialEvents: any[];
  initialFaqs: any[];
  initialTestimonials: any[];
}

export function ContentManager({
  initialHalls,
  initialPackages,
  initialMenus,
  initialEvents,
  initialFaqs,
  initialTestimonials,
}: ContentManagerProps) {
  const [activeTab, setActiveTab] = useState<
    "halls" | "packages" | "menus" | "events" | "testimonials" | "faqs"
  >("halls");

  // State collections
  const [halls, setHalls] = useState(initialHalls);
  const [packages, setPackages] = useState(initialPackages);
  const [menus, setMenus] = useState(initialMenus);
  const [events, setEvents] = useState(initialEvents);
  const [faqs, setFaqs] = useState(initialFaqs);
  const [testimonials, setTestimonials] = useState(initialTestimonials);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields for current tab
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

  // ─── Handlers ──────────────────────────────────────────

  const handleAddHall = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const featuresArr = hallForm.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const res = await saveHall({
        ...hallForm,
        slug: hallForm.slug || hallForm.name.toLowerCase().replace(/\s+/g, "-"),
        features: featuresArr,
        isActive: true,
      });

      if (res.success) {
        toast.success("Salon başarıyla kaydedildi!");
        setHalls([
          ...halls,
          {
            id: "hall_" + Date.now(),
            ...hallForm,
            features: featuresArr,
            isActive: true,
          },
        ]);
        setShowModal(false);
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
      } else {
        toast.error(res.error || "Hata oluştu.");
      }
    } catch {
      toast.error("İşlem sırasında bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const featuresArr = packageForm.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const res = await createPackage({
        name: packageForm.name,
        slug: packageForm.slug || packageForm.name.toLowerCase().replace(/\s+/g, "-"),
        description: packageForm.description,
        price: packageForm.price ? Number(packageForm.price) : null,
        priceLabel: packageForm.priceLabel || null,
        isFeatured: packageForm.isFeatured,
        features: featuresArr,
      });

      if (res.success) {
        toast.success("Paket başarıyla eklendi!");
        setPackages([
          ...packages,
          {
            id: "pkg_" + Date.now(),
            ...packageForm,
            features: featuresArr.map((text, idx) => ({ id: `f_${idx}`, text })),
            isActive: true,
          },
        ]);
        setShowModal(false);
      } else {
        toast.error(res.error || "Geçersiz paket verisi.");
      }
    } catch {
      toast.error("Paket eklenirken hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const itemsArr = menuForm.items
        .split("\n")
        .map((i) => i.trim())
        .filter(Boolean);

      const res = await saveMenu({
        name: menuForm.name,
        category: menuForm.category,
        description: menuForm.description,
        price: menuForm.price ? Number(menuForm.price) : null,
        items: itemsArr,
        isActive: true,
      });

      if (res.success) {
        toast.success("Menü başarıyla eklendi!");
        setMenus([
          ...menus,
          { id: "m_" + Date.now(), ...menuForm, items: itemsArr, isActive: true },
        ]);
        setShowModal(false);
      } else {
        toast.error(res.error || "Hata oluştu.");
      }
    } catch {
      toast.error("Menü kaydedilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await saveFaq({
        q: faqForm.q,
        a: faqForm.a,
        category: faqForm.category,
        isActive: true,
      });

      if (res.success) {
        toast.success("SSS maddesi eklendi!");
        setFaqs([...faqs, { id: "faq_" + Date.now(), ...faqForm, isActive: true }]);
        setShowModal(false);
      } else {
        toast.error(res.error || "Hata oluştu.");
      }
    } catch {
      toast.error("SSS kaydedilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createTestimonial({
        name: testimonialForm.name,
        eventType: testimonialForm.eventType,
        content: testimonialForm.content,
        rating: Number(testimonialForm.rating),
      });

      if (res.success) {
        toast.success("Yorum başarıyla eklendi!");
        setTestimonials([
          { id: "t_" + Date.now(), ...testimonialForm, isActive: true },
          ...testimonials,
        ]);
        setShowModal(false);
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
            Salonlar, menüler, paketler, etkinlik türleri ve sıkça sorulan soruları düzenleyin.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider shadow-gold hover:opacity-95 transition-opacity flex items-center gap-2 self-start sm:self-auto"
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
      </div>

      {/* ── Module Tabs ── */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-bg-secondary border border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab("halls")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
            activeTab === "halls"
              ? "bg-surface text-gold border border-gold/30 shadow-xs"
              : "text-text-secondary hover:text-cream"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Salonlar ({halls.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("packages")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
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
                    className="p-1 rounded hover:bg-surface disabled:opacity-30"
                    title="Yukarı Taşı"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveItem(halls, setHalls, idx, "down")}
                    disabled={idx === halls.length - 1}
                    className="p-1 rounded hover:bg-surface disabled:opacity-30"
                    title="Aşağı Taşı"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      if (confirm("Bu salonu silmek istediğinize emin misiniz?")) {
                        await deleteHall(hall.id);
                        setHalls(halls.filter((h) => h.id !== hall.id));
                        toast.success("Salon silindi.");
                      }
                    }}
                    className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
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
                  className="flex items-center gap-1.5 text-text-muted hover:text-cream"
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

                <button
                  onClick={async () => {
                    if (confirm("Bu paketi silmek istediğinize emin misiniz?")) {
                      await deletePackage(pkg.id);
                      setPackages(packages.filter((p) => p.id !== pkg.id));
                      toast.success("Paket silindi.");
                    }
                  }}
                  className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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

              <div className="pt-4 border-t border-border flex items-center justify-end">
                <button
                  onClick={async () => {
                    if (confirm("Bu menüyü silmek istediğinize emin misiniz?")) {
                      await deleteMenu(menu.id);
                      setMenus(menus.filter((m) => m.id !== menu.id));
                      toast.success("Menü silindi.");
                    }
                  }}
                  className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
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
                <button
                  onClick={async () => {
                    if (confirm("Bu yorumu silmek istediğinize emin misiniz?")) {
                      await deleteTestimonial(t.id);
                      setTestimonials(testimonials.filter((item) => item.id !== t.id));
                      toast.success("Yorum silindi.");
                    }
                  }}
                  className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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

              <button
                onClick={async () => {
                  if (confirm("Bu SSS maddesini silmek istediğinize emin misiniz?")) {
                    await deleteFaq(faq.id);
                    setFaqs(faqs.filter((f) => f.id !== faq.id));
                    toast.success("SSS silindi.");
                  }
                }}
                className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-bg-secondary border border-border rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-elevated">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading text-cream font-bold">
                {activeTab === "halls" && "Yeni Salon Ekle"}
                {activeTab === "packages" && "Yeni Düğün Paketi Ekle"}
                {activeTab === "menus" && "Yeni Menü Ekle"}
                {activeTab === "faqs" && "Yeni Sıkça Sorulan Soru Ekle"}
                {activeTab === "testimonials" && "Yeni Misafir Yorumu Ekle"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-text-muted hover:text-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM: HALL */}
            {activeTab === "halls" && (
              <form onSubmit={handleAddHall} className="space-y-4">
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

                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">
                    Görsel URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={hallForm.imageUrl}
                    onChange={(e) => setHallForm({ ...hallForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

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
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-surface border border-border text-text-secondary text-xs font-medium"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider shadow-gold"
                  >
                    {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </form>
            )}

            {/* FORM: PACKAGE */}
            {activeTab === "packages" && (
              <form onSubmit={handleAddPackage} className="space-y-4">
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
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-surface border border-border text-text-secondary text-xs"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider shadow-gold"
                  >
                    {isSubmitting ? "Ekleniyor..." : "Paket Ekle"}
                  </button>
                </div>
              </form>
            )}

            {/* FORM: MENU */}
            {activeTab === "menus" && (
              <form onSubmit={handleAddMenu} className="space-y-4">
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
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-surface border border-border text-text-secondary text-xs"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider shadow-gold"
                  >
                    {isSubmitting ? "Kaydediliyor..." : "Menü Ekle"}
                  </button>
                </div>
              </form>
            )}

            {/* FORM: FAQ */}
            {activeTab === "faqs" && (
              <form onSubmit={handleAddFaq} className="space-y-4">
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
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-surface border border-border text-text-secondary text-xs"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider shadow-gold"
                  >
                    {isSubmitting ? "Kaydediliyor..." : "Soru Ekle"}
                  </button>
                </div>
              </form>
            )}

            {/* FORM: TESTIMONIAL */}
            {activeTab === "testimonials" && (
              <form onSubmit={handleAddTestimonial} className="space-y-4">
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
                    Yorum Metni *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={testimonialForm.content}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-cream focus:border-gold outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-surface border border-border text-text-secondary text-xs"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider shadow-gold"
                  >
                    {isSubmitting ? "Kaydediliyor..." : "Yorum Ekle"}
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
