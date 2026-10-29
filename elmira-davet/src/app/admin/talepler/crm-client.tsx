"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import {
  CalendarCheck2,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  Calendar,
  Building2,
  Users,
  MessageCircle,
  MoreVertical,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { createCrmLead, updateLeadStatus, deleteLead } from "../actions";

interface CrmLead {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  eventDate: string;
  timeSlot?: "DAY" | "NIGHT" | "FULL";
  eventType: string;
  hallPreference: string;
  guestCount?: number | null;
  budget?: number | null;
  source: string; // "Website" | "Meta / Instagram Ads" | "Referans" | "Telefon"
  status: string; // "PENDING" | "CONTACTED" | "OFFER_SENT" | "CONFIRMED" | "CANCELLED"
  notes?: string | null;
  createdAt?: string;
}

interface CrmClientProps {
  initialLeads: CrmLead[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; badgeClass: string }
> = {
  PENDING: {
    label: "Yeni / Bekliyor",
    color: "amber",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  CONTACTED: {
    label: "Görüşüldü",
    color: "blue",
    badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  OFFER_SENT: {
    label: "Teklif Verildi",
    color: "purple",
    badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  CONFIRMED: {
    label: "Kapora Alındı (Takvim Kilitlendi)",
    color: "emerald",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  CANCELLED: {
    label: "İptal Edildi",
    color: "red",
    badgeClass: "bg-red-500/20 text-red-300 border-red-500/30",
  },
};

export function CrmClient({ initialLeads }: CrmClientProps) {
  const [leads, setLeads] = useState<CrmLead[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    eventDate: new Date().toISOString().split("T")[0],
    timeSlot: "NIGHT" as "DAY" | "NIGHT",
    eventType: "Düğün Organizasyonu",
    hallPreference: "Kristal Salon (600 Kişilik)",
    guestCount: 350,
    budget: 150000,
    source: "Website",
    status: "PENDING",
    notes: "",
  });

  // Note View/Edit Modal
  const [activeLeadForNote, setActiveLeadForNote] = useState<CrmLead | null>(null);
  const [newAdminNote, setNewAdminNote] = useState("");

  // Kapora Alındı & Takvim Rezervasyonu Modal State
  const [confirmingLead, setConfirmingLead] = useState<CrmLead | null>(null);
  const [confirmData, setConfirmData] = useState({
    eventDate: new Date().toISOString().split("T")[0],
    hallPreference: "Kristal Salon",
    timeSlot: "NIGHT" as "DAY" | "NIGHT" | "FULL",
    depositAmount: 50000,
  });

  // Status Change Handler
  const handleStatusChange = (leadId: string, newStatus: string) => {
    if (newStatus === "CONFIRMED") {
      const target = leads.find((l) => l.id === leadId);
      if (target) {
        setConfirmingLead(target);
        setConfirmData({
          eventDate: target.eventDate ? target.eventDate.split("T")[0] : new Date().toISOString().split("T")[0],
          hallPreference: target.hallPreference || "Kristal Salon",
          timeSlot: (target.timeSlot as any) || "NIGHT",
          depositAmount: 50000,
        });
        return;
      }
    }

    startTransition(async () => {
      try {
        const res = await updateLeadStatus(leadId, newStatus);
        if (res.success) {
          toast.success(
            `Durum "${STATUS_CONFIG[newStatus]?.label || newStatus}" olarak güncellendi`
          );
          setLeads((prev) =>
            prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
          );
        } else {
          toast.error(res.error || "Güncelleme başarısız");
        }
      } catch {
        toast.error("İşlem sırasında bir hata oluştu");
      }
    });
  };

  const handleConfirmDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingLead) return;

    startTransition(async () => {
      try {
        const res = await updateLeadStatus(confirmingLead.id, "CONFIRMED", undefined, {
          eventDate: confirmData.eventDate,
          hallPreference: confirmData.hallPreference,
          timeSlot: confirmData.timeSlot,
          depositAmount: Number(confirmData.depositAmount),
        });

        if (res.success) {
          toast.success(
            `Kapora alındı ve ${confirmData.eventDate} (${confirmData.timeSlot === "DAY" ? "Gündüz" : "Akşam"}) takvime otomatik kilitlendi!`
          );
          setLeads((prev) =>
            prev.map((l) =>
              l.id === confirmingLead.id
                ? {
                    ...l,
                    status: "CONFIRMED",
                    eventDate: confirmData.eventDate,
                    hallPreference: confirmData.hallPreference,
                    timeSlot: confirmData.timeSlot,
                  }
                : l
            )
          );
          setConfirmingLead(null);
        } else {
          toast.error(res.error || "İşlem başarısız");
        }
      } catch {
        toast.error("Hata oluştu");
      }
    });
  };

  // Delete Lead Handler
  const handleDelete = (leadId: string, name: string) => {
    if (!confirm(`"${name}" talebini silmek istediğinize emin misiniz?`)) return;

    startTransition(async () => {
      try {
        const res = await deleteLead(leadId);
        if (res.success) {
          toast.success("Talep başarıyla silindi");
          setLeads((prev) => prev.filter((l) => l.id !== leadId));
        } else {
          toast.error(res.error || "Silinemedi");
        }
      } catch {
        toast.error("Hata oluştu");
      }
    });
  };

  // Create Lead Handler
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      toast.error("Ad Soyad ve Telefon alanları zorunludur");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createCrmLead(formData);
        if (res.success) {
          toast.success("Yeni talep başarıyla kaydedildi");
          setLeads((prev) => [
            {
              id: "lead_" + Date.now(),
              ...formData,
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ]);
          setIsCreateModalOpen(false);
          setFormData({
            fullName: "",
            phone: "",
            email: "",
            eventDate: new Date().toISOString().split("T")[0],
            timeSlot: "NIGHT",
            eventType: "Düğün Organizasyonu",
            hallPreference: "Kristal Salon (600 Kişilik)",
            guestCount: 350,
            budget: 150000,
            source: "Website",
            status: "PENDING",
            notes: "",
          });
        } else {
          toast.error(res.error || "Kayıt oluşturulamadı");
        }
      } catch {
        toast.error("İşlem hatası");
      }
    });
  };

  // Add Note to Lead
  const handleSaveNote = () => {
    if (!activeLeadForNote || !newAdminNote.trim()) return;

    startTransition(async () => {
      try {
        const res = await updateLeadStatus(
          activeLeadForNote.id,
          activeLeadForNote.status,
          newAdminNote
        );
        if (res.success) {
          toast.success("Görüşme notu eklendi");
          setLeads((prev) =>
            prev.map((l) =>
              l.id === activeLeadForNote.id
                ? {
                    ...l,
                    notes: l.notes
                      ? `${l.notes}\n[Not]: ${newAdminNote}`
                      : `[Not]: ${newAdminNote}`,
                  }
                : l
            )
          );
          setActiveLeadForNote(null);
          setNewAdminNote("");
        }
      } catch {
        toast.error("Not kaydedilemedi");
      }
    });
  };

  // Filters
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.eventType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSource =
      sourceFilter === "ALL"
        ? true
        : sourceFilter === "META"
        ? lead.source.toLowerCase().includes("meta") ||
          lead.source.toLowerCase().includes("instagram")
        : lead.source.toLowerCase().includes("website");

    const matchesStatus = statusFilter === "ALL" ? true : lead.status === statusFilter;

    return matchesSearch && matchesSource && matchesStatus;
  });

  // Calculate quick stats
  const totalCount = leads.length;
  const pendingCount = leads.filter((l) => l.status === "PENDING").length;
  const contactedCount = leads.filter(
    (l) => l.status === "CONTACTED" || l.status === "OFFER_SENT"
  ).length;
  const confirmedCount = leads.filter((l) => l.status === "CONFIRMED").length;
  const metaCount = leads.filter(
    (l) =>
      l.source.toLowerCase().includes("meta") ||
      l.source.toLowerCase().includes("instagram")
  ).length;
  const webCount = totalCount - metaCount;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-xs text-text-muted">Toplam Talep</span>
          <div className="text-2xl font-bold font-mono text-cream mt-1">{totalCount}</div>
          <p className="text-[11px] text-text-muted mt-0.5">Tüm kanallar</p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-xs text-text-muted">Yeni / Bekleyen</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{pendingCount}</div>
          <p className="text-[11px] text-text-muted mt-0.5">Arama bekliyor</p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-xs text-text-muted">Görüşülen / Teklif</span>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1">{contactedCount}</div>
          <p className="text-[11px] text-text-muted mt-0.5">Pipeline aşamasında</p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-xs text-text-muted">Onaylanan Sözleşme</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{confirmedCount}</div>
          <p className="text-[11px] text-text-muted mt-0.5">Satışa dönüştü</p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border col-span-2 lg:col-span-1">
          <span className="text-xs text-text-muted">Kanal Dağılımı</span>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="text-blue-400 font-semibold">Web: {webCount}</span>
            <span className="text-text-muted">|</span>
            <span className="text-pink-400 font-semibold">Meta: {metaCount}</span>
          </div>
          <div className="w-full bg-bg-secondary h-1.5 rounded-full mt-2 overflow-hidden flex">
            <div
              className="bg-blue-400 h-full"
              style={{ width: `${totalCount > 0 ? (webCount / totalCount) * 100 : 50}%` }}
              title="Website"
            />
            <div
              className="bg-pink-500 h-full"
              style={{ width: `${totalCount > 0 ? (metaCount / totalCount) * 100 : 50}%` }}
              title="Meta Ads"
            />
          </div>
        </div>
      </div>

      {/* Action Header & Search / Filters */}
      <div className="p-4 rounded-2xl bg-surface border border-border space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İsim, telefon veya organizasyon ara..."
              className="w-full pl-9 pr-4 py-2 bg-bg-secondary border border-border rounded-xl text-xs text-cream placeholder-text-muted focus:outline-hidden focus:border-gold"
            />
          </div>

          {/* New Lead Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-gradient-gold text-bg-primary font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs hover:opacity-95 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Yeni Talep Ekle
          </button>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
          <div className="flex items-center gap-1 text-xs text-text-muted mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Kanal:</span>
          </div>
          {(["ALL", "WEBSITE", "META"] as const).map((source) => (
            <button
              key={source}
              onClick={() => setSourceFilter(source)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                sourceFilter === source
                  ? "bg-gold text-bg-primary font-semibold"
                  : "bg-bg-secondary text-text-secondary hover:text-text-primary"
              }`}
            >
              {source === "ALL"
                ? "Tüm Kanallar"
                : source === "WEBSITE"
                ? "🌐 Website"
                : "📸 Meta / Instagram Ads"}
            </button>
          ))}

          <div className="h-4 w-px bg-border mx-2 hidden sm:block" />

          <div className="flex items-center gap-1 text-xs text-text-muted mr-1">
            <span>Durum:</span>
          </div>
          {(["ALL", "PENDING", "CONTACTED", "OFFER_SENT", "CONFIRMED", "CANCELLED"] as const).map(
            (statusKey) => (
              <button
                key={statusKey}
                onClick={() => setStatusFilter(statusKey)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === statusKey
                    ? "bg-cream text-bg-primary font-semibold"
                    : "bg-bg-secondary text-text-secondary hover:text-text-primary"
                }`}
              >
                {statusKey === "ALL" ? "Tümü" : STATUS_CONFIG[statusKey]?.label || statusKey}
              </button>
            )
          )}
        </div>
      </div>

      {/* CRM Leads Table */}
      <div className="rounded-2xl bg-surface border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-bg-secondary/70 border-b border-border text-text-muted font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Talep Eden Kişi</th>
                <th className="py-3 px-4">Kanal</th>
                <th className="py-3 px-4">Tarih & Etkinlik</th>
                <th className="py-3 px-4">Salon & Kişi</th>
                <th className="py-3 px-4">Aşama / Durum</th>
                <th className="py-3 px-4 text-right">Hızlı İletişim & İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.map((lead) => {
                const isMeta =
                  lead.source.toLowerCase().includes("meta") ||
                  lead.source.toLowerCase().includes("instagram");
                const cleanPhone = lead.phone.replace(/\D/g, "");
                const waUrl = `https://wa.me/90${cleanPhone.replace(/^0/, "")}?text=${encodeURIComponent(
                  `Merhaba Sayın ${lead.fullName}, Elmira Davet Salonu adına ${lead.eventType} talebinizle ilgili sizlere ulaşıyoruz.`
                )}`;

                return (
                  <tr
                    key={lead.id}
                    className="hover:bg-bg-secondary/40 transition-colors group"
                  >
                    {/* Kişi */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-cream text-sm">
                        {lead.fullName}
                      </div>
                      <div className="text-text-secondary font-mono text-[11px] flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-gold" />
                        <span>{lead.phone}</span>
                      </div>
                      {lead.email && (
                        <div className="text-text-muted text-[11px] flex items-center gap-1.5">
                          <Mail className="w-3 h-3" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                    </td>

                    {/* Kanal Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isMeta ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/30">
                          📸 Meta Ads
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          🌐 Website
                        </span>
                      )}
                    </td>

                    {/* Tarih & Etkinlik */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-cream">
                        <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span>{lead.eventDate}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        {lead.timeSlot === "DAY" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Sun className="w-2.5 h-2.5" /> 13:00 - 17:00 (Gündüz)
                          </span>
                        ) : lead.timeSlot === "FULL" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            👑 Tam Gün (2 Seans)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            <Moon className="w-2.5 h-2.5" /> 19:00 - 23:00 (Akşam)
                          </span>
                        )}
                      </div>
                      <div className="text-text-secondary mt-1 font-medium">
                        {lead.eventType}
                      </div>
                    </td>

                    {/* Salon & Kişi */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-cream">
                        <Building2 className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <span>{lead.hallPreference}</span>
                      </div>
                      <div className="text-text-muted text-[11px] flex items-center gap-1.5 mt-0.5">
                        <Users className="w-3 h-3 text-text-muted" />
                        <span>{lead.guestCount ? `${lead.guestCount} Kişi` : "Belirtilmedi"}</span>
                      </div>
                    </td>

                    {/* Durum Dropdown */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="relative inline-block">
                        <select
                          value={lead.status}
                          disabled={isPending}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className={`text-xs font-semibold py-1.5 px-3 rounded-lg border appearance-none pr-7 cursor-pointer focus:outline-hidden ${
                            STATUS_CONFIG[lead.status]?.badgeClass || "bg-bg-secondary text-cream"
                          }`}
                        >
                          <option value="PENDING" className="bg-bg-primary text-cream">
                            Yeni / Bekliyor
                          </option>
                          <option value="CONTACTED" className="bg-bg-primary text-cream">
                            Görüşüldü
                          </option>
                          <option value="OFFER_SENT" className="bg-bg-primary text-cream">
                            Teklif Verildi
                          </option>
                          <option value="CONFIRMED" className="bg-bg-primary text-cream">
                            Onaylandı (Sözleşme)
                          </option>
                          <option value="CANCELLED" className="bg-bg-primary text-cream">
                            İptal Edildi
                          </option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>

                    {/* Quick Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Button */}
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                          title="WhatsApp'tan Yaz"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        {/* Call Button */}
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-1.5 rounded-lg bg-gold/15 text-gold hover:bg-gold/25 transition-colors"
                          title="Telefonla Ara"
                        >
                          <Phone className="w-4 h-4" />
                        </a>

                        {/* Note Modal Open */}
                        <button
                          onClick={() => {
                            setActiveLeadForNote(lead);
                            setNewAdminNote("");
                          }}
                          className="p-1.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
                          title="Görüşme Notları"
                        >
                          <CalendarCheck2 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(lead.id, lead.fullName)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                          title="Talebi Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    Arama kriterine uygun talep kaydı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE LEAD MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-surface border border-border rounded-2xl shadow-xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-heading text-cream">Yeni Müşteri Talebi Ekle</h3>
                <p className="text-xs text-text-muted">
                  Siteden veya Meta reklamlarından gelen talebi sisteme işleyin
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Örn: Ayşe & Barış Yılmaz"
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Telefon Numarası *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="05XX XXX XX XX"
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    E-Posta Adresi
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="ornek@gmail.com"
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Planlanan Etkinlik Tarihi
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) =>
                      setFormData({ ...formData, eventDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Saat Aralığı / Seans *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, timeSlot: "DAY" })}
                      className={`py-2 px-2.5 rounded-xl border text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formData.timeSlot === "DAY"
                          ? "bg-amber-500/20 border-amber-500 text-amber-300 font-semibold"
                          : "bg-bg-secondary border-border text-text-secondary hover:border-border-hover"
                      }`}
                    >
                      <Sun className="w-3 h-3 text-amber-400" />
                      <span>13:00 - 17:00</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, timeSlot: "NIGHT" })}
                      className={`py-2 px-2.5 rounded-xl border text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formData.timeSlot === "NIGHT"
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold"
                          : "bg-bg-secondary border-border text-text-secondary hover:border-border-hover"
                      }`}
                    >
                      <Moon className="w-3 h-3 text-indigo-400" />
                      <span>19:00 - 23:00</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Organizasyon Türü
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) =>
                      setFormData({ ...formData, eventType: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                  >
                    <option value="Düğün Organizasyonu">Düğün Organizasyonu</option>
                    <option value="Nişan & Söz Töreni">Nişan & Söz Töreni</option>
                    <option value="Kına Gecesi">Kına Gecesi</option>
                    <option value="Sünnet Düğünü">Sünnet Düğünü</option>
                    <option value="Kurumsal Gala">Kurumsal Gala</option>
                    <option value="Özel Kutlama / Parti">Özel Kutlama / Parti</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Salon Tercihi
                  </label>
                  <select
                    value={formData.hallPreference}
                    onChange={(e) =>
                      setFormData({ ...formData, hallPreference: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                  >
                    <option value="Kristal Salon (600 Kişilik)">
                      Kristal Salon (600 Kişilik)
                    </option>
                    <option value="Kır Bahçesi (300 Kişilik)">
                      Kır Bahçesi (300 Kişilik)
                    </option>
                    <option value="Her İkisi İçin Teklif">
                      Her İkisi İçin Teklif
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Tahmini Davetli Sayısı
                  </label>
                  <input
                    type="number"
                    value={formData.guestCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guestCount: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Kanal / Kaynak
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) =>
                      setFormData({ ...formData, source: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                  >
                    <option value="Website">🌐 Website İletişim Formu</option>
                    <option value="Meta / Instagram Ads">
                      📸 Meta / Instagram Reklamı
                    </option>
                    <option value="Telefon / Doğrudan Arama">
                      📞 Telefonla Doğrudan Arama
                    </option>
                    <option value="Tavsiye / Referans">
                      🤝 Tavsiye / Referans
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Müşteri Notu & Görüşme Özeti
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Yemekli menü düşünüyorlar, hafta sonu salonu gezmeye gelecekler..."
                  className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary rounded-xl"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-semibold bg-gradient-gold text-bg-primary rounded-xl shadow-xs hover:opacity-95 disabled:opacity-50"
                >
                  {isPending ? "Kaydediliyor..." : "Talebi Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAD NOTE / HISTORY MODAL */}
      {activeLeadForNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-heading text-cream">
                  {activeLeadForNote.fullName}
                </h3>
                <p className="text-xs text-text-muted">
                  {activeLeadForNote.eventType} | {activeLeadForNote.eventDate}
                </p>
              </div>
              <button
                onClick={() => setActiveLeadForNote(null)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Note History */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Kayıt & Görüşme Geçmişi
              </label>
              <div className="p-3 rounded-xl bg-bg-secondary border border-border text-xs text-text-secondary max-h-48 overflow-y-auto whitespace-pre-line font-mono">
                {activeLeadForNote.notes || "Henüz özel bir not girilmemiş."}
              </div>
            </div>

            {/* Add New Note */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Yeni Not Ekle
              </label>
              <textarea
                rows={3}
                value={newAdminNote}
                onChange={(e) => setNewAdminNote(e.target.value)}
                placeholder="Örn: Telefonla arandı, Cumartesi 14:00 için randevu verildi..."
                className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setActiveLeadForNote(null)}
                className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary rounded-xl"
              >
                Kapat
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={isPending || !newAdminNote.trim()}
                className="px-5 py-2 text-xs font-semibold bg-gradient-gold text-bg-primary rounded-xl shadow-xs hover:opacity-95 disabled:opacity-50"
              >
                {isPending ? "Kaydediliyor..." : "Notu Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: KAPORA ALINDI & TAKVİME KİLİTLE */}
      {confirmingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-surface border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-emerald-400 font-heading font-medium text-base">
                <CalendarCheck2 className="w-5 h-5 text-emerald-400" />
                <span>Kapora Alındı & Takvim Rezervasyonu</span>
              </div>
              <button
                onClick={() => setConfirmingLead(null)}
                className="text-text-muted hover:text-cream text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Lead Info Banner */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-cream block">{confirmingLead.fullName}</span>
                <span className="text-[11px] text-text-muted block font-mono">{confirmingLead.phone} • {confirmingLead.source}</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                Sözleşme / Rezervasyon
              </span>
            </div>

            <form onSubmit={handleConfirmDeposit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Kesinleşen Etkinlik Tarihi *
                  </label>
                  <input
                    type="date"
                    required
                    value={confirmData.eventDate}
                    onChange={(e) =>
                      setConfirmData({ ...confirmData, eventDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Tahsis Edilen Salon *
                  </label>
                  <select
                    value={confirmData.hallPreference}
                    onChange={(e) =>
                      setConfirmData({ ...confirmData, hallPreference: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                  >
                    <option value="Kristal Salon">Kristal Salon (600 Kişilik)</option>
                    <option value="Kır Bahçesi">Kır Bahçesi (300 Kişilik)</option>
                    <option value="Tüm Salonlar">Tüm Salonlar (Komple Tesis)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Etkinlik Seansı (Gündüz / Akşam) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmData({ ...confirmData, timeSlot: "DAY" })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      confirmData.timeSlot === "DAY"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                        : "bg-bg-secondary border-border text-text-muted hover:text-cream"
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Gündüz (13-17)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmData({ ...confirmData, timeSlot: "NIGHT" })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      confirmData.timeSlot === "NIGHT"
                        ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-sm"
                        : "bg-bg-secondary border-border text-text-muted hover:text-cream"
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Akşam (19-23)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmData({ ...confirmData, timeSlot: "FULL" })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      confirmData.timeSlot === "FULL"
                        ? "bg-purple-500/20 border-purple-500 text-purple-300 shadow-sm"
                        : "bg-bg-secondary border-border text-text-muted hover:text-cream"
                    }`}
                  >
                    <span>Tüm Gün</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Alınan Kapora Tutarı (TL)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={confirmData.depositAmount}
                  onChange={(e) =>
                    setConfirmData({
                      ...confirmData,
                      depositAmount: Number(e.target.value),
                    })
                  }
                  placeholder="50000"
                  className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
                📌 <strong>Otomatik Takvim Kilidi:</strong> Bu işlem onaylandığında, <strong>{confirmData.eventDate}</strong> tarihindeki <strong>{confirmData.timeSlot === "DAY" ? "Gündüz (13:00 - 17:00)" : confirmData.timeSlot === "NIGHT" ? "Akşam (19:00 - 23:00)" : "Tüm Gün"}</strong> seansı takvimde otomatik olarak <strong>DOLU / KİLİTLİ</strong> olarak işaretlenecek ve sitedeki formlarda tekrar seçilemeyecektir.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setConfirmingLead(null)}
                  className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary rounded-xl cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isPending ? "Takvime İşleniyor..." : "Kapora Alındı & Takvime Ekle"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
