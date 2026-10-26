"use client";

import { useState, useTransition, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Share2,
  Search,
  Filter,
  Phone,
  MessageCircle,
  Calendar,
  Building2,
  Users,
  Download,
  RefreshCw,
  Settings,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  ExternalLink,
  ChevronDown,
  Layers,
  History,
  FileSpreadsheet,
  Zap,
  Mail,
  Copy,
  Check,
  Shield,
  HelpCircle,
} from "lucide-react";
import {
  MetaLeadRecord,
  MetaLeadStatus,
  MetaAppConfig,
  MetaSyncLog,
} from "@/lib/meta/types";
import {
  updateMetaLeadStatus,
  addMetaLeadNote,
  deleteMetaLead,
  triggerMetaSyncManual,
  saveMetaSettings,
  injectSimulatedTestLead,
  anonymizeMetaLeadAction,
  cleanExpiredLeadsAction,
} from "./actions";

interface MetaLeadsClientProps {
  initialLeads: MetaLeadRecord[];
  initialStats: {
    total: number;
    todayCount: number;
    weekCount: number;
    kaporaCount: number;
    conversionRate: number;
    campaignDistribution: Array<{
      name: string;
      count: number;
      percent: number;
    }>;
  };
  initialConfig: {
    appId: string;
    verifyToken: string;
    graphVersion: string;
    pageId: string;
    lastSyncAt?: string;
    tokenStatus: {
      isConfigured: boolean;
      isValid: boolean;
      daysRemaining: number;
      maskedToken: string;
      expiresAt?: string;
    };
  };
  syncLogs: MetaSyncLog[];
}

const STATUS_COLORS: Record<
  MetaLeadStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  Yeni: {
    bg: "bg-blue-500/20",
    text: "text-blue-300",
    border: "border-blue-500/30",
    label: "Yeni",
  },
  Arandı: {
    bg: "bg-amber-500/20",
    text: "text-amber-300",
    border: "border-amber-500/30",
    label: "Arandı",
  },
  Ulaşılamadı: {
    bg: "bg-orange-500/20",
    text: "text-orange-300",
    border: "border-orange-500/30",
    label: "Ulaşılamadı",
  },
  "Teklif verildi": {
    bg: "bg-purple-500/20",
    text: "text-purple-300",
    border: "border-purple-500/30",
    label: "Teklif Verildi",
  },
  "Görüşmeye geldi": {
    bg: "bg-indigo-500/20",
    text: "text-indigo-300",
    border: "border-indigo-500/30",
    label: "Görüşmeye Geldi",
  },
  "Kapora alındı": {
    bg: "bg-emerald-500/20",
    text: "text-emerald-300",
    border: "border-emerald-500/30",
    label: "Kapora Alındı (Sözleşme)",
  },
  Kaybedildi: {
    bg: "bg-red-500/20",
    text: "text-red-300",
    border: "border-red-500/30",
    label: "Kaybedildi",
  },
};

const ALL_STATUSES: MetaLeadStatus[] = [
  "Yeni",
  "Arandı",
  "Ulaşılamadı",
  "Teklif verildi",
  "Görüşmeye geldi",
  "Kapora alındı",
  "Kaybedildi",
];

export function MetaLeadsClient({
  initialLeads,
  initialStats,
  initialConfig,
  syncLogs,
}: MetaLeadsClientProps) {
  const [leads, setLeads] = useState<MetaLeadRecord[]>(initialLeads);
  const [stats, setStats] = useState(initialStats);
  const [config, setConfig] = useState(initialConfig);
  const [isPending, startTransition] = useTransition();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [campaignFilter, setCampaignFilter] = useState<string>("ALL");
  const [formFilter, setFormFilter] = useState<string>("ALL");
  const [dateRangeFilter, setDateRangeFilter] = useState<
    "ALL" | "TODAY" | "WEEK" | "MONTH"
  >("ALL");

  // Selected Lead for Detail Drawer
  const [selectedLead, setSelectedLead] = useState<MetaLeadRecord | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [statusChangeNote, setStatusChangeNote] = useState("");

  // Meta Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    appId: initialConfig.appId || "",
    appSecret: "",
    verifyToken: initialConfig.verifyToken,
    pageAccessToken: "",
    pageId: initialConfig.pageId || "",
    graphVersion: initialConfig.graphVersion || "v21.0",
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Status Change Handler
  const handleStatusUpdate = (
    leadId: string,
    newStatus: MetaLeadStatus,
    note?: string
  ) => {
    startTransition(async () => {
      try {
        const res = await updateMetaLeadStatus(leadId, newStatus, note);
        if (res.success) {
          toast.success(`Durum "${newStatus}" olarak güncellendi`);
          setLeads((prev) =>
            prev.map((l) => {
              if (l.id === leadId || l.leadgenId === leadId) {
                const history = l.statusHistory || [];
                history.unshift({
                  status: newStatus,
                  changedAt: new Date().toISOString(),
                  changedBy: "Admin",
                  note,
                });
                return { ...l, status: newStatus, statusHistory: history };
              }
              return l;
            })
          );

          if (selectedLead && (selectedLead.id === leadId || selectedLead.leadgenId === leadId)) {
            setSelectedLead((prev) =>
              prev
                ? {
                    ...prev,
                    status: newStatus,
                    statusHistory: [
                      {
                        status: newStatus,
                        changedAt: new Date().toISOString(),
                        changedBy: "Admin",
                        note,
                      },
                      ...(prev.statusHistory || []),
                    ],
                  }
                : null
            );
          }
        } else {
          toast.error(res.error || "Güncelleme başarısız");
        }
      } catch {
        toast.error("Bağlantı hatası oluştu");
      }
    });
  };

  // Add Note Handler
  const handleAddNote = (leadId: string) => {
    if (!newNoteContent.trim()) return;

    startTransition(async () => {
      try {
        const res = await addMetaLeadNote(leadId, newNoteContent);
        if (res.success) {
          toast.success("Görüşme notu eklendi");
          const noteObj = {
            id: "note_" + Date.now(),
            author: "Admin",
            content: newNoteContent.trim(),
            createdAt: new Date().toISOString(),
          };

          setLeads((prev) =>
            prev.map((l) =>
              l.id === leadId || l.leadgenId === leadId
                ? { ...l, notes: [noteObj, ...(l.notes || [])] }
                : l
            )
          );

          if (selectedLead && (selectedLead.id === leadId || selectedLead.leadgenId === leadId)) {
            setSelectedLead((prev) =>
              prev ? { ...prev, notes: [noteObj, ...(prev.notes || [])] } : null
            );
          }

          setNewNoteContent("");
        }
      } catch {
        toast.error("Not eklenemedi");
      }
    });
  };

  // Manual Meta Graph API Sync
  const handleManualSync = () => {
    startTransition(async () => {
      try {
        toast.loading("Meta Graph API taranıyor...", { id: "meta_sync" });
        const res = await triggerMetaSyncManual(14);
        toast.dismiss("meta_sync");

        if (res.success) {
          toast.success(res.message || "Senkronizasyon tamamlandı!");
          // Reload page to refresh state cleanly
          window.location.reload();
        } else {
          toast.error(res.error || "Senkronizasyon başarısız");
        }
      } catch {
        toast.dismiss("meta_sync");
        toast.error("Meta API bağlantı hatası");
      }
    });
  };

  // Inject Test Lead Simulation
  const handleInjectTestLead = () => {
    startTransition(async () => {
      try {
        const res = await injectSimulatedTestLead();
        if (res.success && res.lead) {
          toast.success("Test leadi başarıyla oluşturuldu!");
          setLeads((prev) => [res.lead, ...prev]);
        }
      } catch {
        toast.error("Test leadi oluşturulamadı");
      }
    });
  };

  // Save Meta Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await saveMetaSettings(settingsForm);
        if (res.success) {
          toast.success("Meta entegrasyon ayarları kaydedildi!");
          setIsSettingsOpen(false);
          window.location.reload();
        } else {
          toast.error("Ayarlar kaydedilemedi");
        }
      } catch {
        toast.error("Hata oluştu");
      }
    });
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Panoya kopyalandı");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Export to CSV with UTF-8 BOM for Turkish Excel support
  const handleExportCsv = () => {
    if (leads.length === 0) {
      toast.error("Dışa aktarılacak kayıt bulunmuyor");
      return;
    }

    const headers = [
      "Kayıt Tarihi",
      "Ad Soyad",
      "Telefon",
      "E-Posta",
      "Etkinlik Türü",
      "Etkinlik Tarihi",
      "Davetli Sayısı",
      "Salon Tercihi",
      "Kampanya Adı",
      "Reklam Adı",
      "Form Adı",
      "Durum",
      "Özel Sorular / Cevaplar",
    ];

    const rows = filteredLeads.map((l) => [
      l.createdTime ? new Date(l.createdTime).toLocaleString("tr-TR") : "",
      l.fullName,
      l.phone,
      l.email || "",
      l.eventType || "",
      l.eventDate || "",
      l.guestCount || "",
      l.hallPreference || "",
      l.campaignName || "",
      l.adName || "",
      l.formName || "",
      l.status,
      (l.customFields || []).map((f) => `${f.label}: ${f.value}`).join(" | "),
    ]);

    const csvContent =
      "\uFEFF" +
      [headers, ...rows]
        .map((row) =>
          row
            .map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`)
            .join(";")
        )
        .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `elmira_meta_lead_kayitlari_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel/CSV dosyası başarıyla indirildi");
  };

  // KVKK: Anonymize a single lead record
  const handleAnonymizeLead = async (leadgenId: string) => {
    if (
      !window.confirm(
        "Bu adayın adı, telefonu ve e-posta adresi 6698 sayılı KVKK kapsamında kalıcı olarak maskelenecektir. Emin misiniz?"
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        const res = await anonymizeMetaLeadAction(leadgenId);
        if (res.success && res.lead) {
          toast.success("Kişisel veriler KVKK kapsamında başarıyla anonimleştirildi");
          setLeads((prev) =>
            prev.map((l) =>
              l.leadgenId === leadgenId || l.id === leadgenId ? res.lead! : l
            )
          );
          if (
            selectedLead &&
            (selectedLead.leadgenId === leadgenId || selectedLead.id === leadgenId)
          ) {
            setSelectedLead(res.lead);
          }
        } else {
          toast.error(res.error || "Anonimleştirme başarısız");
        }
      } catch {
        toast.error("Bir hata oluştu");
      }
    });
  };

  // KVKK: Data Retention cleanup (24+ months)
  const handleRetentionCleanup = async () => {
    if (
      !window.confirm(
        "KVKK veri saklama politikası uyarınca 24 aydan eski tüm lead kayıtlarının kişisel verileri (ad, telefon, e-posta) anonimleştirilecektir. Devam etmek istiyor musunuz?"
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        const res = await cleanExpiredLeadsAction(24);
        if (res.success) {
          toast.success(res.message);
          window.location.reload();
        } else {
          toast.error("İşlem tamamlanamadı");
        }
      } catch {
        toast.error("Bir hata oluştu");
      }
    });
  };

  // Unique Campaign & Form options for filter dropdowns
  const uniqueCampaigns = useMemo(() => {
    return Array.from(
      new Set(leads.map((l) => l.campaignName).filter(Boolean))
    ) as string[];
  }, [leads]);

  const uniqueForms = useMemo(() => {
    return Array.from(
      new Set(leads.map((l) => l.formName).filter(Boolean))
    ) as string[];
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        lead.fullName.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.campaignName && lead.campaignName.toLowerCase().includes(q)) ||
        (lead.adName && lead.adName.toLowerCase().includes(q)) ||
        (lead.eventType && lead.eventType.toLowerCase().includes(q));

      // 2. Status
      const matchesStatus =
        statusFilter === "ALL" ? true : lead.status === statusFilter;

      // 3. Campaign
      const matchesCampaign =
        campaignFilter === "ALL" ? true : lead.campaignName === campaignFilter;

      // 4. Form
      const matchesForm =
        formFilter === "ALL" ? true : lead.formName === formFilter;

      // 5. Date Range
      let matchesDate = true;
      if (dateRangeFilter !== "ALL") {
        const leadTime = new Date(lead.createdTime || lead.createdAt).getTime();
        const now = Date.now();
        if (dateRangeFilter === "TODAY") {
          const todayStart = new Date().setHours(0, 0, 0, 0);
          matchesDate = leadTime >= todayStart;
        } else if (dateRangeFilter === "WEEK") {
          matchesDate = leadTime >= now - 7 * 24 * 60 * 60 * 1000;
        } else if (dateRangeFilter === "MONTH") {
          matchesDate = leadTime >= now - 30 * 24 * 60 * 60 * 1000;
        }
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCampaign &&
        matchesForm &&
        matchesDate
      );
    });
  }, [
    leads,
    searchQuery,
    statusFilter,
    campaignFilter,
    formFilter,
    dateRangeFilter,
  ]);

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhooks/meta`
      : "https://elmiradavet.com/api/webhooks/meta";

  return (
    <div className="space-y-6">
      {/* TOKEN EXPIRY & CONFIG ALERT BANNER */}
      {(!config.tokenStatus.isConfigured ||
        !config.tokenStatus.isValid ||
        config.tokenStatus.daysRemaining <= 7) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-cream">
                {!config.tokenStatus.isConfigured
                  ? "Meta Entegrasyonu Henüz Yapılandırılmadı"
                  : !config.tokenStatus.isValid
                  ? "Meta Page Access Token Geçersiz veya İptal Edilmiş"
                  : `Meta Access Token Süresi Dolmak Üzere (${config.tokenStatus.daysRemaining} gün kaldı)`}
              </h4>
              <p className="text-xs text-text-secondary mt-0.5">
                {!config.tokenStatus.isConfigured
                  ? "Instagram ve Facebook Lead Ads formlarından gelen taleplerin otomatik aktarılması için Page Access Token tanımlayın."
                  : "Reklam taleplerinin aksamaması için Meta Business Suite üzerinden yeni uzun ömürlü token oluşturup kaydedin."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-400 text-bg-primary text-xs font-semibold shrink-0 hover:bg-amber-300 transition-colors cursor-pointer"
          >
            Meta Ayarlarını Aç
          </button>
        </div>
      )}

      {/* TOP SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Bugün */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Bugün Gelen Lead</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-cream mt-1">
            {stats.todayCount}
          </div>
          <p className="text-[11px] text-text-muted mt-0.5">
            Son 24 saat içinde Meta Ads
          </p>
        </div>

        {/* Card 2: Bu Hafta */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Bu Hafta Gelen</span>
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-pink-400 mt-1">
            {stats.weekCount}
          </div>
          <p className="text-[11px] text-text-muted mt-0.5">
            Son 7 günde toplanan aday
          </p>
        </div>

        {/* Card 3: Dönüşüm Oranı */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Dönüşüm Oranı (Kapora)</span>
            <Sparkles className="w-3.5 h-3.5 text-gold" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-gold mt-1">
            %{stats.conversionRate}
          </div>
          <div className="w-full bg-bg-secondary h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gold h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.conversionRate)}%` }}
            />
          </div>
        </div>

        {/* Card 4: Toplam & Sözleşme */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Toplam / Kapora</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mt-1">
            {stats.kaporaCount} <span className="text-xs text-text-muted font-normal">/ {stats.total} Lead</span>
          </div>
          <p className="text-[11px] text-text-muted mt-0.5">
            Kesinleşen salon rezervasyonu
          </p>
        </div>
      </div>

      {/* CAMPAIGN DISTRIBUTION BAR (IF ANY) */}
      {stats.campaignDistribution.length > 0 && (
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-cream">
              Kampanya Bazında Dağılım
            </span>
            <span className="text-[11px] text-text-muted">
              {stats.campaignDistribution.length} aktif kampanya
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-bg-secondary overflow-hidden flex">
            {stats.campaignDistribution.map((c, i) => {
              const colors = [
                "bg-pink-500",
                "bg-purple-500",
                "bg-blue-500",
                "bg-gold",
                "bg-emerald-500",
              ];
              return (
                <div
                  key={c.name}
                  className={`${colors[i % colors.length]} h-full transition-all`}
                  style={{ width: `${c.percent}%` }}
                  title={`${c.name}: ${c.count} lead (%${c.percent})`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-2.5 text-[11px] text-text-muted">
            {stats.campaignDistribution.map((c, i) => {
              const dotColors = [
                "bg-pink-500",
                "bg-purple-500",
                "bg-blue-500",
                "bg-gold",
                "bg-emerald-500",
              ];
              return (
                <div key={c.name} className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${dotColors[i % dotColors.length]}`}
                  />
                  <span className="text-text-secondary truncate max-w-[180px]">
                    {c.name}
                  </span>
                  <span className="font-mono text-cream font-semibold">
                    ({c.count})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ACTION BAR: SEARCH, FILTERS, BUTTONS */}
      <div className="p-4 rounded-2xl bg-surface border border-border space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ad soyad, telefon, e-posta veya kampanya adı ara..."
              className="w-full pl-9 pr-4 py-2 bg-bg-secondary border border-border rounded-xl text-xs text-cream placeholder-text-muted focus:outline-hidden focus:border-gold"
            />
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 shrink-0">
            {/* Test Simulation Button */}
            <button
              onClick={handleInjectTestLead}
              disabled={isPending}
              className="px-3 py-2 rounded-xl bg-bg-secondary border border-border hover:border-gold/40 text-xs text-text-secondary hover:text-gold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              title="Meta Test Aracını simüle ederek örnek bir lead ekler"
            >
              <Zap className="w-3.5 h-3.5 text-gold" />
              <span>Test Leadi Ekle</span>
            </button>

            {/* Manual Sync Button */}
            <button
              onClick={handleManualSync}
              disabled={isPending}
              className="px-3 py-2 rounded-xl bg-bg-secondary border border-border hover:border-gold/40 text-xs text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              title="Graph API üzerinden son 14 günün form kayıtlarını çeker"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-blue-400 ${isPending ? "animate-spin" : ""}`}
              />
              <span>{isPending ? "Taranıyor..." : "Senkronize Et"}</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xl bg-bg-secondary border border-border hover:border-emerald-500/40 text-xs text-text-secondary hover:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              title="Tüm kayıtları Excel uyumlu CSV olarak indirir"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Excel / CSV</span>
            </button>

            {/* KVKK Retention Cleanup Button */}
            <button
              onClick={handleRetentionCleanup}
              disabled={isPending}
              className="px-3 py-2 rounded-xl bg-bg-secondary border border-border hover:border-amber-500/40 text-xs text-text-secondary hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              title="6698 Sayılı KVKK kapsamında 24 aydan eski lead kayıtlarının kişisel verilerini anonimleştirir"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>KVKK Temizliği (24+ Ay)</span>
            </button>

            {/* Settings Modal Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-2 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-opacity cursor-pointer whitespace-nowrap"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Meta Ayarları</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-bg-secondary px-2.5 py-1.5 rounded-xl border border-border">
            <span className="text-text-muted text-[11px]">Durum:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-cream font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="ALL" className="bg-bg-primary text-cream">
                Tüm Durumlar ({leads.length})
              </option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st} className="bg-bg-primary text-cream">
                  {st} ({leads.filter((l) => l.status === st).length})
                </option>
              ))}
            </select>
          </div>

          {/* Campaign Filter */}
          {uniqueCampaigns.length > 0 && (
            <div className="flex items-center gap-1.5 bg-bg-secondary px-2.5 py-1.5 rounded-xl border border-border max-w-xs">
              <span className="text-text-muted text-[11px] shrink-0">Kampanya:</span>
              <select
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
                className="bg-transparent text-cream font-medium focus:outline-hidden cursor-pointer truncate"
              >
                <option value="ALL" className="bg-bg-primary text-cream">
                  Tüm Kampanyalar
                </option>
                {uniqueCampaigns.map((c) => (
                  <option key={c} value={c} className="bg-bg-primary text-cream">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Form Filter */}
          {uniqueForms.length > 0 && (
            <div className="flex items-center gap-1.5 bg-bg-secondary px-2.5 py-1.5 rounded-xl border border-border max-w-xs">
              <span className="text-text-muted text-[11px] shrink-0">Form:</span>
              <select
                value={formFilter}
                onChange={(e) => setFormFilter(e.target.value)}
                className="bg-transparent text-cream font-medium focus:outline-hidden cursor-pointer truncate"
              >
                <option value="ALL" className="bg-bg-primary text-cream">
                  Tüm Formlar
                </option>
                {uniqueForms.map((f) => (
                  <option key={f} value={f} className="bg-bg-primary text-cream">
                    {f}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range Tabs */}
          <div className="flex items-center gap-1 ml-auto">
            {(["ALL", "TODAY", "WEEK", "MONTH"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRangeFilter(r)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  dateRangeFilter === r
                    ? "bg-gold text-bg-primary font-semibold"
                    : "bg-bg-secondary text-text-muted hover:text-text-primary"
                }`}
              >
                {r === "ALL"
                  ? "Tümü"
                  : r === "TODAY"
                  ? "Bugün"
                  : r === "WEEK"
                  ? "Bu Hafta"
                  : "Bu Ay"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LEADS DATA TABLE */}
      <div className="rounded-2xl bg-surface border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-bg-secondary/70 border-b border-border text-text-muted font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Tarih / Saat</th>
                <th className="py-3 px-4">Müşteri (Ad & İletişim)</th>
                <th className="py-3 px-4">Etkinlik & Tarih</th>
                <th className="py-3 px-4">Kampanya / Reklam</th>
                <th className="py-3 px-4">Form</th>
                <th className="py-3 px-4">Aşama / Durum</th>
                <th className="py-3 px-4 text-right">İşlem & İletişim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.map((lead) => {
                const cleanPhone = lead.phone.replace(/\D/g, "");
                const waUrl = `https://wa.me/90${cleanPhone.replace(/^0/, "")}?text=${encodeURIComponent(
                  `Merhaba Sayın ${lead.fullName}, Elmira Davet Salonu adına Instagram/Facebook reklamımız üzerinden doldurduğunuz ${lead.eventType || "düğün"} bilgi talebinizle ilgili sizlere ulaşıyoruz.`
                )}`;

                const dateObj = new Date(lead.createdTime || lead.createdAt);
                const formattedDate = dateObj.toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "short",
                });
                const formattedTime = dateObj.toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const statusStyle =
                  STATUS_COLORS[lead.status] || STATUS_COLORS.Yeni;

                return (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-bg-secondary/50 transition-colors cursor-pointer group"
                  >
                    {/* Tarih & Saat */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-cream font-medium block">
                        {formattedDate}
                      </span>
                      <span className="text-[10px] text-text-muted font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gold" />
                        {formattedTime}
                      </span>
                    </td>

                    {/* Müşteri Bilgisi */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-cream text-sm flex items-center gap-2">
                        <span>{lead.fullName}</span>
                        {lead.isTest && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-mono">
                            TEST
                          </span>
                        )}
                      </div>
                      <div className="text-text-secondary font-mono text-[11px] flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-gold" />
                        <span>{lead.phone}</span>
                      </div>
                      {lead.email && (
                        <div className="text-text-muted text-[11px] flex items-center gap-1.5">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[160px]">{lead.email}</span>
                        </div>
                      )}
                    </td>

                    {/* Etkinlik & Tarih */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-cream flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span>{lead.eventDate || "Tarih belirtilmedi"}</span>
                      </div>
                      <div className="text-text-secondary text-[11px] mt-0.5 font-medium">
                        {lead.eventType || "Düğün & Davet"}
                        {lead.guestCount ? ` (${lead.guestCount} Kişi)` : ""}
                      </div>
                    </td>

                    {/* Kampanya & Reklam */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="text-pink-400 font-semibold truncate text-[11px] flex items-center gap-1">
                        <Share2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">{lead.campaignName || "Meta Ads"}</span>
                      </div>
                      {lead.adName && (
                        <p className="text-[10px] text-text-muted truncate mt-0.5">
                          Reklam: {lead.adName}
                        </p>
                      )}
                    </td>

                    {/* Form Adı */}
                    <td className="py-3.5 px-4 max-w-[150px]">
                      <span className="text-[11px] text-text-secondary truncate block">
                        {lead.formName || lead.formId}
                      </span>
                    </td>

                    {/* Durum Dropdown */}
                    <td
                      className="py-3.5 px-4 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative inline-block">
                        <select
                          value={lead.status}
                          disabled={isPending}
                          onChange={(e) =>
                            handleStatusUpdate(
                              lead.id,
                              e.target.value as MetaLeadStatus
                            )
                          }
                          className={`text-xs font-semibold py-1.5 px-2.5 rounded-lg border appearance-none pr-6 cursor-pointer focus:outline-hidden ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {ALL_STATUSES.map((st) => (
                            <option
                              key={st}
                              value={st}
                              className="bg-bg-primary text-cream font-medium"
                            >
                              {st}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-text-muted absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>

                    {/* Hızlı İletişim Butonları */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp */}
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                          title="WhatsApp'tan Mesaj Gönder"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        {/* Phone Call */}
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-1.5 rounded-lg bg-gold/15 text-gold hover:bg-gold/25 transition-colors"
                          title="Telefonla Doğrudan Ara"
                        >
                          <Phone className="w-4 h-4" />
                        </a>

                        {/* Open Drawer */}
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="px-2.5 py-1.5 rounded-lg bg-surface border border-border text-[11px] text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
                        >
                          Detay
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-text-muted">
                    <Share2 className="w-8 h-8 text-gold mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Arama kriterlerine uygun Meta reklam talebi bulunamadı.</p>
                    <p className="text-xs text-text-muted mt-1">
                      Yukarıdaki "Test Leadi Ekle" veya "Senkronize Et" butonlarına basarak yeni kayıt ekleyebilirsiniz.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LEAD DETAIL SLIDE-OVER DRAWER / MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl h-full bg-surface border-l border-border shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-start justify-between bg-bg-secondary/50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-heading text-cream">
                    {selectedLead.fullName}
                  </h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      STATUS_COLORS[selectedLead.status]?.bg
                    } ${STATUS_COLORS[selectedLead.status]?.text} ${
                      STATUS_COLORS[selectedLead.status]?.border
                    }`}
                  >
                    {selectedLead.status}
                  </span>
                </div>
                <p className="text-xs text-text-muted font-mono mt-1">
                  Lead ID: #{selectedLead.leadgenId} | {selectedLead.formName}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-text-muted hover:text-text-primary p-1.5 rounded-xl hover:bg-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Quick Communication Box */}
              <div className="p-4 rounded-2xl bg-bg-secondary border border-border flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-text-muted block">Telefon</span>
                  <span className="text-sm font-mono font-bold text-cream">
                    {selectedLead.phone}
                  </span>
                  {selectedLead.email && (
                    <span className="text-xs text-text-secondary block mt-0.5">
                      {selectedLead.email}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/90${selectedLead.phone.replace(/\D/g, "").replace(/^0/, "")}?text=${encodeURIComponent(
                      `Merhaba Sayın ${selectedLead.fullName}, Elmira Davet Salonu adına reklamımız üzerinden ilettiğiniz talebinizle ilgili görüşmek isteriz.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="px-3 py-2 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 shadow-xs"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Ara</span>
                  </a>
                </div>
              </div>

              {/* Status Update Quick Selector */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Aşama / Durumu Güncelle
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {ALL_STATUSES.map((st) => {
                    const isCurrent = selectedLead.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusUpdate(selectedLead.id, st)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                          isCurrent
                            ? "bg-gold text-bg-primary font-bold border-gold shadow-xs"
                            : "bg-bg-secondary border-border text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Marketing Ad Info */}
              <div className="p-4 rounded-2xl bg-bg-secondary border border-border space-y-2">
                <span className="text-xs font-semibold text-gold uppercase tracking-wider block">
                  Reklam Kaynağı Detayları
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-text-muted block text-[11px]">Kampanya</span>
                    <span className="font-medium text-cream">{selectedLead.campaignName || "-"}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">Reklam</span>
                    <span className="font-medium text-cream">{selectedLead.adName || "-"}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">Hedef Salon</span>
                    <span className="font-medium text-cream">{selectedLead.hallPreference || "-"}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">Etkinlik & Tarih</span>
                    <span className="font-medium text-cream">
                      {selectedLead.eventType} | {selectedLead.eventDate || "Belirtilmedi"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ALL CUSTOM FORM ANSWERS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cream uppercase tracking-wider">
                    Form Soruları & Müşteri Yanıtları ({selectedLead.customFields?.length || 0})
                  </span>
                  <span className="text-[10px] text-text-muted font-mono">
                    Form ID: {selectedLead.formId}
                  </span>
                </div>

                {selectedLead.customFields && selectedLead.customFields.length > 0 ? (
                  <div className="divide-y divide-border border border-border rounded-xl bg-bg-secondary/40 overflow-hidden">
                    {selectedLead.customFields.map((cf, idx) => (
                      <div key={idx} className="p-3 text-xs">
                        <span className="text-text-muted block text-[11px] mb-0.5">
                          {cf.label || cf.name}
                        </span>
                        <span className="font-medium text-cream block whitespace-pre-line">
                          {cf.value || "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-bg-secondary border border-border text-xs text-text-muted text-center">
                    Standart temel sorular dışında ek özel soru bulunmuyor.
                  </div>
                )}
              </div>

              {/* CRM NOTES & CALL LOGS */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-cream uppercase tracking-wider block">
                  Görüşme Notları & Takip
                </span>

                {/* Add Note Input */}
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Görüşme özeti, bütçe detayı veya randevu notu ekleyin..."
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold resize-none"
                  />
                  <button
                    onClick={() => handleAddNote(selectedLead.id)}
                    disabled={isPending || !newNoteContent.trim()}
                    className="px-4 py-1.5 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer ml-auto block"
                  >
                    Notu Kaydet
                  </button>
                </div>

                {/* Notes List */}
                <div className="space-y-2">
                  {(selectedLead.notes || []).map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl bg-bg-secondary border border-border text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-text-muted">
                        <span className="font-semibold text-gold">{n.author}</span>
                        <span>{new Date(n.createdAt).toLocaleString("tr-TR")}</span>
                      </div>
                      <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                        {n.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* STATUS AUDIT TRAIL */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-cream uppercase tracking-wider block">
                  Durum Geçmişi
                </span>
                <div className="p-3 rounded-xl bg-bg-secondary border border-border space-y-2 max-h-40 overflow-y-auto">
                  {(selectedLead.statusHistory || []).map((h, i) => (
                    <div key={i} className="text-xs flex items-start gap-2 border-b border-border/40 pb-2 last:border-0 last:pb-0">
                      <Clock className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-cream">
                            {h.status}
                          </span>
                          <span className="text-text-muted text-[10px] font-mono">
                            {new Date(h.changedAt).toLocaleString("tr-TR")}
                          </span>
                        </div>
                        {h.note && (
                          <p className="text-[11px] text-text-muted mt-0.5">
                            {h.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-bg-secondary flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-text-muted">
                  Oluşturulma:{" "}
                  {new Date(
                    selectedLead.createdTime || selectedLead.createdAt
                  ).toLocaleString("tr-TR")}
                </span>
                {selectedLead.isAnonymized && (
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                    KVKK Anonimleştirildi
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!selectedLead.isAnonymized && (
                  <button
                    onClick={() => handleAnonymizeLead(selectedLead.leadgenId)}
                    disabled={isPending}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Bu adayın ad, telefon ve e-posta verilerini KVKK gereği maskeler"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>KVKK Anonimleştir</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-secondary hover:text-text-primary"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* META SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-surface border border-border rounded-2xl shadow-xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-heading text-cream">Meta Lead Ads Entegrasyonu</h3>
                <p className="text-xs text-text-muted">
                  Webhook URL, Verify Token ve Page Access Token bilgilerinizi buradan yönetin
                </p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-text-muted hover:text-text-primary p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Webhook Connection Endpoints Helper Box */}
            <div className="p-4 rounded-xl bg-bg-secondary border border-border space-y-3">
              <span className="text-xs font-semibold text-gold uppercase tracking-wider block">
                Meta Developer Portalında Tanımlanacak Bilgiler
              </span>

              {/* Callback URL */}
              <div>
                <label className="block text-[11px] text-text-muted mb-1">
                  1. Geri Arama URL'si (Callback URL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="flex-1 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-mono text-cream"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(webhookUrl, "url")}
                    className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-secondary hover:text-gold flex items-center gap-1"
                  >
                    {copiedKey === "url" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Kopyala</span>
                  </button>
                </div>
              </div>

              {/* Verify Token */}
              <div>
                <label className="block text-[11px] text-text-muted mb-1">
                  2. Doğrulama Jetonu (Verify Token)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={settingsForm.verifyToken}
                    className="flex-1 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-mono text-cream"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(settingsForm.verifyToken, "token")}
                    className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-secondary hover:text-gold flex items-center gap-1"
                  >
                    {copiedKey === "token" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Kopyala</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Settings Form */}
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Meta Page Access Token (Sayfa Erişim Jetonu) *
                </label>
                <input
                  type="password"
                  value={settingsForm.pageAccessToken}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      pageAccessToken: e.target.value,
                    })
                  }
                  placeholder={
                    config.tokenStatus.isConfigured
                      ? `Mevcut şifreli token: ${config.tokenStatus.maskedToken} (Değiştirmek için yeni token yapıştırın)`
                      : "EAAB... ile başlayan uzun ömürlü sayfa erişim tokenı"
                  }
                  className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold font-mono"
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Tokenlar AES-256-GCM ile şifreli saklanır ve güvenle korunur.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Meta App Secret (Uygulama Gizli Kodu)
                  </label>
                  <input
                    type="password"
                    value={settingsForm.appSecret}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        appSecret: e.target.value,
                      })
                    }
                    placeholder="X-Hub-Signature-256 doğrulaması için"
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Meta App ID (Uygulama Kimliği)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.appId}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        appId: e.target.value,
                      })
                    }
                    placeholder="Örn: 104582948291..."
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Facebook Sayfa ID (Page ID)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.pageId}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        pageId: e.target.value,
                      })
                    }
                    placeholder="Örn: 1827482910..."
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Graph API Sürümü (.env'den okunur)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.graphVersion}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        graphVersion: e.target.value,
                      })
                    }
                    placeholder="v21.0"
                    className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary rounded-xl"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-semibold bg-gradient-gold text-bg-primary rounded-xl shadow-xs hover:opacity-95 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
